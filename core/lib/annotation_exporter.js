"use strict";

var path = require('path'),
  glob = require('glob'),
  fs = require('fs-extra'),
  JSON5 = require('json5'),
  _ = require('lodash'),
  mp = require('./markdown_parser');

var annotations_exporter = function (pl) {

  var paths = pl.config.paths;

  /*
  Returns the array of comments that used to be wrapped in raw JS.
   */
  function parseAnnotationsJS() {
    //attempt to read the file
    try {
      var oldAnnotations = fs.readFileSync(path.resolve(paths.source.annotations, 'annotations.js'), 'utf8');
    } catch (ex) {
      if (pl.config.debug) {
        console.log('annotations.js file missing from ' + paths.source.annotations + '. This may be expected.');
      }
      return [];
    }

    //parse as JSON by removing the old wrapping js syntax. comments and the trailing semi-colon
    oldAnnotations = oldAnnotations.replace('var comments = ', '');
    oldAnnotations = oldAnnotations.replace('};', '}');

    try {
      var oldAnnotationsJSON = JSON5.parse(oldAnnotations);
    } catch (ex) {
      console.log('There was an error parsing JSON for ' + paths.source.annotations + 'annotations.js');
      console.log(ex);
      return [];
    }
    return oldAnnotationsJSON.comments;
  }

  function buildAnnotationMD(annotationsYAML, markdown_parser) {
    var annotation = {};
    var markdownObj = markdown_parser.parse(annotationsYAML);

    annotation.el = markdownObj.el || markdownObj.selector;
    annotation.title = markdownObj.title;
    annotation.comment = markdownObj.markdown;
    return annotation;
  }

  function parseMDFile(annotations, parser) {
    var annotations = annotations;
    var markdown_parser = parser;

    return function (filePath) {
      var annotationsMD = fs.readFileSync(path.resolve(filePath), 'utf8');

    //take the annotation snippets and split them on our custom delimiter
      var annotationsYAML = annotationsMD.split('~*~');
      for (var i = 0; i < annotationsYAML.length; i++) {
        var annotation = buildAnnotationMD(annotationsYAML[i], markdown_parser);
        annotations.push(annotation);
      }
      return false;
    };
  }

  /*
   Converts the *.md file yaml list into an array of annotations
   */
  function parseAnnotationsMD() {
    var markdown_parser = new mp();
    var annotations = [];
    var mdFiles = glob.sync(paths.source.annotations + '/*.md');

    mdFiles.forEach(parseMDFile(annotations, markdown_parser));
    return annotations;
  }

  function gatherAnnotations() {
    var annotationsJS = parseAnnotationsJS();
    var annotationsMD = parseAnnotationsMD();
    return _.unionBy(annotationsJS, annotationsMD, 'el');
  }

  return {
    gather: function () {
      return gatherAnnotations();
    },
    gatherJS: function () {
      return parseAnnotationsJS();
    },
    gatherMD: function () {
      return parseAnnotationsMD();
    }
  };

};

module.exports = annotations_exporter;
