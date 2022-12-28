'use strict';

/*
 * underscore pattern engine for patternlab-node - v0.15.1 - 2015
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
 * Basic. We can't call partials from inside underscore templates yet, but we
 * can render templates with backing JSON.
 *
 */

const fs = require('fs-extra');
const path = require('path');

const _ = require('underscore');

const partialRegistry = {};
const errorStyling = `
<style>
  .plError {
    background: linear-gradient(to bottom, #f1f1f1 0%,#ffffff 60%);
    color: #444;
    padding: 30px;
  }
  .plError h1 {
    font-size: 16pt;
    color: #733;
    background: #fcfcfc;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 17px 30px;
    margin: -30px -30px 0 -30px;
  }
  .plError dt { font-weight: bold; }
</style>
`;

// extend underscore with partial-ing methods and other necessary tooling
// HANDLESCORE! UNDERBARS!

function addParentContext(data, currentContext) {
  return Object.assign({}, currentContext, data);
}

_.mixin({
  renderNamedPartial: function (partialKey, data, currentContext) {
    const compiledPartial = partialRegistry[partialKey];
    if (typeof compiledPartial !== 'function') {
      throw `Pattern ${partialKey} not found.`;
    }

    return _.renderPartial(compiledPartial, data, currentContext);
  },
  renderPartial: function (compiledPartial, dataIn, currentContext) {
    let data = dataIn || {};

    if (
      dataIn &&
      currentContext &&
      dataIn instanceof Object &&
      currentContext instanceof Object
    ) {
      data = addParentContext(data, currentContext);
    }

    return compiledPartial(data);
  },
  /* eslint-disable no-eval, no-unused-vars */
  getPath: function (pathString, currentContext, debug) {
    try {
      const result = eval('currentContext.' + pathString);
      if (debug) {
        console.log('getPath result = ', result);
      }
      return result;
    } catch (e) {
      return null;
    }
  },
});

const engine_underscore = {
  engine: _,
  engineName: 'underscore',
  engineFileExtension: ['.html', '.underscore'],

  // partial expansion is only necessary for Mustache templates that have
  // style modifiers or pattern parameters (I think)
  expandPartials: false,

  // regexes, stored here so they're only compiled once
  findPartialsRE:
    /<%=\s*_\.renderNamedPartial[ \t]*\(\s*("(?:[^"].*?)"|'(?:[^'].*?)').*?%>/g, // TODO
  findListItemsRE:
    /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g,

  // render it
  renderPattern: function renderPattern(pattern, data, partials) {
    let renderedHTML;
    let compiled;

    try {
      compiled = partialRegistry[pattern.patternPartial];
    } catch (e) {
      console.log(
        `Error looking up underscore template ${pattern.patternName}:`,
        pattern.extendedTemplate,
        e
      );
    }

    // This try-catch is necessary because references to undefined variables
    // in underscore templates are eval()ed directly as javascript, and as
    // such will throw very real exceptions that will shatter the whole build
    // process if we don't handle them.
    try {
      renderedHTML = compiled(
        _.extend(data || {}, {
          _allData: data,
          _partials: partials,
        })
      );
    } catch (e) {
      const errorMessage = `Error rendering underscore pattern "${
        pattern.patternName
      }" (${pattern.relPath}): [${e.toString()}]`;
      console.log(errorMessage);
      renderedHTML = `${errorStyling} <div class="plError">
<h1>Error rendering underscore pattern "${pattern.patternName}"</h1>
<dl>
  <dt>Message</dt><dd>${e.toString()}</dd>
  <dt>Partial name</dt><dd>${pattern.patternName}</dd>
  <dt>Template path</dt><dd>${pattern.relPath}</dd>
</dl>
</div>
`;
    }

    return renderedHTML;
  },

  registerPartial: function (pattern) {
    let compiled;

    try {
      const templateString = pattern.extendedTemplate || pattern.template;
      compiled = _.template(templateString);
    } catch (e) {
      console.log(
        `Error compiling underscore template ${pattern.patternName}:`,
        pattern.extendedTemplate,
        e
      );
    }
    partialRegistry[pattern.patternPartial] = compiled;
  },

  // find and return any {{> template-name }} within pattern
  findPartials: function findPartials(pattern) {
    const matches = pattern.template.match(this.findPartialsRE);
    return matches;
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function () {
    return [];
  },
  findListItems: function (pattern) {
    const matches = pattern.template.match(this.findListItemsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial: function (partialString) {
    const edgeQuotesMatcher = /^["']|["']$/g;
    const partialIDWithQuotes = partialString.replace(
      this.findPartialsRE,
      '$1'
    );
    const partialID = partialIDWithQuotes.replace(edgeQuotesMatcher, '');

    return partialID;
  },

  spawnFile: function (config, fileName) {
    const paths = config.paths;
    const metaFilePath = path.resolve(paths.source.meta, fileName);
    try {
      fs.statSync(metaFilePath);
    } catch (err) {
      //not a file, so spawn it from the included file
      const localMetaFilePath = path.resolve(__dirname, '_meta/', fileName);
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
    this.spawnFile(config, '_head.html');
    this.spawnFile(config, '_foot.html');
  },
};

module.exports = engine_underscore;
