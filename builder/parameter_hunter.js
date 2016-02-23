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

	var parameter_hunter = function(){

		var extend = require('util')._extend,
		pa = require('./pattern_assembler'),
		mustache = require('mustache'),
		smh = require('./style_modifier_hunter'),
		style_modifier_hunter = new smh(),
		pattern_assembler = new pa();

		function findparameters(pattern, patternlab){

			if(pattern.parameteredPartials && pattern.parameteredPartials.length > 0){
				//compile this partial immeadiately, essentially consuming it.
				pattern.parameteredPartials.forEach(function(pMatch, index, matches){
					//find the partial's name and retrieve it
					var partialName = pMatch.match(/([\w\-\.\/~]+)/g)[0];
					var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);
					//if we retrieved a pattern we should make sure that its extendedTemplate is reset. looks to fix #190
					partialPattern.extendedTemplate = partialPattern.template;

					if(patternlab.config.debug){
						console.log('found patternParameters for ' + partialName);
					}

					//strip out the additional data, convert string to JSON.
					var leftParen = pMatch.indexOf('(');
					var rightParen = pMatch.indexOf(')');
					var paramString = '{' + pMatch.substring(leftParen + 1, rightParen) + '}';
					//if param keys are wrapped in single quotes, replace with double quotes.
					var paramStringWellFormed = paramString.replace(/(')([^']+)(')(\s*\:)/gm, '"$2"$4');
					//if params keys are not wrapped in any quotes, wrap in double quotes.
					var paramStringWellFormed = paramStringWellFormed.replace(/([\{|,]\s*)([^\:\s]+)(\s*\:)/gm, '$1"$2"$3');
					//if param values are wrapped in single quotes, replace with double quotes.
					var paramStringWellFormed = paramStringWellFormed.replace(/(\:\s*)(')([^']+)(')/gm, '$1"$3"');

					var paramData = {};
					var globalData = {};
					var localData = {};

					try {
						paramData = JSON.parse(paramStringWellFormed);
						globalData = JSON.parse(JSON.stringify(patternlab.data));
						localData = JSON.parse(JSON.stringify(pattern.jsonFileData || {}));
					} catch(e){
						console.log(e);
					}

					var allData = pattern_assembler.merge_data(globalData, localData);
					allData = pattern_assembler.merge_data(allData, paramData);

					//if partial has style modifier data, replace the styleModifier value
					if(pattern.stylePartials && pattern.stylePartials.length > 0){
						style_modifier_hunter.consume_style_modifier(partialPattern, pMatch, patternlab);
					}

					//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
					allData.link = extend({}, patternlab.data.link);

					var renderedPartial = pattern_assembler.renderPattern(partialPattern.extendedTemplate, allData, patternlab.partials);

					//remove the parameter from the partial and replace it with the rendered partial + paramData
					pattern.extendedTemplate = pattern.extendedTemplate.replace(pMatch, renderedPartial);

					//update the extendedTemplate in the partials object in case this pattern is consumed later
					patternlab.partials[pattern.key] = pattern.extendedTemplate;
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
