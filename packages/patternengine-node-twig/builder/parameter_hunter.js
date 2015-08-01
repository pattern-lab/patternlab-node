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

	var parameter_hunter = function(){

		var extend = require('util')._extend,
		pa = require('./pattern_assembler'),
		mustache = require('mustache'),
		pattern_assembler = new pa();

		function findparameters(pattern, patternlab){

			//find the {{> template-name(*) }} within patterns
			var matches = pattern.template.match(/{{>([ ]+)?([A-Za-z0-9-]+)(\()(.+)(\))([ ]+)?}}/g);
			if(matches !== null){
				matches.forEach(function(pMatch, index, matches){
					//find the partial's name
					var partialName = pMatch.match(/([a-z-]+)/ig)[0]

					if(patternlab.config.debug){
						console.log('found patternParameters for ' + partialName);
					}

					//strip out the additional data and eval
					var leftParen = pMatch.indexOf('(');
					var rightParen = pMatch.indexOf(')');
					var paramString =  '({' + pMatch.substring(leftParen + 1, rightParen) + '})';

					//do no evil. there is no good way to do this that I can think of without using a split, which then makes commas and colons special characters and unusable within the pattern params
					var paramData = eval(paramString);

					//compile this partial immeadiately, essentially consuming it.
					//TODO: see how this affects lineage. perhaps add manually here.
					var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);
					var existingData = pattern.data || patternlab.data;

					//merge paramData with any other data that exists.
					for (var prop in paramData) {
						if (existingData.hasOwnProperty(prop)) {
							existingData[prop] = paramData[prop];
						}
					}

					//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
					existingData.link = extend({}, patternlab.data.link);
					var renderedPartial = pattern_assembler.renderPattern(partialPattern.extendedTemplate, existingData, patternlab.partials);

					//remove the parameter from the partial and replace it with the rendered partial + paramData
					pattern.extendedTemplate = pattern.extendedTemplate.replace(pMatch, renderedPartial);

					//TODO: lineage is missing for this pattern

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
