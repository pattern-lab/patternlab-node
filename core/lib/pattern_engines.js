// special shoutout to Geoffrey Pursell for single-handedly making Pattern Lab Node Pattern Engines possible!
'use strict';
const path = require('path');
const diveSync = require('diveSync');
const chalk = require('chalk');
const engineMatcher = /^patternengine-node-(.*)$/;
const enginesDirectories = [
  {
    displayName: 'the core',
    path: path.resolve(__dirname, '..', '..', 'node_modules')
  },
  {
    displayName: 'the edition or test directory',
    path: path.join(process.cwd(), 'node_modules')
  }
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

  if (engineMatch) { return engineMatch[1]; }
  return false;
}

/**
 * Find engine modules in a given directory.
 * @param dir Directory containing engine modules
 * @returns Array of engine modules keyed by engine name
 */
function findEngineModulesInDirectory(dir) {
  const foundEngines = [];

  diveSync(dir, {
    recursive: false,
    directories: true
  }, function (err, filePath) {
    if (err) { throw err; }
    const foundEngineName = isEngineModule(filePath);
    if (foundEngineName) {
      foundEngines.push({
        name: foundEngineName,
        modulePath: filePath
      });
    }
  });

  return foundEngines;
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
    var self = this;

    // Try to load engines! We scan for engines at each path specified above. This
    // function is kind of a big deal.
    enginesDirectories.forEach(function (engineDirectory) {
      const enginesInThisDir = findEngineModulesInDirectory(engineDirectory.path);
      if (patternLabConfig.debug) {
        console.log(chalk.bold(`Loading engines from ${engineDirectory.displayName}...\n`));
      }

      // find all engine-named things in this directory and try to load them,
      // unless it's already been loaded.
      enginesInThisDir.forEach(function (engineDiscovery) {
        let errorMessage;
        const successMessage = "good to go";
        if (patternLabConfig.debug) {
          chalk.green(successMessage);
        }

        try {
          // Give it a try! load 'er up. But not if we already have,
          // of course.  Also pass the pattern lab config object into
          // the engine's closure scope so it can know things about
          // things.
          if (self[engineDiscovery.name]) {
            throw new Error("already loaded, skipping.");
          }
          self[engineDiscovery.name] = require(engineDiscovery.modulePath);
          if (typeof self[engineDiscovery.name].usePatternLabConfig === 'function') {
            self[engineDiscovery.name].usePatternLabConfig(patternLabConfig);
          }
          if (typeof self[engineDiscovery.name].spawnMeta === 'function') {
            self[engineDiscovery.name].spawnMeta(patternLabConfig);
          }
        } catch (err) {
          errorMessage = err.message;
        } finally {
          // report on the status of the engine, one way or another!
          if (patternLabConfig.debug) {
            console.log(`  ${engineDiscovery.name}:`, errorMessage ? chalk.red(errorMessage) : successMessage);
          }
        }
      });
      console.log('');
    });

    // Complain if for some reason we haven't loaded any engines.
    if (Object.keys(self).length === 0) {
      throw new Error('No engines loaded! Something is seriously wrong.');
    }
    if (patternLabConfig.debug) {
      console.log(chalk.bold('Done loading engines.\n'));
    }
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
    if (pattern instanceof of.Pattern && typeof pattern.fileExtension === 'string' && pattern.fileExtension) {
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
    return (supportedExtensions.lastIndexOf(fileExtension) !== -1);
  },

  /**
   * Given a filename, return a boolean: whether or not the filename indicates
   * that the file is pseudopattern JSON
   * @param filename
   * @return boolean
   */
  isPseudoPatternJSON: function (filename) {
    const extension = path.extname(filename);
    return (extension === '.json' && filename.indexOf('~') > -1);
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
    if (filename.charAt(0) === '.' ||
        (extension === '.json' && !PatternEngines.isPseudoPatternJSON(filename))) {
      return false;
    }

    // not a hidden pattern, let's dig deeper
    const supportedPatternFileExtensions = PatternEngines.getSupportedFileExtensions();
    return (supportedPatternFileExtensions.lastIndexOf(extension) !== -1 ||
            PatternEngines.isPseudoPatternJSON(filename));
  }
});

module.exports = PatternEngines;
