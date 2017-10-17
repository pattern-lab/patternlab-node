'use strict';

/**
 *  @module Annotations Exporter
 */
const path = require('path');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const mp = require('./markdown_parser');

/**
 * @constant {function} annotations_exporter
 * @param {*} pl patternlab configuration
 */
const annotations_exporter = function (pl) {

  const paths = pl.config.paths;
  let oldAnnotations;

  /**
   * 
   * @function parseAnnotationsJS
   * @returns {object} oldAnnotationsJSON.comments
   */
  function parseAnnotationsJS() {
    /** Attempt to Read File */
    try {
      oldAnnotations = fs.readFileSync(path.resolve(paths.source.annotations, 'annotations.js'), 'utf8');
    } catch (ex) {
      if (pl.config.debug) {
        console.log('annotations.js file missing from ' + paths.source.annotations + '. This may be expected.');
      }
      return [];
    }

    oldAnnotations = oldAnnotations.replace('var comments = ', '');
    oldAnnotations = oldAnnotations.replace('};', '}');

    try {
      var oldAnnotationsJSON = JSON.parse(oldAnnotations);
    } catch (ex) {
      console.log('There was an error parsing JSON for ' + paths.source.annotations + 'annotations.js');
      console.log(ex);
      return [];
    }
    return oldAnnotationsJSON.comments;
  }

/**
 * 
 * @function buildAnnotationMD
 * @param {any} annotationsYAML 
 * @param {any} markdown_parser 
 * @return {object} annotation
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
 * 
 * @function parseMDFile
 * @param {any} annotations 
 * @param {any} parser
 * @return {function}
 */
  function parseMDFile(annotations, parser) {
    //let annotations = annotations;
    const markdown_parser = parser;

    /**
   * @function parseMDFile
   * @description take the annotation snippets and split them on our custom delimiter
   * @param {string} filePath 
   * @return {boolean} false
   */
    return function (filePath) {
      const annotationsMD = fs.readFileSync(path.resolve(filePath), 'utf8');

      const annotationsYAML = annotationsMD.split('~*~');
      for (let i = 0; i < annotationsYAML.length; i++) {
        const annotation = buildAnnotationMD(annotationsYAML[i], markdown_parser);
        annotations.push(annotation);
      }
      return false;
    };
  }

  /**
   * @function parseAnnotationsMD
   * @description Converts the *.md file yaml list into an array of annotations
   * @returns {array} annotations
   */
  function parseAnnotationsMD() {
    const markdown_parser = new mp();
    const annotations = [];
    const mdFiles = glob.sync(paths.source.annotations + '/*.md');

    mdFiles.forEach(parseMDFile(annotations, markdown_parser));
    return annotations;
  }

  /**
   * @function gatherAnnotations
   * @description Gathers all annotations
   * @returns {array} Returns the new array of combined values.
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
    }
  };

};


module.exports = annotations_exporter;
