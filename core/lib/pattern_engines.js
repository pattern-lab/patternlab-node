// special shoutout to Geoffrey Pursell for single-handedly making Pattern Lab Node Pattern Engines possible!
'use strict';

var path = require('path');
var diveSync = require('diveSync');
var engineMatcher = /^patternengine-node-(.*)$/;
var enginesDirectories = [
  {
    displayName: 'the core',
    path: path.resolve(__dirname, '..', '..', 'node_modules')
  },
  {
    displayName: 'the edition or test directory',
    path: path.join(process.cwd(), 'node_modules')
  }
];
var PatternEngines; // the main export object
var engineNameForExtension; // generated mapping of extension to engine name


// free "private" functions, for internal setup only

// given a path: return the engine name if the path points to a valid engine
// module directory, or false if it doesn't
function isEngineModule(filePath) {
  var baseName = path.basename(filePath);
  var engineMatch = baseName.match(engineMatcher);

  if (engineMatch) { return engineMatch[1]; }
  return false;
}

function findEngineModulesInDirectory(dir) {
  var foundEngines = [];

  diveSync(dir, {
    recursive: false,
    directories: true
  }, function (err, filePath) {
    if (err) { throw err; }
    var foundEngineName = isEngineModule(filePath);
    if (foundEngineName) {
      foundEngines.push({
        name: foundEngineName,
        modulePath: filePath
      });
    }
  });

  return foundEngines;
}

// Try to load engines! We scan for engines at each path specified above. This
// function is kind of a big deal.
function loadAllEngines(enginesObject) {
  console.log('\nLoading engines...');

  enginesDirectories.forEach(function (engineDirectory) {
    var enginesInThisDir = findEngineModulesInDirectory(engineDirectory.path);
    console.log("...scanning for engines in", engineDirectory.displayName + "...");

    // find all engine-named things in this directory and try to load them,
    // unless it's already been loaded.
    enginesInThisDir.forEach(function (engineDiscovery) {
      var errorMessage;
      var successMessage = "good to go";

      try {
        // give it a try! load 'er up. But not if we already have, of course.
        if (enginesObject[engineDiscovery.name]) {
          throw new Error("already loaded, skipping.");
        }
        enginesObject[engineDiscovery.name] = require(engineDiscovery.modulePath);
      } catch (err) {
        errorMessage = err.message;
      } finally {
        // report on the status of the engine, one way or another!
        console.log('-', engineDiscovery.name, 'engine:', errorMessage ? errorMessage : successMessage);
      }
    });
  });

  // Complain if for some reason we haven't loaded any engines.
  if (Object.keys(enginesObject).length === 0) {
    throw new Error('No engines loaded! Something is seriously wrong.');
  }
  console.log('...done loading engines.\n');
}


// produce a mapping between file extension and engine name for each of the
// loaded engines
function createFileExtensionToEngineNameMap(enginesObject) {
  var mapping = {};

  Object.keys(enginesObject).forEach(function (engineName) {
    var extensionForEngine = enginesObject[engineName].engineFileExtension;
    mapping[extensionForEngine] = engineName;
  });

  return mapping;
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

PatternEngines = Object.create({
  getEngineNameForPattern: function (pattern) {
    // avoid circular dependency by putting this in here. TODO: is this slow?
    var of = require('./object_factory');

    if (pattern instanceof of.Pattern && typeof pattern.fileExtension === 'string' && pattern.fileExtension) {
      return engineNameForExtension[pattern.fileExtension];
    }

    // otherwise, assume it's a plain mustache template string and act
    // accordingly
    return 'mustache';
  },

  getEngineForPattern: function (pattern) {
    if (pattern.isPseudoPattern) {
      return this.getEngineForPattern(pattern.basePattern);
    } else {
      var engineName = this.getEngineNameForPattern(pattern);
      return this[engineName];
    }
  },

  getSupportedFileExtensions: function () {
    var engineNames = Object.keys(PatternEngines);
    return engineNames.map(function (engineName) {
      return PatternEngines[engineName].engineFileExtension;
    });
  },

  isFileExtensionSupported: function (fileExtension) {
    var supportedExtensions = PatternEngines.getSupportedFileExtensions();
    return (supportedExtensions.lastIndexOf(fileExtension) !== -1);
  },

  // given a filename, return a boolean: whether or not the filename indicates
  // that the file is pseudopattern JSON
  isPseudoPatternJSON: function (filename) {
    var extension = path.extname(filename);
    return (extension === '.json' && filename.indexOf('~') > -1);
  },

  // takes a filename string, not a full path; a basename (plus extension)
  // ignore _underscored patterns, dotfiles, and anything not recognized by a
  // loaded pattern engine. Pseudo-pattern .json files ARE considered to be
  // pattern files!
  isPatternFile: function (filename) {
    // skip hidden patterns/files without a second thought
    var extension = path.extname(filename);
    if (filename.charAt(0) === '.' ||
        (extension === '.json' && !PatternEngines.isPseudoPatternJSON(filename))) {
      return false;
    }

    // not a hidden pattern, let's dig deeper
    var supportedPatternFileExtensions = PatternEngines.getSupportedFileExtensions();
    return (supportedPatternFileExtensions.lastIndexOf(extension) !== -1 ||
            PatternEngines.isPseudoPatternJSON(filename));
  }
});


// load up the engines we found
loadAllEngines(PatternEngines);

// mapping of file extensions to engine names, for lookup use
engineNameForExtension = createFileExtensionToEngineNameMap(PatternEngines);

module.exports = PatternEngines;
