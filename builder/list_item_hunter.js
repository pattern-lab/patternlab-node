/* 
 * patternlab-node - v0.15.1 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
	"use strict";

	var list_item_hunter = function(){

		var extend = require('util')._extend,
				pa = require('./pattern_assembler'),
				smh = require('./style_modifier_hunter'),
				plutils = require('./utilities'),
				config = require('../config.json'),
        of = require('./object_factory');

		var pattern_assembler = new pa(),
				style_modifier_hunter = new smh(),
				items = [ 'zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

		function processListItemPartials(pattern, patternlab){
			//find any listitem blocks
			var matches = pattern.findListItems();

			if(matches !== null){
				matches.forEach(function(liMatch, index, matches){

					if(config.debug){
						console.log('found listItem of size ' + liMatch + ' inside ' + pattern.key);
					}

					//find the boundaries of the block
					var loopNumberString = liMatch.split('.')[1].split('}')[0].trim();
					var end = liMatch.replace('#', '/');
					var patternBlock = pattern.template.substring(pattern.template.indexOf(liMatch) + liMatch.length, pattern.template.indexOf(end)).trim();
					//build arrays that repeat the block, however large we need to
					var repeatedBlockTemplate = [];
					var repeatedBlockHtml = '';
					for(var i = 0; i < items.indexOf(loopNumberString); i++){
            if (config.debug) {
              console.log('list item(s) in pattern', pattern.patternName, 'adding', patternBlock, 'to repeatedBlockTemplate');
            }
						repeatedBlockTemplate.push(patternBlock);
					}

					//check for a local listitems.json file
					var listData = JSON.parse(JSON.stringify(patternlab.listitems));
					listData = plutils.mergeData(listData, pattern.listitems);

					//iterate over each copied block, rendering its contents along with pattenlab.listitems[i]
					for(var i = 0; i < repeatedBlockTemplate.length; i++){

						var thisBlockTemplate = repeatedBlockTemplate[i];
						var thisBlockHTML = "";

						//combine listItem data with pattern data with global data
						var itemData = listData['' + items.indexOf(loopNumberString)]; //this is a property like "2"
						var globalData = JSON.parse(JSON.stringify(patternlab.data));
						var localData = JSON.parse(JSON.stringify(pattern.jsonFileData));

						var allData = plutils.mergeData(globalData, localData);
						allData = plutils.mergeData(allData, itemData != undefined ? itemData[i] : {}); //itemData could be undefined if the listblock contains no partial, just markup
						allData.link = extend({}, patternlab.data.link);

						//check for partials within the repeated block
						var foundPartials = of.oPattern.createEmpty({'template': thisBlockTemplate}).findPartials();

						if(foundPartials && foundPartials.length > 0){

							for(var j = 0; j < foundPartials.length; j++){

								//get the partial
								var partialName = foundPartials[j].match(/([\w\-\.\/~]+)/g)[0];
								var partialPattern = pattern_assembler.get_pattern_by_key(partialName, patternlab);

								//if partial has style modifier data, replace the styleModifier value
								if(pattern.stylePartials && pattern.stylePartials.length > 0){
									style_modifier_hunter.consume_style_modifier(partialPattern, foundPartials[j], patternlab);
								}

								//replace its reference within the block with the extended template
								thisBlockTemplate = thisBlockTemplate.replace(foundPartials[j], partialPattern.extendedTemplate);
							}

							//render with data
							thisBlockHTML = pattern_assembler.renderPattern(thisBlockTemplate, allData, patternlab.partials);

						} else{
							//just render with mergedData
							thisBlockHTML = pattern_assembler.renderPattern(thisBlockTemplate, allData, patternlab.partials);
						}

						//add the rendered HTML to our string
						repeatedBlockHtml = repeatedBlockHtml + thisBlockHTML;
					}

					//replace the block with our generated HTML
					var repeatingBlock = pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatch), pattern.extendedTemplate.indexOf(end) + end.length);
					pattern.extendedTemplate = pattern.extendedTemplate.replace(repeatingBlock, repeatedBlockHtml);

				});
			}
		}

		return {
			process_list_item_partials: function(pattern, patternlab){
				processListItemPartials(pattern, patternlab);
			}
		};

	};

	module.exports = list_item_hunter;

}());
