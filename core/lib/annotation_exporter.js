"use strict";

var path = require('path'),
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
    try {
      var oldAnnotationsJSON = JSON5.parse(oldAnnotations.trim().slice(0, -1));
    } catch (ex) {
      console.log('There was an error parsing JSON for ' + paths.source.annotations + 'annotations.js');
      console.log(ex);
      return [];
    }
    return oldAnnotationsJSON.comments;
  }

  /*
   Converts the annotations.md file yaml list into an array of annotations
   */
  function parseAnnotationsMD() {
    var markdown_parser = new mp();
    var annotations = [];

    //attempt to read the file
    var annotationsMD = '';
    try {
      annotationsMD = fs.readFileSync(path.resolve(paths.source.annotations, 'annotations.md'), 'utf8');
    } catch (ex) {
      if (pl.config.debug) {
        console.log('annotations.md file missing from ' + paths.source.annotations + '. This may be expected.');
      }
      return [];
    }

    //take the annotation snippets and split them on our custom delimiter
    var annotationsYAML = annotationsMD.split('~*~');

    for (var i = 0; i < annotationsYAML.length; i++) {
      var annotation = {};

      var markdownObj = markdown_parser.parse(annotationsYAML[i]);

      annotation.el = markdownObj.el || markdownObj.selector;
      annotation.title = markdownObj.title;
      annotation.comment = markdownObj.markdown;

      annotations.push(annotation);
    }
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
