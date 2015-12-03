/*
 * patternlab-node - v0.10.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */


(function () {
  'use strict';

  var path = require('path');

  // list of supported pattern engines
  var supportedPatternEngineNames = [
    'mustache',
    'handlebars'
  ];

  // mapping of file extensions to engine names, for lookup use
  var engineNameForExtension = {};

  // Object/hash of all loaded pattern engines, empty at first.
  // My intention here is to make this return an object that can be used to
  // obtain any loaded PatternEngine by addressing them like this:
  //
  // var PatternEngines = require('./pattern_engines/pattern_engines');
  // var Mustache = PatternEngines['mustache'];
  //
  var PatternEngines = Object.create({
    supportedPatternEngineNames: supportedPatternEngineNames,

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
      if(filename.charAt(0) === '.' ||
         filename.charAt(0) === '_' ||
         (extension === '.json' && !PatternEngines.isPseudoPatternJSON(filename))) {
        return false;
      }

      // not a hidden pattern, let's dig deeper
      var supportedPatternFileExtensions = PatternEngines.getSupportedFileExtensions();
      return (supportedPatternFileExtensions.lastIndexOf(extension) !== -1 ||
             PatternEngines.isPseudoPatternJSON(filename));
    }
  });

  // try to load all supported engines
  (function loadAllEngines() {
    supportedPatternEngineNames.forEach(function (engineName) {
      try {
        PatternEngines[engineName] = require('./engine_' + engineName);
      } catch (err) {
        console.log(err, 'pattern engine "' + engineName + '" not loaded. Did you install its dependency with npm?');
      }
    });
  })();

  // produce a mapping between file extension and engine name for each of the
  // loaded engines
  engineNameForExtension = (function () {
    var mapping = {};

    Object.keys(PatternEngines).forEach(function (engineName) {
      var extensionForEngine = PatternEngines[engineName].engineFileExtension;
      mapping[extensionForEngine] = engineName;
    });

    return mapping;
  })();


  module.exports = PatternEngines;
})();
