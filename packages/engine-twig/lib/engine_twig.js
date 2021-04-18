'use strict';

/*
 * twig pattern engine for patternlab-node - v0.15.1 - 2015
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
 * Full. Partial calls and lineage hunting are supported. Twig does not support
 * the mustache-specific syntax extensions, style modifiers and pattern
 * parameters, because their use cases are addressed by the core Twig feature
 * set.
 *
 */

const fs = require('fs-extra');
const path = require('path');
const {
  TwingEnvironment,
  TwingLoaderFilesystem,
  TwingLoaderChain,
  TwingSource
} = require('twing');

class TwingLoaderPatternLab {
  patterns = new Map();

  constuctor() {}

  registerPartial(pattern) {
    if (pattern.patternPartial) {
      this.patterns.set(pattern.patternPartial, pattern);
    }
  }

  /**
   * Returns the source context for a given template logical name.
   *
   * @param {string} name The template logical name
   * @param {TwingSource} from The source that initiated the template loading
   *
   * @returns {Promise<TwingSource>}
   *
   * @throws TwingErrorLoader When name is not found
   */
  getSourceContext(name, from) {
    var pattern = this.patterns.get(name);
    return Promise.resolve(
      new TwingSource(pattern.extendedTemplate, name, pattern.relPath)
    );
  }

  /**
   * Gets the cache key to use for the cache for a given template name.
   *
   * @param {string} name The name of the template to load
   * @param {TwingSource} from The source that initiated the template loading
   *
   * @returns {Promise<string>} The cache key
   *
   * @throws TwingErrorLoader When name is not found
   */
  getCacheKey(name, from) {
    return Promise.resolve(name);
  }

  /**
   * Returns true if the template is still fresh.
   *l
   * @param {string} name The template name
   * @param {number} time Timestamp of the last modification time of the cached template
   * @param {TwingSource} from The source that initiated the template loading
   *
   * @returns {Promise<boolean>} true if the template is fresh, false otherwise
   *
   * @throws TwingErrorLoader When name is not found
   */
  isFresh(name, time, from) {
    return Promise.resolve(this.patterns.has(name) ? true : false);
  }

  /**
   * Check if we have the source code of a template, given its name.
   *
   * @param {string} name The name of the template to check if we can load
   * @param {TwingSource} from The source that initiated the template loading
   *
   * @returns {Promise<boolean>} If the template source code is handled by this loader or not
   */
  exists(name, from) {
    return Promise.resolve(this.patterns.has(name) ? true : false);
  }

  /**
   * Resolve the path of a template, given its name, whatever it means in the context of the loader.
   *
   * @param {string} name The name of the template to resolve
   * @param {TwingSource} from The source that initiated the template loading
   *
   * @returns {Promise<string>} The resolved path of the template
   */
  resolve(name, from) {
    pattern = this.patterns.get(name);
    return null;
  }
}

const fileSystemLoader = new TwingLoaderFilesystem();
const patternLabLoader = new TwingLoaderPatternLab();
const chainLoader = new TwingLoaderChain([fileSystemLoader, patternLabLoader]);
const twing = new TwingEnvironment(chainLoader);
var metaPath;

var engine_twig = {
  engine: twing,
  engineName: 'twig',
  engineFileExtension: '.twig',

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{%\s*(?:extends|include|embed)\s+('[^']+'|"[^"]+").*?%}/g,
  findPartialKeyRE: /"((?:\\.|[^"\\])*)"/,
  findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g, // TODO

  // render it
  renderPattern: function renderPattern(pattern, data, partials) {
    var patternPath = pattern.basePattern
      ? pattern.basePattern.relPath
      : pattern.relPath;
    if (patternPath.lastIndexOf(metaPath) === 0) {
      patternPath = patternPath.substring(metaPath.length + 1);
    }
    return Promise.resolve(twing.render(patternPath, data));
  },

  registerPartial: function registerPartial(pattern) {
    console.log(
      `registerPartial(${pattern.name} - ${pattern.patternPartial} - ${pattern.patternPath} - ${pattern.relPath})`
    );
    patternLabLoader.registerPartial(pattern);
  },

  // find and return any {% include 'template-name' %} within pattern
  findPartials: function findPartials(pattern) {
    var matches = pattern.template.match(this.findPartialsRE);
    return matches;
  },
  findPartialsWithStyleModifiers: function() {
    // TODO: make the call to this from oPattern objects conditional on their
    // being implemented here.
    return [];
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function() {
    // TODO: make the call to this from oPattern objects conditional on their
    // being implemented here.
    return [];
  },
  findListItems: function(pattern) {
    var matches = pattern.template.match(this.findListItemsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartial: function(partialString) {
    var partial = partialString.match(this.findPartialKeyRE)[0];
    partial = partial.replace(/"/g, '');

    return partial;
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
    this.spawnFile(config, '_head.twig');
    this.spawnFile(config, '_foot.twig');
  },

  /**
   * Accept a Pattern Lab config object from the core and use the settings to
   * load helpers.
   *
   * @param {object} config - the global config object from core
   */
  usePatternLabConfig: function(config) {
    metaPath = path.resolve(config.paths.source.meta);
    // Global paths
    fileSystemLoader.addPath(config.paths.source.meta);
    fileSystemLoader.addPath(config.paths.source.patterns);
    // Namespaced paths
    if (
      config['engines'] &&
      config['engines']['twig'] &&
      config['engines']['twig']['namespaces']
    ) {
      var namespaces = config['engines']['twig']['namespaces'];
      Object.keys(namespaces).forEach(function(key, index) {
        fileSystemLoader.addPath(namespaces[key], key);
      });
    }
  }
};

module.exports = engine_twig;
