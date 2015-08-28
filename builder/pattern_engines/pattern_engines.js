/*
 * patternlab-node - v0.10.1 - 2015
 *
 * Brian Muenzenmeyer, and the web community.
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

  // object/hash of all loaded pattern engines, empty at first
  function PatternEngines () {
    // do nothing
  }
  PatternEngines.prototype = {
    getEngineForPattern: function (pattern) {
      console.log('pattern file name: ', pattern.fileName);
      return 'mustache';
    }
  };

  // try to load all supported engines
  supportedPatternEngineNames.forEach(function (engineName) {
    try {
      PatternEngines[engineName] = require('./engine_' + engineName);
    } catch (err) {
      console.log(err, 'pattern engine "' + engineName + '" not loaded. Did you install its dependency with npm?');
    }
  });

  module.exports = new PatternEngines();
})();
