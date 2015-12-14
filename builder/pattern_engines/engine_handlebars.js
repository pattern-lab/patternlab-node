/*
 * handlebars pattern engine for patternlab-node - v0.15.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
  "use strict";

  var Handlebars = require('handlebars');

  var engine_handlebars = {
    engine: Handlebars,
    engineName: 'handlebars',
    engineFileExtension: '.hbs',

    // regexes, stored here so they're only compiled once
    // GTP warning: unchanged copypasta from mustache engine
    // findPartialsRE: /{{>\s*((?:\d+-[\w-]+\/)+(\d+-[\w-]+(\.\w+)?)|[A-Za-z0-9-]+)(\:[\w-]+)?(\(\s*\w+\s*:\s*(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")\))?\s*}}/g,
    findPartialsRE: /{{#?>\s*([\w-\/.]+)(?:.|\s+)*?}}/g,
    findPartialsWithStyleModifiersRE: /{{>([ ])?([\w\-\.\/~]+)(?!\()(\:[A-Za-z0-9-_|]+)+(?:(| )\(.*)?([ ])?}}/g,
    findPartialsWithPatternParametersRE: /{{>([ ])?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_|]+)?(?:(| )\(.*)+([ ])?}}/g,
    findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g,

    // render it
    renderPattern: function renderPattern(template, data, partials) {
      if (partials) {
        Handlebars.registerPartial(partials);
      }
      var compiled = Handlebars.compile(template);
      return compiled(data);
    },

    registerPartial: function (oPattern) {
      Handlebars.registerPartial(oPattern.key, oPattern.template);
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
      var partialKey = partialString.replace(this.findPartialsRE, '$1');
      return partialKey;
    }
  };

  module.exports = engine_handlebars;
})();
