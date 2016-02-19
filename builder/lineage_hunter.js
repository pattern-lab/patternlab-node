/*
* patternlab-node - v1.1.1 - 2016
*
* Brian Muenzenmeyer, and the web community.
* Licensed under the MIT license.
*
* Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
*
*/

"use strict";

var pa = require('./pattern_assembler');

function create_lineage_path(pattern, path) {
	return {
			"lineagePattern": pattern,
			"lineagePath": "../../patterns/" + path
		};
}

function get_pattern_name(str) {
	var PATTERN_OPEN = /^\{\{\>( )?/,
			PATTERN_CLOSE = /( )?\}\}$/,
			foundPatternKey = str.replace(PATTERN_OPEN, "").replace(PATTERN_CLOSE, ""),
			patternKey = foundPatternKey.indexOf('('),
			hasPatternKey = patternKey > 0;

	// remove any potential pattern parameters. this and the above are rather brutish but I didn't want to do a regex at the time
	if(hasPatternKey){
		foundPatternKey = foundPatternKey.substring(0, patternKey);
	}

	//remove any potential stylemodifiers.
	foundPatternKey = foundPatternKey.split(':')[0];

	return foundPatternKey;
}

function parse(match, index, matches, pattern, pattern_assembler, patternlab) {
	var foundPatternKey = get_pattern_name(match);

	//get the ancestorPattern
	var ancestorPattern = pattern_assembler.get_pattern_by_key(foundPatternKey, patternlab),
			ancestorPatternExist = pattern.lineageIndex.indexOf(ancestorPattern.key) >= 0;

	if (!ancestorPattern || ancestorPatternExist) {
		return;
	}

	//add it since it didnt exist
	pattern.lineageIndex.push(ancestorPattern.key);

	//create the more complex patternLineage object too
	var l = create_lineage_path(ancestorPattern.key, ancestorPattern.patternLink);
	pattern.lineage.push(JSON.stringify(l));

	//also, add the lineageR entry if it doesn't exist
	var lineageRExist = ancestorPattern.lineageRIndex.indexOf(pattern.key) >= 0;

	if (lineageRExist) {
		return;
	}

	ancestorPattern.lineageRIndex.push(pattern.key);

	//create the more complex patternLineage object in reverse
	var lr = create_lineage_path(pattern.key, pattern.patternLink);
	ancestorPattern.lineageR.push(JSON.stringify(lr));
}

function findlineage(pattern, patternlab){
	var pattern_assembler = new pa();

	var matches = pattern_assembler.find_pattern_partials(pattern);

	if(!matches) {
		return;
	}

	matches.forEach(function(match, index, matches) {
		parse(match, index, matches, pattern, pattern_assembler, patternlab);
	});
}

module.exports = function() {
	return {
		find_lineage: findlineage
	};
}
