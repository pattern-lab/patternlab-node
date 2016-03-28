/*
 * patternlab-node - v0.10.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

'use strict';

var path = require('path');
var diveSync = require('diveSync');
var engineMatcher = /^engine_(.*)\.js/;
var enginesDirectory = __dirname;

var PatternEngines; // the main export object
var engineNameForExtension; // generated mapping of extension to engine name


// free "private" functions, for internal setup only

function findSupportedPatternEngineNames() {
  var foundPatternEngineNames = [];

  // find
  diveSync(enginesDirectory, {
    recursive: false,
    filter: function (filePath, dir) {
      var baseName = path.basename(filePath),
        engineMatch = baseName.match(engineMatcher);

      if (dir || engineMatch !== null) { return true; }
      return false;
    }
  }, function (err, filePath) {
    if (err) { throw err; }
    var baseName = path.basename(filePath),
      engineMatch = baseName.match(engineMatcher),
      foundEngineName = engineMatch[1];

    foundPatternEngineNames.push(foundEngineName);
  });

  return foundPatternEngineNames;
}

// try to load all supported engines
function loadAllEngines(enginesObject) {
  console.log('\nLoading engines...');

  enginesObject.supportedPatternEngineNames.forEach(function (engineName) {
    var notLoaded = false;

    try {
      enginesObject[engineName] = require('./engine_' + engineName);
    } catch (err) {
      // Handle errors loading each pattern engine. This will usually be
      // because the engine's renderer hasn't been installed by the end user
      // -- we don't include any of them (except mustache) by default as
      // depedencies in package.json.
      notLoaded = (err.code === 'MODULE_NOT_FOUND');
    } finally {
      console.log('-', engineName, 'engine:',
                  notLoaded ? 'renderer not installed; engine disabled' : 'good to go');
    }
  });
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
  // build the list of supported pattern engines based on what plugins we have
  // in the pattern_engines directory
  supportedPatternEngineNames: findSupportedPatternEngineNames(),

  getEngineNameForPattern: function (pattern) {
    // avoid circular dependency by putting this in here. TODO: is this slow?
    var of = require('../object_factory');

    if (pattern instanceof of.oPattern && typeof pattern.fileExtension === 'string' && pattern.fileExtension) {
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
