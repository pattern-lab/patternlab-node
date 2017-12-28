/*
 * Liquid pattern engine for patternlab-node - v2.X.X - 2017
 *
 * Cameron Roe
 * Licensed under the MIT license.
 *
 *
 */

"use strict";

const fs = require('fs');
const path = require('path');
const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);

const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')


var utils = require('./util_liquid');
var Liquid = require('liquidjs');



let engine = undefined;

// This holds the config from from core. The core has to call
// usePatternLabConfig() at load time for this to be populated.
let patternLabConfig = {};

module.exports = {
  engine: engine,
  engineName: 'liquid',
  engineFileExtension: '.liquid',
  isAsync: true,


  // // partial expansion is only necessary for Mustache templates that have
  // // style modifiers or pattern parameters (I think)
  // expandPartials: true,

  // regexes, stored here so they're only compiled once
  findPartialsRE: utils.partialsRE,
  findPartialsWithStyleModifiersRE: utils.partialsWithStyleModifiersRE,
  findPartialsWithPatternParametersRE: utils.partialsWithPatternParametersRE,
  findListItemsRE: utils.listItemsRE,
  findPartialRE: utils.partialRE,

  // render it
  renderPattern: function renderPattern(pattern, data, partials) {
    return engine.parseAndRender(pattern.template, data)
      .then(function(html){
        console.log(37, html)
        return html;
      }).catch(function(ex){
        console.log(40, ex)
      });
  },

  /**
   * Find regex matches within both pattern strings and pattern objects.
   *
   * @param {string|object} pattern Either a string or a pattern object.
   * @param {object} regex A JavaScript RegExp object.
   * @returns {array|null} An array if a match is found, null if not.
   */
  patternMatcher: function patternMatcher(pattern, regex) {
    var matches;
    if (typeof pattern === 'string') {
      matches = pattern.match(regex);
    } else if (typeof pattern === 'object' && typeof pattern.template === 'string') {
      matches = pattern.template.match(regex);
    }
    return matches;
  },

  // find and return any {{> template-name }} within pattern
  findPartials: function findPartials(pattern) {
    var matches = this.patternMatcher(pattern, this.findPartialsRE);
    return matches;
  },
  findPartialsWithStyleModifiers: function (pattern) {
    var matches = this.patternMatcher(pattern, this.findPartialsWithStyleModifiersRE);
    return matches;
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function (pattern) {
    var matches = this.patternMatcher(pattern, this.findPartialsWithPatternParametersRE);
    return matches;
  },
  findListItems: function (pattern) {
    var matches = this.patternMatcher(pattern, this.findListItemsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial_new: function (partialString) {
    var partial = partialString.replace(this.findPartialRE, '$1');
    return partial;
  },

  // GTP: the old implementation works better. We might not need
  // this.findPartialRE anymore if it works in all cases!
  findPartial: function (partialString) {
    //strip out the template cruft
    var foundPatternPartial = partialString.replace("{{> ", "").replace(" }}", "").replace("{{>", "").replace("}}", "");

    // remove any potential pattern parameters. this and the above are rather brutish but I didn't want to do a regex at the time
    if (foundPatternPartial.indexOf('(') > 0) {
      foundPatternPartial = foundPatternPartial.substring(0, foundPatternPartial.indexOf('('));
    }

    //remove any potential stylemodifiers.
    foundPatternPartial = foundPatternPartial.split(':')[0];

    return foundPatternPartial;
  },

  /**
   * Accept a Pattern Lab config object from the core and put it in
   * this module's closure scope so we can configure engine behavior.
   *
   * @param {object} config - the global config object from core
   */
  usePatternLabConfig: function (config) {
    patternLabConfig = config;
    engine = Liquid({
      dynamicPartials: false,
      root: [getDirectories(patternLabConfig.paths.source.patterns)]
    });
  }
};
