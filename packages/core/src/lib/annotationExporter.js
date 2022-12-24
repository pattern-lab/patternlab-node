'use strict';
const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const mp = require('./markdown_parser');
const logger = require('./log');

const annotationExporter = function (pl) {
  const paths = pl.config.paths;

  /**
   * Parses JS annotations.
   * @returns array of comments that used to be wrapped in raw JS
   */
  function parseAnnotationsJSON() {
    const jsonPath = path.resolve(paths.source.annotations, 'annotations.json');
    let annotations;

    //attempt to read the file
    try {
      if (fs.pathExistsSync(jsonPath)) {
        //read the new file
        annotations = fs.readFileSync(jsonPath, 'utf8');
      } else {
        //read the old file
        const jsPath = path.resolve(paths.source.annotations, 'annotations.js');

        annotations = fs
          .readFileSync(jsPath, 'utf8')
          .replace(/^\s*var comments ?= ?/, '')
          .replace(/};\s*$/, '}');

        logger.info(
          `Please convert ${jsPath} to JSON and rename it annotations.json.`
        );
      }
    } catch (ex) {
      logger.debug(
        `annotations.json file missing from ${paths.source.annotations}. This may be expected if you do not use annotations or are using markdown.`
      );
      return [];
    }

    try {
      const annotationsJSON = JSON.parse(annotations);
      return annotationsJSON.comments;
    } catch (ex) {
      logger.error(`There was an error parsing JSON for ${jsonPath}`);
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
    const annotationsJS = parseAnnotationsJSON();
    const annotationsMD = parseAnnotationsMD();
    return _.unionBy(annotationsJS, annotationsMD, 'el');
  }

  return {
    gather: function () {
      return gatherAnnotations();
    },
    gatherJSON: function () {
      return parseAnnotationsJSON();
    },
    gatherMD: function () {
      return parseAnnotationsMD();
    },
  };
};

module.exports = annotationExporter;
