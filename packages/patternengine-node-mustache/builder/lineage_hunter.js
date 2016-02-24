/* 
 * patternlab-node - v1.1.2 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
	"use strict";

	var lineage_hunter = function(){

		function findlineage(pattern, patternlab){

			var pa = require('./pattern_assembler');
			var pattern_assembler = new pa();

			//find the {{> template-name }} within patterns
			var matches = pattern.findPartials();
			if(matches !== null){
				matches.forEach(function(match, index, matches){
					//get the ancestorPattern
					var ancestorPattern = pattern_assembler.get_pattern_by_key(pattern.findPartialKey(match), patternlab);

					if (ancestorPattern && pattern.lineageIndex.indexOf(ancestorPattern.key) === -1){
							//add it since it didnt exist
						pattern.lineageIndex.push(ancestorPattern.key);

							//create the more complex patternLineage object too
							var l = {
								"lineagePattern": ancestorPattern.key,
								"lineagePath": "../../patterns/" + ancestorPattern.patternLink
							};
							pattern.lineage.push(JSON.stringify(l));

							//also, add the lineageR entry if it doesn't exist
							if (ancestorPattern.lineageRIndex.indexOf(pattern.key) === -1){
								ancestorPattern.lineageRIndex.push(pattern.key);

								//create the more complex patternLineage object in reverse
								var lr = {
									"lineagePattern": pattern.key,
									"lineagePath": "../../patterns/" + pattern.patternLink
								};
								ancestorPattern.lineageR.push(JSON.stringify(lr));
							}
					}
				});
			}
		}

		return {
			find_lineage: function(pattern, patternlab){
				findlineage(pattern, patternlab);
			}
		};

	};

	module.exports = lineage_hunter;

}());
