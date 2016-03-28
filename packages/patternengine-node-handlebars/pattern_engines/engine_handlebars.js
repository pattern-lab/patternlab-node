/*
 * handlebars pattern engine for patternlab-node - v0.15.1 - 2015
 *
 * Geoffrey Pursell, Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

/*
 * ENGINE SUPPORT LEVEL:
 *
 * Full. Partial calls and lineage hunting are supported. Handlebars does not
 * support the mustache-specific syntax extensions, style modifiers and pattern
 * parameters, because their use cases are addressed by the core Handlebars
 * feature set.
 *
 */

"use strict";

var Handlebars = require('handlebars');

var engine_handlebars = {
  engine: Handlebars,
  engineName: 'handlebars',
  engineFileExtension: '.hbs',

  // partial expansion is only necessary for Mustache templates that have
  // style modifiers or pattern parameters (I think)
  expandPartials: false,

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{{#?>\s*([\w-\/.]+)(?:.|\s+)*?}}/g,
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
  findPartialsWithStyleModifiers: function () {
    // TODO: make the call to this from oPattern objects conditional on their
    // being implemented here.
    return [];
  },

  // returns any patterns that match {{> value(foo:"bar") }} or {{>
  // value:mod(foo:"bar") }} within the pattern
  findPartialsWithPatternParameters: function () {
    // TODO: make the call to this from oPattern objects conditional on their
    // being implemented here.
    return [];
  },
  findListItems: function (pattern) {
    var matches = pattern.template.match(this.findListItemsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and
  // return it.
  findPartialKey: function (partialString) {
    var partialKey = partialString.replace(this.findPartialsRE, '$1');
    return partialKey;
  }
};

module.exports = engine_handlebars;
