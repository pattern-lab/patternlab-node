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

	function escapeParamVariableReferences(paramString) {
		var data = {};
		var parts = paramString.split(':').map(function(part) {
			return part.match(/([^\"\',]*((\'[^\']*\')*||(\"[^\"]*\")*))+/g).filter(function(partSegment) {
				return partSegment.replace(/\s/g, '');
			});
		}).reduce(function(prevPart, nextPart) {
			return prevPart.concat(nextPart);
		});

		parts.forEach(function(value, key) {
			if (!(key % 2)) {
				try {
					data[value.trim()] = parts[key+1].trim();
				} catch (e) {
					console.log('ERROR: escaping failed for:', parts, e);
				}
			}
		});

		return Object.keys(data).map(function(key) {
			var values = data[key].split(/\s*\|\|\s*/).map(function(value) {
				if (eval('typeof ' + value) === 'undefined') {
					value = '(typeof ' + value + ' !== "undefined" ? ' + value + ' : undefined)';
				}
				return value;
			}).join(' || ');

			return key + ' : ' + values;
		}).join(', ');
	}

	var parameter_hunter = function(){

		var extend = require('util')._extend,
			pa = require('./pattern_assembler'),
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

					if(patternlab.config.debug){
						console.log('found patternParameters for ' + partialName);
					}

					//strip out the additional data and eval
					var leftParen = pMatch.indexOf('(');
					var rightParen = pMatch.length - pMatch.split('').reverse().join('').indexOf(')');
					var paramString = pMatch.substring(leftParen + 1, rightParen - 1);
					var paramData;

					try {
						patternlab.knownData = patternlab.knownData || {};
						var knownDataString = Object.keys(patternlab.knownData).map(function(propertyName) {
							var value = patternlab.knownData[propertyName];
							return 'var ' + propertyName + ' = ' + (typeof value === 'string' ? '"' + value + '"' : value) + ';';
						}).join('');

						paramData = eval('(function() { ' + knownDataString + ' return {' + escapeParamVariableReferences(paramString) + '}; })();');
						Object.keys(paramData).forEach(function(propertyName) {
							patternlab.knownData[propertyName] = paramData[propertyName];
						});
					} catch(e) {
						console.log('ERROR during findparameters:', e, '\nfile:', pattern.abspath, '\n');
					}

					if (!paramData) {
						// something went wrong!
						paramData = {};
					}

					var globalData = JSON.parse(JSON.stringify(patternlab.data));
					var localData = JSON.parse(JSON.stringify(pattern.jsonFileData || {}));

					var allData = pattern_assembler.merge_data(globalData, localData);
					allData = pattern_assembler.merge_data(allData, paramData);

					//if partial has style modifier data, replace the styleModifier value
					if(pattern.stylePartials && pattern.stylePartials.length > 0){
						style_modifier_hunter.consume_style_modifier(partialPattern, pMatch, patternlab);
					}

					//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
					allData.link = extend({}, patternlab.data.link);

					findparameters(partialPattern, patternlab);
					var renderedPartial = pattern_assembler.renderPattern(partialPattern.extendedTemplate, allData, patternlab.partials);

					//remove the parameter from the partial and replace it with the rendered partial + paramData
					pattern.extendedTemplate = pattern.extendedTemplate.replace(pMatch, renderedPartial);
					partialPattern.extendedTemplate = '' + partialPattern.template;
				});
			}
		}

		return {
			find_parameters: function(pattern, patternlab){
				return findparameters(pattern, patternlab);
			}
		};

	};

	module.exports = parameter_hunter;

}());
