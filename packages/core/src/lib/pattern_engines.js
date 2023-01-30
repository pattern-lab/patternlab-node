// special shoutout to Geoffrey Pursell for single-handedly making Pattern Lab Node Pattern Engines possible! aww thanks :)
'use strict';
const { existsSync } = require('fs');
const path = require('path');

const findModules = require('./findModules');

const engineMatcher = /^engine-(.*)$/;

const logger = require('./log');

const { resolvePackageFolder } = require('@pattern-lab/core/src/lib/resolver');

const enginesDirectories = [
  {
    displayName: 'the core',
    path: path.resolve(__dirname, '..', '..', 'node_modules'),
  },
  {
    displayName: 'the edition or test directory',
    path: path.join(process.cwd(), 'node_modules'),
  },
  {
    displayName: 'the general node_modules directory',
    path: path.resolve(resolvePackageFolder('@pattern-lab/core'), '..', '..'),
  },
];

/**
 * Given a path: return the engine name if the path points to a valid engine
 * module directory, or false if it doesn't.
 * @param filePath
 * @returns Engine name if exists or FALSE
 */
function isEngineModule(filePath) {
  const baseName = path.basename(filePath);
  const engineMatch = baseName.match(engineMatcher);

  if (engineMatch) {
    return engineMatch[1];
  }
  return false;
}

/**
 * @name resolveEngines
 * @desc Creates an array of all available patternlab engines
 * @param {string} dir - The directory to search for engines and scoped engines)
 * @return {Array<Engine>} An array of engine objects
 */
function resolveEngines(dir) {
  // Guard against non-existent directories.
  if (!existsSync(dir)) {
    return []; // Silence is golden …
  }

  return findModules(dir, isEngineModule);
}

function findEngineModulesInDirectory(dir) {
  const foundEngines = resolveEngines(dir);
  return foundEngines;
}

function findEnginesInConfig(config) {
  if ('engines' in config) {
    return config.engines;
  }
  logger.warning(
    "Scanning the 'node_modules' folder for pattern engines is deprecated and will be removed in v7."
  );
  logger.warning(
    'To configure your engines in patternlab-config.json, see https://patternlab.io/docs/editing-the-configuration-options/#heading-engines'
  );
  return null;
}

//
// PatternEngines: the main export of this module
//
// It's an Object/hash of all loaded pattern engines, empty at first.  My
// intention here is to make this return an object that can be used to obtain
// any loaded PatternEngine by addressing them like this:
//
//   var PatternEngines = require('./pattern_engines/pattern_engines');
//   var Mustache = PatternEngines['mustache'];
//
// Object.create lets us create an object with a specified prototype. We want
// this here because we would like the object's "own properties" to include
// only the engine names so we can easily iterate over them; all the handy
// methods and properites below should therefore be on its prototype.

