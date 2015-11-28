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

  // var Mustache = require('mustache');
  var twig = require('twig').twig;
  var path = require('path');

  var engine_twig = {
    engine: twig,
    engineName: 'twig',
    engineFileExtension: '.twig',

    // regexes, stored here so they're only compiled once
    findPartialsRE: /{%([ ]+)?(?:include|embed|extend)..([A-Za-z0-9-_.]+).(.*)%}/g,
    
    findPartialsWithStyleModifiersRE: /{%([ ]+)?([\w\-\.\/~]+)(?!\()(\:[A-Za-z0-9-_]+)+(?:(| )\(.*)?([ ])?%}/g,
    
    findPartialsWithPatternParametersRE: /{%([ ]+)?([\w\-\.\/~]+)(?:\:[A-Za-z0-9-_]+)?(?:(| )\(.*)+([ ])?%}/g,
    
    findListItemsRE: /({{#( )?)(list(I|i)tems.)(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)( )?}}/g,

    // render it
    renderPattern: function renderPattern(template, data, partials) {
      
      var twigTemplate = twig({
          path: './' + path.join(data.abspath),
          base: './source/_patterns',
          async: false
      });
      
      
      var html = twigTemplate.render(data.jsonFileData);
        
      return html;
      
      
      
    },

    // find and return any {% include "template-name" %} within a twig pattern
    findPartials: function findPartials(pattern) {
      var matches = pattern.template.match(this.findPartialsRE);
      return matches;
    },
    findPartialsWithStyleModifiers: function(pattern){
      var matches = pattern.template.match(this.findPartialsWithStyleModifiersRE);
      return matches;
    },
    // returns any patterns that match {{> value(foo:"bar") }} or {{> value:mod(foo:"bar") }} within the pattern
    findPartialsWithPatternParameters: function(pattern){
      var matches = pattern.template.match(this.findPartialsWithPatternParametersRE);
      return matches;
    },
    findListItems: function(pattern){
      var matches = pattern.template.match(this.findListItemsRE);
      return matches;
    }
  };

  module.exports = engine_twig;
})();
