// special shoutout to Geoffrey Pursell for single-handedly making Pattern Lab Node Pattern Engines possible!
'use strict';
const {existsSync, lstatSync, readdirSync} = require('fs');
const path = require('path');
const chalk = require('chalk');
const engineMatcher = /^patternengine-node-(.*)$/;
const scopeMatch = /^@(.*)$/;
const isDir = fPath => lstatSync(fPath).isDirectory();
const logger = require('./log');

const enginesDirectories = [{
  displayName: 'the core',
  path: path.resolve(__dirname, '..', '..', 'node_modules')
}, {
  displayName: 'the edition or test directory',
  path: path.join(process.cwd(), 'node_modules')
}];

// given a path: return the engine name if the path points to a valid engine
// module directory, or false if it doesn't
function isEngineModule(filePath) {
  const baseName = path.basename(filePath);
  const engineMatch = baseName.match(engineMatcher);

  if (engineMatch) { return engineMatch[1]; }
  return false;
}

/**
 * @name isScopedPackage
 * @desc Checks whether a path in modules belongs to a scoped package
 * @param {string} filePath - The pathname to check
 * @return {Boolean} - Returns a bool when found, false othersie
 */
function isScopedPackage(filePath) {
  const baseName = path.basename(filePath);
  return scopeMatch.test(baseName);
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

  /**
   * @name walk
   * @desc Traverse the given path and gather possible engines
   * @param  {string} fPath - The file path to traverse
   * @param  {Array<Engine>} engines - An array of engines from the inner most matches
   * @return {Array<Engine>} - The final array of engines
   */
  const walk = (fPath, engines) => {

    /**
     * @name dirList
     * @desc A list of all directories in the given path
     * @type {Array<string>}
     */
    const dirList = readdirSync(fPath).filter(p => isDir(path.join(fPath, p)));

    /**
     * @name e
     * @desc For the current dir get all engines
     * @type {Array<Engine>}
     */
    const e = engines.concat(dirList
      .filter(isEngineModule)
      .map(engine => {
        return {
          name: isEngineModule(engine),
          modulePath: path.join(fPath, engine)
        }
      })
    );

    /**
     * 1. Flatten all engines from inner recursions and current dir
     * 2. Filter the dirList for scoped packages
     * 3. Map over every scoped package and recurse into it to find scoped engines
     */
    return [].concat(
      ...e,
      ...dirList
        .filter(isScopedPackage) // 2
        .map(scope => walk(path.join(fPath, scope), e)) // 3
    );
  };

  return walk(dir, []);
}

function findEngineModulesInDirectory(dir) {
  const foundEngines = resolveEngines(dir)
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

  loadAllEngines: function (patternLabConfig) {
    var self = this;

    // Try to load engines! We scan for engines at each path specified above. This
    // function is kind of a big deal.
    enginesDirectories.forEach(function (engineDirectory) {
      const enginesInThisDir = findEngineModulesInDirectory(engineDirectory.path);

      logger.debug(`Loading engines from ${engineDirectory.displayName}...\n`);

      // find all engine-named things in this directory and try to load them,
      // unless it's already been loaded.
      enginesInThisDir.forEach(function (engineDiscovery) {
        let errorMessage;
        const successMessage = "good to go";

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
          logger.info(`Pattern Engine ${engineDiscovery.name}: ${errorMessage ? errorMessage : successMessage}`);
        }
      });
    });

    // Complain if for some reason we haven't loaded any engines.
    if (Object.keys(self).length === 0) {
      logger.error('No engines loaded! Something is seriously wrong.');
    }
    logger.debug(`Done loading engines`);
  },

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

  getEngineForPattern: function (pattern) {
    if (pattern.isPseudoPattern) {
      return this.getEngineForPattern(pattern.basePattern);
    } else {
      const engineName = this.getEngineNameForPattern(pattern);
      return this[engineName];
    }
  },

  // combine all found engines into a single array of supported extensions
  getSupportedFileExtensions: function () {
    const engineNames = Object.keys(PatternEngines);
    const allEnginesExtensions = engineNames.map((engineName) => {
      return PatternEngines[engineName].engineFileExtension;
    });
    return [].concat.apply([], allEnginesExtensions);
  },

  isFileExtensionSupported: function (fileExtension) {
    const supportedExtensions = PatternEngines.getSupportedFileExtensions();
    return (supportedExtensions.lastIndexOf(fileExtension) !== -1);
  },

  // given a filename, return a boolean: whether or not the filename indicates
  // that the file is pseudopattern JSON
  isPseudoPatternJSON: function (filename) {
    const extension = path.extname(filename);
    return (extension === '.json' && filename.indexOf('~') > -1);
  },

  // takes a filename string, not a full path; a basename (plus extension)
  // ignore _underscored patterns, dotfiles, and anything not recognized by a
  // loaded pattern engine. Pseudo-pattern .json files ARE considered to be
  // pattern files!
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
