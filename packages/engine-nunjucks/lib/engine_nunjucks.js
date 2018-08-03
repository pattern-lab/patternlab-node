/*
 * Nunjucks pattern engine for patternlab-node
 *
 * Dan White.
 * Licensed under the MIT license.
 *
 */

/*
 * ENGINE SUPPORT LEVEL:
 *
 * Mostly full. Partial calls and lineage hunting are supported.
 * Nunjucks does not support the mustache-specific syntax
 * extensions, style modifiers and pattern parameters, because
 * their use cases are addressed by the core Nunjucks feature set.
 * Pattern Lab's listitems feature is still written in the
 * mustache syntax.
 *
 */

'use strict';

let fs = require('fs-extra'),
  path = require('path'),
  plPath = process.cwd(),
  plConfig = require(path.join(plPath, 'patternlab-config.json')),
  nunjucks = require('nunjucks'),
  env = nunjucks.configure(plConfig.paths.source.patterns),
  partialRegistry = [];

////////////////////////////
// LOAD ANY USER NUNJUCKS CONFIGURATIONS
////////////////////////////
try {
  let nunjucksConfig = require(path.join(
    plPath,
    'patternlab-nunjucks-config.js'
  ));
  if (typeof nunjucksConfig === 'function') {
    nunjucksConfig(nunjucks, env);
  }
} catch (err) {}

////////////////////////////
// HELPER FUNCTIONS
// https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
// Might do some research on the solution.
////////////////////////////
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(
      new RegExp(
        str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, '\\$&'),
        ignore ? 'gi' : 'g'
      ),
      typeof str2 === 'string' ? str2.replace(/\$/g, '$$$$') : str2
    );
  };
}

////////////////////////////
// NUNJUCKS ENGINE
////////////////////////////
let engine_nunjucks = {
  engine: nunjucks,
  engineName: 'nunjucks',
  engineFileExtension: '.njk',

  //Important! Must be false for Nunjucks' block inheritance to work. Otherwise Nunjucks sees them as being defined more than once.
  expandPartials: false,

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{%\s*(?:extends|include|import|from)\s+(?:'[^']+'|"[^"]+").*%}/g,
  findPartialKeyRE: /{%\s*(?:extends|include|import|from)\s+('[^']+'|"[^"]+")/,
  findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g, // still requires mustache style syntax because of how PL implements lists

  // render it
  renderPattern: function renderPattern(pattern, data) {
    try {
      // replace pattern names with their full path so Nunjucks can find them.
      pattern.extendedTemplate = this.replacePartials(pattern);
      let result = nunjucks.renderString(pattern.extendedTemplate, data);
      return Promise.resolve(result);
    } catch (err) {
      console.error('Failed to render pattern: ' + pattern.name);
    }
  },

  // find and return any Nunjucks style includes/imports/extends within pattern
  findPartials: function findPartials(pattern) {
    let matches = pattern.template.match(this.findPartialsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and return it.
  findPartial: function(partialString) {
    try {
      let partial = partialString.match(this.findPartialKeyRE)[1];
      partial = partial.replace(/["']/g, '');
      return partial;
    } catch (err) {
      console.error(
        'Error occured when trying to find partial name in: ' + partialString
      );
    }
  },

  // keep track of partials and their paths so we can replace the name with the path
  registerPartial: function(pattern) {
    // only register each partial once. Otherwise we'll eat up a ton of memory.
    if (partialRegistry.indexOf(pattern.patternPartial) === -1) {
      partialRegistry[pattern.patternPartial] = pattern.relPath.replace(
        /\\/g,
        '/'
      );
    }
  },

  replacePartials: function(pattern) {
    try {
      let partials = this.findPartials(pattern);
      if (partials !== null) {
        for (let i = 0; i < partials.length; i++) {
          // e.g. {% include "atoms-parent" %}
          let partialName = this.findPartial(partials[i]); // e.g. atoms-parent
          let partialFullPath = partialRegistry[partialName]; // e.g. 00-atoms/01-parent.njk
          let newPartial = partials[i].replaceAll(
            partialName,
            partialFullPath,
            true
          ); // e.g. {% include "00-atoms/01-parent.njk" %}
          pattern.extendedTemplate = pattern.extendedTemplate.replaceAll(
            partials[i],
            newPartial,
            true
          );
        }
      }
      return pattern.extendedTemplate;
    } catch (err) {
      console.error(
        'Error occurred in replacing partial names with paths for patern: ' +
          pattern.name
      );
    }
  },

  // still requires the mustache syntax because of the way PL handles lists
  findListItems: function(pattern) {
    let matches = pattern.template.match(this.findListItemsRE);
    return matches;
  },

  // handled by nunjucks. This is here to keep PL from erroring
  findPartialsWithStyleModifiers: function() {
    return null;
  },

  // handled by nunjucks. This is here to keep PL from erroring
  findPartialsWithPatternParameters: function() {
    return null;
  },

  spawnFile: function(config, fileName) {
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
  spawnMeta: function(config) {
    this.spawnFile(config, '_00-head.njk');
    this.spawnFile(config, '_01-foot.njk');
  },
};

module.exports = engine_nunjucks;
