'use strict';

/*
 * mustache pattern engine for patternlab-node
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

/*
 * ENGINE SUPPORT LEVEL:
 *
 * Full + extensions. Partial calls and lineage hunting are supported. Style
 * modifiers and pattern parameters are used to extend the core feature set of
 * Mustache templates.
 *
 */

const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');
const utilMustache = require('./util_mustache');

// This holds the config from from core. The core has to call
// usePatternLabConfig() at load time for this to be populated, which
// it does, so we're cool, right?
let patternLabConfig = {};

const engine_mustache = {
  engine: Mustache,
  engineName: 'mustache',
  engineFileExtension: '.mustache',

  // partial expansion is only necessary for Mustache templates that have
  // style modifiers or pattern parameters (I think)
  expandPartials: true,

  // regexes, stored here so they're only compiled once
  findPartialsRE: utilMustache.partialsRE,
  findPartialsWithStyleModifiersRE: utilMustache.partialsWithStyleModifiersRE,
  findPartialsWithPatternParametersRE:
    utilMustache.partialsWithPatternParametersRE,
  findListItemsRE: utilMustache.listItemsRE,
  findPartialRE: utilMustache.partialRE,

  // render it
  renderPattern: function renderPattern(pattern, data, partials) {
    try {
      if (partials) {
        return Promise.resolve(
          Mustache.render(pattern.extendedTemplate, data, partials)
        );
      }
      return Promise.resolve(Mustache.render(pattern.extendedTemplate, data));
    } catch (e) {
      console.log('e = ', e);
      return Promise.reject(e);
    }
  },

  /**
   * Find regex matches within both pattern strings and pattern objects.
   *
   * @param {string|object} pattern Either a string or a pattern object.
   * @param {object} regex A JavaScript RegExp object.
   * @returns {array|null} An array if a match is found, null if not.
   */
  patternMatcher: function patternMatcher(pattern, regex) {
    let matches;
    if (typeof pattern === 'string') {
      matches = pattern.match(regex);
    } else if (
      typeof pattern === 'object' &&
      typeof pattern.template === 'string'
    ) {
      matches = pattern.template.match(regex);
    }
    return matches;
  },

  spawnFile: function (config, fileName) {
    const paths = config.paths;
    const metaFilePath = path.resolve(paths.source.meta, fileName);
    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      //not a file, so spawn it from the included file
      const metaFileContent = fs.readFileSync(
        path.resolve(__dirname, '..', '_meta/', fileName),
        'utf8'
      );
      fs.outputFileSync(metaFilePath, metaFileContent);
    }
  },

  /**
   * Checks to see if the _meta directory has engine-specific head and foot files,
   * spawning them if not found.
   *
   * @param {object} config - the global config object from core, since we won't
   * assume it's already present
   */
  spawnMeta: function (config) {
    this.spawnFile(config, '_head.mustache');
    this.spawnFile(config, '_foot.mustache');
  },

  // find and return any {{> template-name }} within pattern
  findPartials: function findPartials(pattern) {
    return this.patternMatcher(pattern, this.findPartialsRE);
  },
  findPartialsWithStyleModifiers: function (pattern) {
    return this.patternMatcher(pattern, this.findPartialsWithStyleModifiersRE);
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function (pattern) {
    return this.patternMatcher(
      pattern,
      this.findPartialsWithPatternParametersRE
    );
  },
  findListItems: function (pattern) {
    return this.patternMatcher(pattern, this.findListItemsRE);
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial_new: function (partialString) {
    return partialString.replace(this.findPartialRE, '$1');
  },

  // GTP: the old implementation works better. We might not need
  // this.findPartialRE anymore if it works in all cases!
  findPartial: function (partialString) {
    //strip out the template cruft
    let foundPatternPartial = partialString
      .replace('{{> ', '')
      .replace(' }}', '')
      .replace('{{>', '')
      .replace('}}', '');

    // remove any potential pattern parameters. this and the above are rather brutish but I didn't want to do a regex at the time
    if (foundPatternPartial.indexOf('(') > 0) {
      foundPatternPartial = foundPatternPartial.substring(
        0,
        foundPatternPartial.indexOf('(')
      );
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
  },
};

module.exports = engine_mustache;
