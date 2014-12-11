/* 
 * patternlab-node - v0.1.6 - 2014 
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

			pattern.lineage = [];
			pattern.lineageIndex = [];
			//find the {{> template-name }} within patterns
			var matches = pattern.template.match(/{{>([ ]+)?([A-Za-z0-9-]+)(?:\:[A-Za-z0-9-]+)?(?:(| )\(.*)?([ ]+)}}/g);
			if(matches !== null){
				matches.forEach(function(match, index, matches){
					//strip out the template cruft
					var cleanPattern = match.replace("{{> ", "").replace(" }}", "");

					//add if it doesnt exist
					if (pattern.lineageIndex.indexOf(cleanPattern) === -1){

						pattern.lineageIndex.push(cleanPattern);

						patternlab.patterns.forEach(function(p, index, patterns){

							//find the pattern in question
							var searchPattern = p.patternGroup + "-" + p.patternName;

							if(searchPattern === cleanPattern){
								//create the more complex patternLineage object too
								var l = {
									"lineagePattern": cleanPattern,
									"lineagePath": "../../patterns/" + p.patternLink
								}
								pattern.lineage.push(JSON.stringify(l));
							}

						});

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