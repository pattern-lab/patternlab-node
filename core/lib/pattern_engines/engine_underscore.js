/*
 * underscore pattern engine for patternlab-node - v0.15.1 - 2015
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
 * Basic. We can't call partials from inside underscore templates yet, but we
 * can render templates with backing JSON.
 *
 */

(function () {
  "use strict";

  var _ = require('underscore');

  // extend underscore with partial-ing methods
  // HANDLESCORE! UNDERBARS!
  _.mixin({
    renderPartial: function (partial, data) {
      var data = data || {};
      var compiled = _.template(partial);
      return compiled(data);
    },
    assignContext: function (viewModel, data) {
      return viewModel(data);
    }
  });

  var engine_underscore = {
    engine: _,
    engineName: 'underscore',
    engineFileExtension: '.html',

    // partial expansion is only necessary for Mustache templates that have
    // style modifiers or pattern parameters (I think)
    expandPartials: false,

    // regexes, stored here so they're only compiled once
    findPartialsRE: /<%= _.renderPartial\((.*?)\).*?%>/g, // TODO,
    findPartialsWithStyleModifiersRE: /<%= _.renderPartial\((.*?)\).*?%>/g, // TODO
    findPartialsWithPatternParametersRE: /<%= _.renderPartial\((.*?)\).*?%>/g, // TODO
    findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g,

    // render it
    renderPattern: function renderPattern(template, data, partials) {
      var compiled = _.template(template);
      var renderedHTML;

      // This try-catch is necessary because references to undefined variables
      // in underscore templates are eval()ed directly as javascript, and as
      // such will throw very real exceptions that will shatter the whole build
      // process if we don't handle them.
      try {
        renderedHTML = compiled(_.extend(data || {}, {
          _allData: data,
          _partials: partials
        }));
      } catch (e) {
        var errorMessage = "WARNING: the underscore template " + template.fileName + " threw an exception; it probably just tried to reference an undefined variable. Is this pattern maybe missing a .json file?";
        console.log(errorMessage, e);
        renderedHTML = "<h1>Error in underscore template</h1>" + errorMessage;
      }

      return renderedHTML;
    },

    // registerPartial: function (oPattern) {
    //   debugger;
    //   _.registerPartial(oPattern.key, oPattern.template);
    // },

    // find and return any {{> template-name }} within pattern
    findPartials: function findPartials(pattern) {
      var matches = pattern.template.match(this.findPartialsRE);
      return matches;
    },
    findPartialsWithStyleModifiers: function () {
      return [];
    },

    // returns any patterns that match {{> value(foo:"bar") }} or {{>
    // value:mod(foo:"bar") }} within the pattern
    findPartialsWithPatternParameters: function () {
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

  module.exports = engine_underscore;
})();
