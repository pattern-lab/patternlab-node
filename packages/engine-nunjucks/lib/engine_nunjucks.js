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

const fs = require('fs-extra');
const path = require('path');
const plPath = process.cwd();
const plConfig = require(path.join(plPath, 'patternlab-config.json'));
const nunjucks = require('nunjucks');
const partialRegistry = [];

// Create Pattern Loader
// Since Pattern Lab includes are not path based we need a custom loader for Nunjucks.
function PatternLoader() {}

PatternLoader.prototype.getSource = function(name) {
  const fullPath = path.resolve(
    plConfig.paths.source.patterns,
    partialRegistry[name]
  );
  return {
    src: fs.readFileSync(fullPath, 'utf-8'),
    path: fullPath,
    noCache: true,
  };
};

const env = new nunjucks.Environment(new PatternLoader());

// Load any user Defined configurations
try {
  const nunjucksConfig = require(path.join(
    plPath,
    'patternlab-nunjucks-config.js'
  ));
  if (typeof nunjucksConfig === 'function') {
    nunjucksConfig(env);
  }
} catch (err) {}

// Nunjucks Engine
const engine_nunjucks = {
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
      const result = env.renderString(pattern.extendedTemplate, data);
      return Promise.resolve(result);
    } catch (err) {
      console.error('Failed to render pattern: ' + pattern.name);
      console.error(err);
    }
  },

  // find and return any Nunjucks style includes/imports/extends within pattern
  findPartials: function findPartials(pattern) {
    const matches = pattern.template.match(this.findPartialsRE);
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

  // still requires the mustache syntax because of the way PL handles lists
  findListItems: function(pattern) {
    const matches = pattern.template.match(this.findListItemsRE);
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
