/*
 * react pattern engine for patternlab-node - v0.1.0 - 2016
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */


"use strict";

const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Babel = require('babel-core');
const Hogan = require('hogan.js');
const beautify = require('js-beautify');
const cheerio = require('cheerio');
const webpack = require('webpack');
const _require = require;

// This holds the config from from core. The core has to call
// usePatternLabConfig() at load time for this to be populated.
let patternLabConfig = {};

const outputTemplate = Hogan.compile(
  fs.readFileSync(
    path.join(__dirname, './outputTemplate.mustache'),
    'utf8'
  )
);

let registeredComponents = {
  byModuleName: {},
  byGroup: {}
};

function moduleCodeString(pattern) {
  return pattern.template || pattern.extendedTemplate;
}

var engine_react = {
  engine: React,
  engineName: 'react',
  engineFileExtension: ['.jsx', '.js'],

  // hell no
  expandPartials: false,

  // regexes, stored here so they're only compiled once
  findPartialsRE: null,
  findPartialsWithStyleModifiersRE: null,
  findPartialsWithPatternParametersRE: null,
  findListItemsRE: null,
  findPartialRE: null,

  // render it
  renderPattern(pattern, data, partials) {
    try {
      let runtimeCode = [];

      // the all-important Babel transform, runtime version
      runtimeCode.push(Babel.transform(moduleCodeString(pattern), {
        presets: [ require('babel-preset-react') ],
        plugins: [[require('babel-plugin-transform-es2015-modules-umd'), {
          globals: {
            "react": "React"
          }
        }]]
      }).code);

      return outputTemplate.render({
        patternPartial: pattern.patternPartial,
        json: JSON.stringify(data),
        htmlOutput: ReactDOMServer.renderToStaticMarkup(
          React.createFactory(pattern.module)(data)
        ),
        runtimeCode: runtimeCode.join(';')
      });
    }
    catch (e) {
	    console.log("Error rendering React pattern.", e);
	    return "";
    }
  },

  registerPartial(pattern) {
    const customRequire = function (id) {
      const registeredPattern = registeredComponents.byModuleName[id];
      return registeredPattern ? registeredPattern.module : _require(id);
    };

    // the all-important Babel transform, server-side version
    const compiledModule = Babel.transform(moduleCodeString(pattern), {
      presets: [ require('babel-preset-react') ],
      plugins: [ require('babel-plugin-transform-es2015-modules-commonjs') ]
    });

    // add to registry
    registeredComponents.byModuleName[pattern.patternBaseName] = pattern;

    // eval() module code in this little scope that injects our
    // custom wrap of require();
    ((require) => {
      /* eslint-disable no-eval */
      pattern.module = eval(compiledModule.code);
    })(customRequire);
  },

  /**
   * Find regex matches within both pattern strings and pattern objects.
   *
   * @param {string|object} pattern Either a string or a pattern object.
   * @param {object} regex A JavaScript RegExp object.
   * @returns {array|null} An array if a match is found, null if not.
   */
  patternMatcher(pattern, regex) {
    var matches;
    if (typeof pattern === 'string') {
      matches = pattern.match(regex);
    } else if (typeof pattern === 'object' && typeof pattern.template === 'string') {
      matches = pattern.template.match(regex);
    }
    return matches;
  },

  // find and return any {{> template-name }} within pattern
  findPartials(pattern) {
    return [];
  },
  findPartialsWithStyleModifiers(pattern) {
    return [];
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters(pattern) {
    return [];
  },
  findListItems(pattern) {
    return [];
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial(partialString) {
    return [];
  },

  rawTemplateCodeFormatter(unformattedString) {
    return beautify(unformattedString, {e4x: true, indent_size: 2});
  },

  renderedCodeFormatter(unformattedString) {
    return unformattedString;
  },

  markupOnlyCodeFormatter(unformattedString, pattern) {
    const $ = cheerio.load(unformattedString);
    return beautify.html($('.reactPatternContainer').html(), {indent_size: 2});
  },

  /**
   * Add custom output files to the pattern output
   * @param {object} patternlab - the global state object
   * @returns {(object|object[])} - an object or array of objects,
   * each with two properties: path, and content
   */
  addOutputFiles(paths, patternlab) {

    return [];
  },


  /**
   * Accept a Pattern Lab config object from the core and put it in
   * this module's closure scope so we can configure engine behavior.
   *
   * @param {object} config - the global config object from core
   */
  usePatternLabConfig: function (config) {
    patternLabConfig = config;
  }

};

module.exports = engine_react;
