"use strict";

var list_item_hunter = function () {

  var extend = require('util')._extend,
    JSON5 = require('json5'),
    pa = require('./pattern_assembler'),
    plutils = require('./utilities');

  var pattern_assembler = new pa(),
    items = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  function getEnd(liMatch) {
    return liMatch.replace('#', '/');
  }

  function getPatternBlock(pattern, liMatch, end) {
    return pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatch) + liMatch.length, pattern.extendedTemplate.indexOf(end));
  }

  function preprocessListItemPartials(pattern) {
    //find any listitem blocks
    var matches = pattern.findListItems();

    if (matches !== null) {
      matches.forEach(function (liMatch) {
        var end = getEnd(liMatch);
        var patternBlock = getPatternBlock(pattern, liMatch, end);
        var partials = pattern.engine.findPartials(patternBlock);

        //escape listitem blocks with partials
        if (partials) {
          var liMatchEscaped = '\u0002' + liMatch.slice(2);
          var endEscaped = '\u0002' + end.slice(2);
          var find = liMatch + patternBlock + end;
          var replace = liMatchEscaped + patternBlock + endEscaped;

          pattern.extendedTemplate = pattern.extendedTemplate.replace(find, replace);
        }
      });
    }
  }

  function postprocessListItemPartials(pattern) {
    //find any listitem blocks
    var matches = pattern.extendedTemplate.match(/\u0002(.|\s)*?\}\}/g);

    if (matches !== null) {
      matches.forEach(function (liMatch) {
        var replace = '{{' + liMatch.slice(1);

        pattern.extendedTemplate = pattern.extendedTemplate.replace(liMatch, replace);
      });
    }
  }

  function processListItemPartials(pattern, patternlab) {
    preprocessListItemPartials(pattern);

    //find any listitem blocks
    var matches = pattern.findListItems();

    if (matches !== null) {
      matches.forEach(function (liMatch) {

        if (patternlab.config.debug) {
          console.log('found listItem of size ' + liMatch + ' inside ' + pattern.patternPartial);
        }

        //find the boundaries of the block
        var loopNumberString = liMatch.split('.')[1].split('}')[0].trim();
        var end = getEnd(liMatch);
        var patternBlock = getPatternBlock(pattern, liMatch, end).trim();

        //build arrays that repeat the block, however large we need to
        var repeatedBlockTemplate = [];
        var repeatedBlockHtml = '';
        for (var i = 0; i < items.indexOf(loopNumberString); i++) {
          if (patternlab.config.debug) {
            console.log('list item(s) in pattern', pattern.patternPartial, 'adding', patternBlock, 'to repeatedBlockTemplate');
          }
          repeatedBlockTemplate.push(patternBlock);
        }

        //check for a local listitems.json file
        var listData;
        try {
          listData = JSON5.parse(JSON5.stringify(patternlab.listitems));
        } catch (err) {
          console.log('There was an error parsing JSON for ' + pattern.relPath);
          console.log(err);
        }

        listData = plutils.mergeData(listData, pattern.listitems);
        listData = pattern_assembler.parse_data_links_specific(patternlab, listData, 'listitems.json + any pattern listitems.json');

        //iterate over each copied block, rendering its contents along with pattenlab.listitems[i]
        for (var i = 0; i < repeatedBlockTemplate.length; i++) {

          var thisBlockTemplate = repeatedBlockTemplate[i];
          var thisBlockHTML = "";

          //combine listItem data with pattern data with global data
          var itemData = listData['' + items.indexOf(loopNumberString)]; //this is a property like "2"
          var allData = plutils.mergeData(pattern.allData, itemData !== undefined ? itemData[i] : {}); //itemData could be undefined if the listblock contains no partial, just markup
          allData.link = extend({}, patternlab.data.link);

          //just render with mergedData
          thisBlockHTML = pattern_assembler.renderPattern(thisBlockTemplate, allData);

          //add the rendered HTML to our string
          repeatedBlockHtml = repeatedBlockHtml + thisBlockHTML;
        }

        //replace the block with our generated HTML
        var repeatingBlock = pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatch), pattern.extendedTemplate.indexOf(end) + end.length);
        pattern.extendedTemplate = pattern.extendedTemplate.replace(repeatingBlock, repeatedBlockHtml);

      });
    }

    postprocessListItemPartials(pattern);
  }

  return {
    process_list_item_partials: function (pattern, patternlab) {
      processListItemPartials(pattern, patternlab);
    },
    items: items
  };
};

module.exports = list_item_hunter;
