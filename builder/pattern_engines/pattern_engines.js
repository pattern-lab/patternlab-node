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

      if (pattern instanceof of.oPattern) {
        return engineNameForExtension[pattern.fileExtension];
      }
      // otherwise, assume it's a plain mustache template string and act
      // accordingly
      return 'mustache';
    },
    getEngineForPattern: function (pattern) {
      var engineName = this.getEngineNameForPattern(pattern);
      return this[engineName];
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
      var extensionForEngine = PatternEngines[engineName].fileExtension;
      mapping[extensionForEngine] = engineName;
    });

    return mapping;
  })();


  module.exports = PatternEngines;
})();
