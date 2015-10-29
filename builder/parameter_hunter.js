/** 
 * patternlab-node - v0.13.0 - 2015
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 * 
 **/(function () {
	"use strict";

	var parameter_hunter = function(){

		var extend = require('util')._extend,
		pa = require('./pattern_assembler'),
		mustache = require('mustache'),
		pattern_assembler = new pa();

		function findparameters(pattern, patternlab){

			//find the {{> template-name(*) }} within patterns
			var matches = pattern.template.match(/{{>([ ]+)?([\w\-\.\/~]+)(\()(.+)(\))([ ]+)?}}/g);
			if(matches !== null){
				//compile this partial immeadiately, essentially consuming it.
				matches.forEach(function(pMatch, index, matches){
					//find the partial's name
					var partialName = pMatch.match(/([\w\-\.\/~]+)/g)[0];

					if(patternlab.config.debug){
						console.log('found patternParameters for ' + partialName);
					}

					//strip out the additional data and eval
					var leftParen = pMatch.indexOf('(');
					var rightParen = pMatch.indexOf(')');
					var paramString =  '({' + pMatch.substring(leftParen + 1, rightParen) + '})';

					//do no evil. there is no good way to do this that I can think of without using a split, which then makes commas and colons special characters and unusable within the pattern params
					var paramData = eval(paramString);

					var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);
					var globalData = JSON.parse(JSON.stringify(patternlab.data));
					var localData = JSON.parse(JSON.stringify(pattern.jsonFileData));

					var allData = pattern_assembler.merge_data(globalData, localData);
					allData = pattern_assembler.merge_data(allData, paramData);

					//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
					allData.link = extend({}, patternlab.data.link);

					var renderedPartial = pattern_assembler.renderPattern(partialPattern.extendedTemplate, allData, patternlab.partials);

					//remove the parameter from the partial and replace it with the rendered partial + paramData
					pattern.extendedTemplate = pattern.extendedTemplate.replace(pMatch, renderedPartial);
				});
			}
		}

		return {
			find_parameters: function(pattern, patternlab){
				findparameters(pattern, patternlab);
			}
		};

	};

	module.exports = parameter_hunter;

}());