const PatternEngines = Object.create({
  /**
   * Load all pattern engines.
   * @param patternLabConfig
   * @memberof PatternEngines
   */
  loadAllEngines: function (patternLabConfig) {
    const self = this;

    // Try to load engines! We load the engines configured in patternlab-config.json
    const enginesInConfig = findEnginesInConfig(patternLabConfig);

    if (enginesInConfig) {
      // Quick fix until we've removed @pattern-lab/engine-mustache, starting with https://github.com/pattern-lab/patternlab-node/issues/1239 & https://github.com/pattern-lab/patternlab-node/pull/1455
      // @TODO: Remove after removing @pattern-lab/engine-mustache dependency
      enginesInConfig.mustache = enginesInConfig.mustache || {};
      enginesInConfig.mustache.package =
        enginesInConfig.mustache.package || '@pattern-lab/engine-mustache';
      enginesInConfig.mustache.extensions =
        enginesInConfig.mustache.extensions || 'mustache';

      // Try loading each of the configured pattern engines
      // eslint-disable-next-line guard-for-in
      for (const name in enginesInConfig) {
        const engineConfig = enginesInConfig[name];
        let errorMessage;
        const successMessage = 'good to go';

        try {
          // Give it a try! load 'er up. But not if we already have,
          // of course. Also pass the Pattern Lab config object into
          // the engine's closure scope so it can know things about
          // things.
          if (self[name]) {
            throw new Error('already loaded, skipping.');
          }
          if ('package' in engineConfig) {
            self[name] = require(engineConfig.package);
            if (typeof self[name].usePatternLabConfig === 'function') {
              self[name].usePatternLabConfig(patternLabConfig);
            }
            if (typeof self[name].spawnMeta === 'function') {
              self[name].spawnMeta(patternLabConfig);
            }
          } else {
            logger.warning(
              `Engine ${name} not configured correctly. Please configure your engines in patternlab-config.json as documented in https://patternlab.io/docs/editing-the-configuration-options/#heading-engines`
            );
          }
        } catch (err) {
          errorMessage = err.message;
        } finally {
          // report on the status of the engine, one way or another!
          logger.info(
            `Pattern Engine ${name} / package ${engineConfig.package}: ${
              errorMessage ? errorMessage : successMessage
            }`
          );
        }
      }
    } else {
      // Try to load engines! We scan for engines at each path specified above. This
      // function is kind of a big deal.
      enginesDirectories.forEach(function (engineDirectory) {
        const enginesInThisDir = findEngineModulesInDirectory(
          engineDirectory.path
        );

        `Loading engines from ${engineDirectory.displayName}: ${engineDirectory.path} ...`;

        // find all engine-named things in this directory and try to load them,
        // unless it's already been loaded.
        enginesInThisDir.forEach(function (engineDiscovery) {
          let errorMessage;
          const successMessage = 'good to go';

          try {
            // Give it a try! load 'er up. But not if we already have,
            // of course. Also pass the Pattern Lab config object into
            // the engine's closure scope so it can know things about
            // things.
            if (self[engineDiscovery.name]) {
              throw new Error('already loaded, skipping.');
            }
            self[engineDiscovery.name] = require(engineDiscovery.modulePath);
            if (
              typeof self[engineDiscovery.name].usePatternLabConfig ===
              'function'
            ) {
              self[engineDiscovery.name].usePatternLabConfig(patternLabConfig);
            }
            if (typeof self[engineDiscovery.name].spawnMeta === 'function') {
              self[engineDiscovery.name].spawnMeta(patternLabConfig);
            }
          } catch (err) {
            errorMessage = err.message;
          } finally {
            // report on the status of the engine, one way or another!
            logger.info(
              `Pattern Engine ${
                engineDiscovery.name
              } by discovery (deprecated): ${
                errorMessage ? errorMessage : successMessage
              }`
            );
          }
        });
      });
    }

    // Complain if for some reason we haven't loaded any engines.
    if (Object.keys(self).length === 0) {
      logger.error('No engines loaded! Something is seriously wrong.');
    }
    logger.debug(`Done loading engines`);
  },

  /**
   * Get engine name for pattern.
   * @memberof PatternEngines
   * @param pattern
   * @returns engine name matching pattern
   */
  getEngineNameForPattern: function (pattern) {
    // avoid circular dependency by putting this in here. TODO: is this slow?
    const of = require('./object_factory');
    if (
      pattern instanceof of.Pattern &&
      typeof pattern.fileExtension === 'string' &&
      pattern.fileExtension
    ) {
      //loop through known engines and find the one that supports the pattern's fileExtension
      const engineNames = Object.keys(this);
      for (let i = 0; i < engineNames.length; i++) {
        const engine = this[engineNames[i]];

        if (Array.isArray(engine.engineFileExtension)) {
          if (engine.engineFileExtension.includes(pattern.fileExtension)) {
            return engine.engineName;
          }
        } else {
          //this likely means the users engines are out of date. todo: tell them to upgrade
          if (engine.engineFileExtension === pattern.fileExtension) {
            return engine.engineName;
          }
        }
      }
    }

    // otherwise, assume it's a plain mustache template string and act
    // accordingly
    return 'mustache';
  },

  /**
   * Get engine for pattern.
   * @memberof PatternEngines
   * @param pattern
   * @returns name of engine for pattern
   */
  getEngineForPattern: function (pattern) {
    if (pattern.isPseudoPattern) {
      return this.getEngineForPattern(pattern.basePattern);
    } else {
      const engineName = this.getEngineNameForPattern(pattern);
      return this[engineName];
    }
  },

  /**
   * Combine all found engines into a single array of supported extensions.
   * @memberof PatternEngines
   * @returns Array all supported file extensions
   */
  getSupportedFileExtensions: function () {
    const engineNames = Object.keys(PatternEngines);
    const allEnginesExtensions = engineNames.map((engineName) => {
      return PatternEngines[engineName].engineFileExtension;
    });
    return [].concat.apply([], allEnginesExtensions);
  },

  /**
   * Check if fileExtension is supported.
   * @memberof PatternEngines
   * @param fileExtension
   * @returns Boolean
   */
  isFileExtensionSupported: function (fileExtension) {
    const supportedExtensions = PatternEngines.getSupportedFileExtensions();
    return supportedExtensions.lastIndexOf(fileExtension) !== -1;
  },

  /**
   * Given a filename, return a boolean: whether or not the filename indicates
   * that the file is pseudopattern JSON
   * @param filename
   * @return boolean
   */
  isPseudoPatternJSON: function (filename) {
    const extension = path.extname(filename);
    return extension === '.json' && filename.indexOf('~') > -1;
  },

  /**
   * Takes a filename string, not a full path; a basename (plus extension)
   * ignore _underscored patterns, dotfiles, and anything not recognized by a
   * loaded pattern engine. Pseudo-pattern .json files ARE considered to be
   * pattern files!
   *
   * @memberof PatternEngines
   * @param filename
   * @returns boolean
   */
  isPatternFile: function (filename) {
    // skip hidden patterns/files without a second thought
    const extension = path.extname(filename);
    if (
      filename.charAt(0) === '.' ||
      (extension === '.json' && !PatternEngines.isPseudoPatternJSON(filename))
    ) {
      return false;
    }

    // not a hidden pattern, let's dig deeper
    const supportedPatternFileExtensions =
      PatternEngines.getSupportedFileExtensions();
    return (
      supportedPatternFileExtensions.lastIndexOf(extension) !== -1 ||
      PatternEngines.isPseudoPatternJSON(filename)
    );
  },
});

module.exports = PatternEngines;
