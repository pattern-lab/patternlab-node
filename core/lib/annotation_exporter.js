"use strict";

var annotations_exporter = function (pl) {
  var path = require('path'),
    fs = require('fs-extra'),
    JSON5 = require('json5'),
    _ = require('lodash'),
    md = require('markdown-it')(),
    paths = pl.config.paths;

  /*
  Returns the array of comments that used to be wrapped in raw JS.
   */
  function parseAnnotationsJS() {
    //attempt to read the file
    try {
      var oldAnnotations = fs.readFileSync(path.resolve(paths.source.annotations, 'annotations.js'), 'utf8');
    } catch (ex) {
      console.log(ex, 'annotations.js file missing from ' + paths.source.annotations + '. This may be expected.');
    }

    //parse as JSON by removing the old wrapping js syntax. comments and the trailing semi-colon
    oldAnnotations = oldAnnotations.replace('var comments = ', '');
    try {
      var oldAnnotationsJSON = JSON5.parse(oldAnnotations.trim().slice(0, -1));
    } catch (ex) {
      console.log('There was an error parsing JSON for ' + paths.source.annotations + 'annotations.js');
      console.log(ex);
    }
    return oldAnnotationsJSON.comments;
  }

  /*
   Converts the annotations.md file yaml list into an array of annotations
   */
  function parseAnnotationsMD() {
    var annotations = [];

    //attempt to read the file
    var annotationsMD = '';
    try {
      annotationsMD = fs.readFileSync(path.resolve(paths.source.annotations, 'annotations.md'), 'utf8');
    } catch (ex) {
      console.log(ex, 'annotations.md file missing from ' + paths.source.annotations + '. This may be expected.');
    }

    //take the annotation snippets and split them on our custom delimiter
    var annotationsYAML = annotationsMD.split('~*~');
    for (var i = 0; i < annotationsYAML.length; i++) {
      var annotation = {};

      //for each annotation process the yaml frontmatter and markdown
      var annotationSnippet = annotationsYAML[i];
      var annotationsRE = /---\r?\n{1}([\s\S]*)---\r?\n{1}([\s\S]*)+/gm;
      var chunks = annotationsRE.exec(annotationSnippet);
      if (chunks && chunks[1] && chunks[2]) {

        //convert each yaml frontmatter key into an object key
        var frontmatter = chunks[1];
        var frontmatterLines = frontmatter.split(/\n/gm);
        for (var j = 0; j < frontmatterLines.length; j++) {
          var frontmatterLine = frontmatterLines[j];
          if (frontmatterLine.length > 0) {
            var frontmatterLineChunks = frontmatterLine.split(':'); //test this
            var frontmatterKey = frontmatterLineChunks[0].toLowerCase().trim();
            var frontmatterValueString = frontmatterLineChunks[1].trim();
            var frontmatterValue = frontmatterValueString.substring(1, frontmatterValueString.length - 1);
            if (frontmatterKey === 'el' || frontmatterKey === 'selector') {
              annotation.el = frontmatterValue;
            }
            if (frontmatterKey === 'title') {
              annotation.title = frontmatterValue;
            }
          }
        }

        //set the comment to the parsed markdown
        var annotationMarkdown = chunks[2];
        annotation.comment = md.render(annotationMarkdown);

        annotations.push(annotation);
      } else {
        console.log('annotations.md file not formatted as expected. Error parsing frontmatter and markdown out of ' + annotationSnippet);
      }
    }
    return annotations;
  }

  function gatherAnnotations() {
    var annotationsJS = parseAnnotationsJS();
    var annotationsMD = parseAnnotationsMD();
    var mergedAnnotations = _.unionBy(annotationsJS, annotationsMD, 'el');
    return mergedAnnotations;
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
