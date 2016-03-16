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
 * Full. Partial calls and lineage hunting are supported. Twig does not support
 * the mustache-specific syntax extensions, style modifiers and pattern
 * parameters, because their use cases are addressed by the core Twig feature
 * set.
 *
 */

"use strict";

var Twig = require('twig');
var twig = Twig.twig;

var engine_twig = {
  engine: Twig,
  engineName: 'twig',
  engineFileExtension: '.twig',

  //Important! Needed for Twig compilation. Can't resolve paths otherwise.
  expandPartials: true,

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{%\s*(?:extends|include|embed)\s+('[^']+'|"[^"]+").*?%}/g,
  findPartialKeyRE: /"((?:\\.|[^"\\])*)"/,
  findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g, // TODO

  // render it
  renderPattern: function renderPattern(template, data) {
    var result = twig({
      data: template
    }).render(data);

    return result;
  },

  // find and return any {% include 'template-name' %} within pattern
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
    //var partialKey = partialString.replace(this.findPartialsRE, '$1');
    var partialKey = partialString.match(this.findPartialKeyRE)[0];
    partialKey = partialKey.replace(/"/g, '');

    return partialKey;
  }
};

module.exports = engine_twig;
