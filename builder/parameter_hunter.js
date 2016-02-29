/* 
 * patternlab-node - v1.1.1 - 2016 
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

		function findparameters(pattern, patternlab, startFile){
            var renderedPartial;
            var renderedTemplate = pattern.extendedTemplate;

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

					//strip out the additional data and eval
					var leftParen = pMatch.indexOf('(');
					var rightParen = pMatch.indexOf(')');
					var paramString =  '({' + pMatch.substring(leftParen + 1, rightParen) + '})';

					//do no evil. there is no good way to do this that I can think of without using a split, which then makes commas and colons special characters and unusable within the pattern params
					var paramData = eval(paramString);

					var globalData = JSON.parse(JSON.stringify(patternlab.data));
                    var localData = JSON.parse(JSON.stringify(pattern.jsonFileData || {}));
                    var startPattern = pattern_assembler.get_pattern_by_key(startFile, patternlab);
                    var startData = JSON.parse(JSON.stringify(startPattern.jsonFileData || {}));

      //in order to token-replace parameterized tags, prepare for rendering Mustache
      //replace global, file-specific, and param data. however, since partial inclusion
      //is not done here, escape partial tags by switching them to ERB syntax.
var extendedTemplateEscaped = partialPattern.extendedTemplate.replace(/{{>([^}]+)}}/g, '<%>$1%>');
      //then set the new delimiter at the beginning of the extended template
//      extendedTemplateEscaped = '{{=<% %>=}}' + extendedTemplateEscaped;


      //render the newly delimited partial
//      var renderedPartial = pattern_assembler.renderPattern(extendedTemplateEscaped, paramData, patternlab.partials);

					var allData = pattern_assembler.merge_data(globalData, startData);
					allData = pattern_assembler.merge_data(allData, localData);
					allData = pattern_assembler.merge_data(allData, paramData);

					//if partial has style modifier data, replace the styleModifier value
					if(pattern.stylePartials && pattern.stylePartials.length > 0){
						style_modifier_hunter.consume_style_modifier(partialPattern, pMatch, patternlab);
					}

					//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
					allData.link = extend({}, patternlab.data.link);

/*
      //in pre-render, escape all tags which correspond to keys in the allData object
      //in order to do so, escape the partials by switching them to ERB
      var escapeLoopsAndConditionals = function(dataKey) {
        var escapeString = new RegExp('{{([{#\\^\\/&]?\\s*' + dataKey + '\\s*}?)}}', 'g');
        renderedPartial = renderedPartial.replace(escapeString, '<%$1%>');
      };
      pattern_assembler.traverse_data(allData, escapeLoopsAndConditionals);

      //also escape partial includes and listItems loops
      renderedPartial = renderedPartial.replace(/{{> ([^\}]+)}}/g, '<%> $1%>');
      renderedPartial = renderedPartial.replace(/{{([#\/]\s*listItems.[a-z]+\s*)}}/g, '<%$1%>');
*/

      //the reasoning for rendering at this point is to eliminate the unwanted
      //recursion paths that would remain if irrelevant Mustache conditionals persisted
console.log(typeof extendedTemplateEscaped);
      extendedTemplateEscaped = pattern_assembler.renderPattern(extendedTemplateEscaped, allData);

      //after that's done, switch back to standard Mustache tags
      renderedPartial = extendedTemplateEscaped.replace(/<%>([^%]+)%>/g, '{{>$1}}');

					//remove the parameter from the partial and replace it with the rendered partial + paramData
                    renderedTemplate = renderedTemplate.replace(pMatch, renderedPartial);
if (startFile.indexOf('04-pages/00-homepage') > -1) {
  console.log('pMatch');
  console.log(pMatch);
  console.log('renderedPartial');
  console.log(renderedPartial);
  console.log('renderedTemplate');
  console.log(renderedTemplate);
}

					//update the extendedTemplate in the partials object in case this pattern is consumed later
					patternlab.partials[pattern.key] = renderedTemplate;
				});

var parameteredPartialsNew = pattern_assembler.find_pattern_partials_with_parameters(renderedTemplate);
pattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(renderedTemplate);
pattern.extendedTemplate = renderedTemplate;

if(pattern.parameteredPartials){
//pattern.extendedTemplate = findparameters(pattern, patternlab, startFile);
findparameters(pattern, patternlab, startFile);
console.log('doing');
console.log(pattern);
  console.log(renderedPartial);
}
if (startFile.indexOf('04-pages/00-homepage') > -1) {
}

//                return renderedTemplate;
			}
		}

		return {
			find_parameters: function(pattern, patternlab, startFile){
//				return findparameters(pattern, patternlab, startFile);
findparameters(pattern, patternlab, startFile);
			}
		};

	};

	module.exports = parameter_hunter;

}());
