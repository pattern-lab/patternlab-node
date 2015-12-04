/*
 * mustache pattern engine for patternlab-node - v0.10.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
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
    engineName: 'mustache',
    engineFileExtension: '.mustache',

    // regexes, stored here so they're only compiled once
    findPartialsRE: /{{>\s*((?:\d+-[\w-]+\/)+(\d+-[\w-]+(\.\w+)?)|[A-Za-z0-9-]+)(\:[\w-]+)?(\(\s*\w+\s*:\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\))?\s*}}/g,
    findPartialsWithStyleModifiersRE: /{{>([ ])?([\w\-\.\/~]+)(?!\()(\:[A-Za-z0-9-_|]+)+(?:(| )\(.*)?([ ])?}}/g,
    findPartialsWithPatternParametersRE: /{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)+([ ])?}}/g,
    findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g,
    getPartialKeyRE: /{{>([ ])?([\w\-\.\/~]+)(:[A-z-_|]+)?(?:\:[A-Za-z0-9-_]+)?(?:(| )\(.*)?([ ])?}}/g,

    // render it
    renderPattern: function renderPattern(template, data, partials) {
      if (partials) {
        return Mustache.render(template, data, partials);
      }
      return Mustache.render(template, data);
    },

    // find and return any {{> template-name }} within pattern
    findPartials: function findPartials(pattern) {
      var matches = pattern.template.match(this.findPartialsRE);
      return matches;
    },
    findPartialsWithStyleModifiers: function(pattern) {
      var matches = pattern.template.match(this.findPartialsWithStyleModifiersRE);
      return matches;
    },
    // returns any patterns that match {{> value(foo:"bar") }} or {{>
    // value:mod(foo:"bar") }} within the pattern
    findPartialsWithPatternParameters: function(pattern) {
      var matches = pattern.template.match(this.findPartialsWithPatternParametersRE);
      return matches;
    },
    findListItems: function(pattern) {
      var matches = pattern.template.match(this.findListItemsRE);
      return matches;
    },
    // given a pattern, and a partial string, tease out the "pattern key" and
    // return it.
    getPartialKey: function(pattern, partialString) {
      var partialKey = partialString.replace(this.getPartialKeyRE, '$2');
      return partialKey;
    }
  };

  module.exports = engine_mustache;
})();
