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

  // Object/hash of all loaded pattern engines, empty at first.
  // My intention here is to make this return an object that can be used to
  // obtain any loaded PatternEngine by addressing them like this:
  //
  // var PatternEngines = require('./pattern_engines/pattern_engines');
  // var Mustache = PatternEngines['mustache'];
  //
  var PatternEngines = Object.create({
    getEngineForPattern: function (pattern) {
      console.log('pattern file name: ', pattern.fileName);
      return 'mustache';
    }
  });

  // try to load all supported engines
  supportedPatternEngineNames.forEach(function (engineName) {
    try {
      PatternEngines[engineName] = require('./engine_' + engineName);
    } catch (err) {
      console.log(err, 'pattern engine "' + engineName + '" not loaded. Did you install its dependency with npm?');
    }
  });

  module.exports = PatternEngines;
})();
