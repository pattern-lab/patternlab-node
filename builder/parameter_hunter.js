(function () {
	'use strict';

	function escapeString(string) {
		return '"' + string.replace(/"/gm, '\\"') + '"';
	}

	function convertDotNotationToSafe(string) {
		return string.split('.').map(function(part, index) {
			return !index ? part : '[' + escapeString(part) + ']';
		}).join('');
	}

	function convertObjectToText(objectLevel, fromRealObject) {
		return '{ ' + Object.keys(objectLevel).map(function(key) {
			if (typeof objectLevel[key] === 'object') {
				return escapeString(key) + ' : ' + convertObjectToText(objectLevel[key], fromRealObject);
			} else {
				return escapeString(key) + ' : ' + (fromRealObject && typeof objectLevel[key] === 'string' ? escapeString(objectLevel[key]) : objectLevel[key]);
			}
		}).join(', ') + ' }';
	}

	function escapeParamVariableReferences(paramString) {
		var data = {};
		var parts = paramString.split(':').map(function(part) {
			return part.match(/([^\"\',]*((\'[^\']*\')*||(\"[^\"]*\")*))+/gm).filter(function(partSegment) {
				return partSegment.replace(/\s/gm, '');
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

		var params = Object.keys(data).map(function(key) {
			var values = data[key].split(/\s*\|\|\s*/).map(function(value) {
				var levels = (value || '').match(/([^\"\'.]*((\'[^\']*\')*||(\"[^\"]*\")*))+/gm).filter(function(levelSegment) {
					return levelSegment.replace(/\s/gm, '');
				});

				var isVariable = eval('typeof ' + levels[0]) === 'undefined';
				return '(' + levels.map(function(level, index) {
					var path = levels.slice(0, index + 1).join('.');
					return 'typeof ' + (isVariable ? convertDotNotationToSafe('data.' + path) : path) + ' !== "undefined"';
				}).join(' && ') + ' ? ' + (isVariable ? convertDotNotationToSafe('data.' + value) : value) + ' : undefined)';
			}).join(' || ');

			return {
				key : key,
				values : values
			};
		});

		function fillResultRecursive(resultLevel, remainingParts, value) {
			var currentRemainingPart = remainingParts.shift();
			if (!remainingParts.length) {
				resultLevel[currentRemainingPart] = value;
			} else {
				resultLevel[currentRemainingPart] = resultLevel[currentRemainingPart] || {};
				fillResultRecursive(resultLevel[currentRemainingPart], remainingParts, value);
			}
		}

		var result = {};
		params.forEach(function(param) {
			var keyParts = param.key.split('.');
			fillResultRecursive(result, keyParts, param.values);
		});

		return convertObjectToText(result);
	}

	var parameter_hunter = function(){
		var extend = require('util')._extend,
			pa = require('./pattern_assembler'),
			smh = require('./style_modifier_hunter'),
			style_modifier_hunter = new smh(),
			pattern_assembler = new pa();

		function findparameters(pattern, patternlab, level){
			(pattern_assembler.findPartials(pattern) || []).forEach(function(foundPattern) {
				var partialData = pattern_assembler.getPartialDataByPartialKey(foundPattern, patternlab),
					partialPattern = pattern_assembler.getPatternByFile(partialData.path, patternlab),
					isParametered = pattern.parameteredPartials && pattern.parameteredPartials.indexOf(foundPattern) !== -1;

				var paramData,
					globalData = JSON.parse(JSON.stringify(patternlab.data)),
					localData = JSON.parse(JSON.stringify(pattern.jsonFileData || {})),
					allData = pattern_assembler.merge_data(globalData, localData);

				if (isParametered) {
					var leftParen = foundPattern.indexOf('(');
					var rightParen = foundPattern.length - foundPattern.split('').reverse().join('').indexOf(')');
					var paramString = foundPattern.substring(leftParen + 1, rightParen - 1);

					try {
						patternlab.knownData = patternlab.knownData || allData;
						paramData = eval('(function() { var data = ' + convertObjectToText(patternlab.knownData, true) + '; return ' + escapeParamVariableReferences(paramString) + '; })();');
						Object.keys(paramData).forEach(function(propertyName) {
							patternlab.knownData[propertyName] = paramData[propertyName];
						});
					} catch(e) {
						console.log('ERROR during findparameters:', e, '\nfile:', pattern.abspath, '\nlevel of recursion:', level);
					}
				}

				if (!paramData) {
					paramData = {};
				}

				allData = pattern_assembler.merge_data(allData, paramData);

				//if partial has style modifier data, replace the styleModifier value
				if(pattern.stylePartials && pattern.stylePartials.length > 0){
					style_modifier_hunter.consume_style_modifier(partialPattern, foundPattern, patternlab);
				}

				//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
				allData.link = extend({}, patternlab.data.link);

				findparameters(partialPattern, patternlab, level + 1);
				var renderedPartial = pattern_assembler.renderPattern(partialPattern.extendedTemplate || partialPattern.template, allData, patternlab.partials);

				//remove the parameter from the partial and replace it with the rendered partial + paramData
				pattern.extendedTemplate = (pattern.extendedTemplate || '').replace(foundPattern, renderedPartial);

				patternlab.processedRoots = patternlab.processedRoots || [];
				if (patternlab.processedRoots.indexOf(partialPattern.abspath) === -1) {
					partialPattern.extendedTemplate = '' + partialPattern.template;
				}
				if (!level) {
					patternlab.processedRoots.push(pattern.abspath);
				}
			});
		}

		return {
			find_parameters: function(pattern, patternlab){
				findparameters(pattern, patternlab, 0);
				patternlab.knownData = null;
			}
		};

	};

	module.exports = parameter_hunter;

}());
