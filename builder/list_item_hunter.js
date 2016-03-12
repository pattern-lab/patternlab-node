/*
 * patternlab-node - v1.1.3 - 2016
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

"use strict";

var list_item_hunter = function () {

  var extend = require('util')._extend,
    pa = require('./pattern_assembler'),
    smh = require('./style_modifier_hunter'),
    pattern_assembler = new pa(),
    style_modifier_hunter = new smh(),
    items = [ 'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  function getListItemIterationKeys() {
    return items;
  }

  function processListItemPartials(pattern, patternlab) {
    //find any listitem blocks
    var liMatches = pattern_assembler.find_list_items(pattern.extendedTemplate, patternlab);
    if (liMatches !== null) {
//console.log('patternBlock');
      for (var i = 0; i < liMatches.length; i++) {

        if (patternlab.config.debug) {
          console.log('found listItem of size ' + liMatches[i] + ' inside ' + pattern.key);
        }

        //find the boundaries of the block
        var loopNumberString = liMatches[i].split('.')[1].split('}')[0].trim();
if (pattern.abspath.indexOf('02-organisms/02-comments/00-comment-thread.mustache') > -1) {
//console.log(loopNumberString);
}
        var end = liMatches[i].replace('#', '/');
        var patternBlock = pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatches[i]) + liMatches[i].length, pattern.extendedTemplate.indexOf(end)).trim();

        //build arrays that repeat the block, however large we need to
        var repeatedBlockTemplate = [];
        var repeatedBlockHtml = '';
        var j; // for loops

        for (j = 0; j < items.indexOf(loopNumberString); j++) {
          repeatedBlockTemplate.push(patternBlock);
        }

        //check for a local listitems.json file
//        var listData = pattern_assembler.merge_data(patternlab.listitems, pattern.listitems);
if (pattern.abspath.indexOf('02-organisms/02-comments/00-comment-thread.mustache') > -1) {
//  console.log(pattern.extendedTemplate);
//  console.log(patternBlock);
//console.log(pattern.listitems);
}

        //iterate over each copied block, rendering its contents along with pattenlab.listitems[j]
        for (j = 0; j < repeatedBlockTemplate.length; j++) {
          var thisBlockTemplate = repeatedBlockTemplate[j];
          var thisBlockHTML = "";

          var itemData = pattern.listitems['' + items.indexOf(loopNumberString)]; //this is a property like "2"
          var patternData = pattern.jsonFileData;
          var allData = pattern_assembler.merge_data(patternData, itemData !== undefined ? itemData[j] : {}); //itemData could be undefined if the listblock contains no partial, just markup

if (pattern.abspath.indexOf('02-organisms/02-comments/00-comment-thread.mustache') > -1) {
  console.log(pattern.abspath);
//  console.log(thisBlockTemplate);
//  console.log(loopNumberString);
/*
console.log('BEGIN pattern.listitems[\'5\']');
console.log(pattern.listitems['5']);

console.log('END pattern.listitems[\'5\']');
*/
console.log('BEGIN ' + i);
console.log(allData);
console.log('END ' + i);
}
          thisBlockHTML = pattern_assembler.renderPattern(patternBlock, allData);

          //add the rendered HTML to our string
          repeatedBlockHtml = repeatedBlockHtml + thisBlockHTML;
        }

        //replace the block with our generated HTML
        var repeatingBlock = pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatches[i]), pattern.extendedTemplate.indexOf(end) + end.length);
        pattern.extendedTemplate = pattern.extendedTemplate.replace(repeatingBlock, repeatedBlockHtml);
if (pattern.abspath.indexOf('02-organisms/02-comments/00-comment-thread.mustache') > -1) {
//  console.log('repeatedBlockHtml');
//  console.log(repeatedBlockHtml);
}

      }
    }
  }

  return {
    get_list_item_iteration_keys: function() {
      return getListItemIterationKeys();
    },
    process_list_item_partials: function (pattern, patternlab) {
      processListItemPartials(pattern, patternlab);
    }
  };

};

module.exports = list_item_hunter;
