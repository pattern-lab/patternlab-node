/*
 * mustache pattern engine for patternlab-node - v0.10.1 - 2015
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
  "use strict";

  var Mustache = require('mustache');

  var engine_mustache = {
    engine: Mustache,
    fileExtension: '.mustache',

    // render it
    renderPattern: function renderPattern(template, data, partials) {
      if (partials) {
        return Mustache.render(template, data, partials);
      }
      return Mustache.render(template, data);
    },

    // find and return any {{> template-name }} within pattern
    findPartials: function findPartials(pattern) {
      var matches = pattern.template.match(/{{>([ ])?([A-Za-z0-9-]+)(?:\:[A-Za-z0-9-]+)?(?:(| )\(.*)?([ ])?}}/g);
      return matches;
    }
  };

  module.exports = engine_mustache;
})();
