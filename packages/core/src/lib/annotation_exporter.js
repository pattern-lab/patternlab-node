'use strict';
const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const mp = require('./markdown_parser');
const logger = require('./log');

const annotations_exporter = function (pl) {
  const paths = pl.config.paths;
  let oldAnnotations;

  /**
   * Parses JS annotations.
   * @returns array of comments that used to be wrapped in raw JS
   */
  function parseAnnotationsJS() {
    //attempt to read the file
    try {
      oldAnnotations = fs.readFileSync(
        path.resolve(paths.source.annotations, 'annotations.js'),
        'utf8'
      );
    } catch (ex) {
      logger.debug(
        `annotations.js file missing from ${paths.source.annotations}. This may be expected if you do not use annotations or are using markdown.`
      );
      return [];
    }

    //parse as JSON by removing the old wrapping js syntax. comments and the trailing semi-colon
    oldAnnotations = oldAnnotations.replace('var comments = ', '');
    oldAnnotations = oldAnnotations.replace('};', '}');

    try {
      const oldAnnotationsJSON = JSON.parse(oldAnnotations);
      return oldAnnotationsJSON.comments;
    } catch (ex) {
      logger.error(
        `There was an error parsing JSON for ${paths.source.annotations}annotations.js`
      );
      return [];
    }
  }

  /**
   * Build the annotation markdown.
   * @param annotationsYAML
   * @param markdown_parser
   * @returns annotation
   */
  function buildAnnotationMD(annotationsYAML, markdown_parser) {
    const annotation = {};
    const markdownObj = markdown_parser.parse(annotationsYAML);

    annotation.el = markdownObj.el || markdownObj.selector;
    annotation.title = markdownObj.title;
    annotation.comment = markdownObj.markdown;
    return annotation;
  }

  /**
   * Parse markdown file annotations.
   * @param annotations
   * @param parser
   */
  function parseMDFile(annotations, parser) {
    //let annotations = annotations;
    const markdown_parser = parser;

    return function (filePath) {
      const annotationsMD = fs.readFileSync(path.resolve(filePath), 'utf8');

      //take the annotation snippets and split them on our custom delimiter
      const annotationsYAML = annotationsMD.split('~*~');
      for (let i = 0; i < annotationsYAML.length; i++) {
        const annotation = buildAnnotationMD(
          annotationsYAML[i],
          markdown_parser
        );
        annotations.push(annotation);
      }
      return false;
    };
  }

  /**
   * Converts the *.md file yaml list into an array of annotations
   *
   * @returns annotations
   */
  function parseAnnotationsMD() {
    const markdown_parser = new mp();
    const annotations = [];
    const mdFiles = glob.sync(paths.source.annotations + '/*.md');

    mdFiles.forEach(parseMDFile(annotations, markdown_parser));
    return annotations;
  }

  /**
   * Gathers JS & MD annotations.
   *
   * @returns array of annotations
   */
  function gatherAnnotations() {
    const annotationsJS = parseAnnotationsJS();
    const annotationsMD = parseAnnotationsMD();
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
    },
  };
};

module.exports = annotations_exporter;
