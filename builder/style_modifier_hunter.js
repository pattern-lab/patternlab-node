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

	var style_modifier_hunter = function(){

		function consumestylemodifier(pattern, partial, patternlab){

			//extract the classname from the stylemodifier which comes in the format of :className
			var styleModifier = partial.match(/:([\w\-_|])+/g) ? partial.match(/:([\w\-_|])+/g)[0].slice(1) : null;
			if(styleModifier){

				//replace the special character pipe | used to separate multiple classes with a space
				styleModifier = styleModifier.replace(/\|/g, ' ');

				if(patternlab.config.debug){
					console.log('found partial styleModifier within pattern ' + pattern.key);
				}

				//replace the stylemodifier placeholder with the class name
				pattern.extendedTemplate = pattern.extendedTemplate.replace(/{{[ ]?styleModifier[ ]?}}/i, styleModifier);

				//update the extendedTemplate in the partials object in case this pattern is consumed later
				patternlab.partials[pattern.key] = pattern.extendedTemplate;
			}
		}

		return {
			consume_style_modifier: function(pattern, partial, patternlab){
				consumestylemodifier(pattern, partial, patternlab);
			}
		};

	};

	module.exports = style_modifier_hunter;

}());
