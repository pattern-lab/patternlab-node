/* 
 * patternlab-node - v1.2.2 - 2016 
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
    var pa = require('./pattern_assembler'),
      lh = require('./lineage_hunter');

    var pattern_assembler = new pa();
    var lineage_hunter = new lh();

    for (var i = 0; i < pseudoPatternsArray.length; i++) {
      if (patternlab.config.debug) {
        console.log('found pseudoPattern variant of ' + currentPattern.key);
      }

      //extend any existing data with variant data.
      pattern_assembler.merge_data(currentPattern.jsonFileData, pseudoPatternsArray[i].jsonFileData);

      //see if this file has a state
      pattern_assembler.setPatternState(pseudoPatternsArray[i], patternlab);

      //use the same template as the non-variant
      pseudoPatternsArray[i].template = currentPattern.template;
      pseudoPatternsArray[i].extendedTemplate = currentPattern.extendedTemplate;

      //find pattern lineage
      //TODO: consider repurposing lineage hunter. it currently only works at the
      //iterative level, and isn't called upon any further. however, it could be
      //repurposed to target and render only those files affected by a template edit.
      //this could bring an enormous performance improvement on large projects.
      lineage_hunter.find_lineage(pseudoPatternsArray[i], patternlab);
    }
  }

  return {
    find_pseudopatterns: function (pattern, patternlab, pseudoPatternsArray) {
      findpseudopatterns(pattern, patternlab, pseudoPatternsArray);
    }
  };

};

module.exports = pseudopattern_hunter;
