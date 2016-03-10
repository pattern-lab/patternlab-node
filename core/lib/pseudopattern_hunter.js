/* 
 * patternlab-node - v1.2.0 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

"use strict";

var pseudopattern_hunter = function () {

  function findpseudopatterns(currentPattern, patternlab, pseudoPatternsArray) {
    var glob = require('glob'),
      fs = require('fs-extra'),
      pa = require('./pattern_assembler'),
      lh = require('./lineage_hunter'),
      of = require('./object_factory'),
      path = require('path');

    var pattern_assembler = new pa();
    var lineage_hunter = new lh();
    var paths = patternlab.config.paths;

    for (var i = 0; i < pseudoPatternsArray.length; i++) {
      if (patternlab.config.debug) {
        console.log('found pseudoPattern variant of ' + currentPattern.key);
      }

      //extend any existing data with variant data
      var variantFileData = pattern_assembler.merge_data(currentPattern.jsonFileData, pseudoPatternsArray[i].jsonFileData);

      //see if this file has a state
      pattern_assembler.setPatternState(pseudoPatternsArray[i], patternlab);

      //use the same template as the non-variant
      pseudoPatternsArray[i].extendedTemplate = currentPattern.extendedTemplate;
if (currentPattern.abspath.indexOf('04-pages/00-homepage.mustache') > -1) {
  /*
        console.log('pseudoPatternsArray[i].extendedTemplate');
        console.log(pseudoPatternsArray[i].extendedTemplate);
        console.log('pseudoPatternsArray[i].jsonFileData');
        console.log(pseudoPatternsArray[i].jsonFileData);
        */
}

      //find pattern lineage
//      lineage_hunter.find_lineage(patternVariant, patternlab);
    }
  }

  return {
    find_pseudopatterns: function (pattern, patternlab, pseudoPatternsArray) {
      findpseudopatterns(pattern, patternlab, pseudoPatternsArray);
    }
  };

};

module.exports = pseudopattern_hunter;
