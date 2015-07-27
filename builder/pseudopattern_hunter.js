/* 
 * patternlab-node - v0.10.0 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
	"use strict";

	var pseudopattern_hunter = function(){

    var extend = require('util')._extend,
        glob = require('glob'),
        fs = require('fs-extra'),
				pa = require('./pattern_assembler'),
        lh = require('./lineage_hunter'),
        of = require('./object_factory'),
				mustache = require('mustache');

		var pattern_assembler = new pa();
    var lineage_hunter = new lh();

    function findpseudopatterns(currentPattern, subdir, patternlab){

      //look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
      var needle = currentPattern.subdir + '/' + currentPattern.fileName+ '~*.json';
      var pseudoPatterns = glob.sync(needle, {
        cwd: 'source/_patterns/', //relative to gruntfile
        debug: false,
        nodir: true,
      });

      if(pseudoPatterns.length > 0){
        for(var i = 0; i < pseudoPatterns.length; i++){
          //we want to do everything we normally would here, except instead head the pseudoPattern data
          var variantFileData = fs.readJSONSync('source/_patterns/' + pseudoPatterns[i]);

          //extend any existing data with variant data
          variantFileData = extend(variantFileData, currentPattern.data);

          var variantName = pseudoPatterns[i].substring(pseudoPatterns[i].indexOf('~') + 1).split('.')[0];
          var patternVariant = new of.oPattern(subdir, currentPattern.fileName + '-' + variantName + '.mustache', variantFileData);

          //see if this file has a state
          pattern_assembler.setPatternState(patternVariant, patternlab);

          //use the same template as the non-variant
          patternVariant.template = currentPattern.template;

          //find pattern lineage
          lineage_hunter.find_lineage(patternVariant, patternlab);

          //add to patternlab object so we can look these up later.
          pattern_assembler.addPattern(patternVariant, patternlab);
        }
      }

    }

    return {
      find_pseudopatterns: function(pattern, subdir, patternlab){
        findpseudopatterns(pattern, subdir, patternlab);
      }
    };

  };

  module.exports = pseudopattern_hunter;

}());
