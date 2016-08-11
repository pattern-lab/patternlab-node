"use strict";

var list_item_hunter = function () {

  var extend = require('util')._extend,
    JSON5 = require('json5'),
    pa = require('./pattern_assembler'),
    smh = require('./style_modifier_hunter'),
    plutils = require('./utilities'),
    Pattern = require('./object_factory').Pattern;

  var pattern_assembler = new pa(),
    style_modifier_hunter = new smh(),
    items = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  function processListItemPartials(pattern, patternlab) {
    //find any listitem blocks
    var matches = pattern.findListItems();

    if (matches !== null) {
      matches.forEach(function (liMatch) {

        if (patternlab.config.debug) {
          console.log('found listItem of size ' + liMatch + ' inside ' + pattern.patternPartial);
        }

        //find the boundaries of the block
        var loopNumberString = liMatch.split('.')[1].split('}')[0].trim();
        var end = liMatch.replace('#', '/');
        var patternBlock = pattern.template.substring(pattern.template.indexOf(liMatch) + liMatch.length, pattern.template.indexOf(end)).trim();

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
          var globalData;
          var localData;
          try {
            globalData = JSON5.parse(JSON5.stringify(patternlab.data));
            localData = JSON5.parse(JSON5.stringify(pattern.jsonFileData));
          } catch (err) {
            console.log('There was an error parsing JSON for ' + pattern.relPath);
            console.log(err);
          }

          var allData = plutils.mergeData(globalData, localData);
          allData = plutils.mergeData(allData, itemData !== undefined ? itemData[i] : {}); //itemData could be undefined if the listblock contains no partial, just markup
          allData.link = extend({}, patternlab.data.link);

          //check for partials within the repeated block
          var foundPartials = Pattern.createEmpty({'template': thisBlockTemplate}).findPartials();

          if (foundPartials && foundPartials.length > 0) {

            for (var j = 0; j < foundPartials.length; j++) {

              //get the partial
              var partialName = foundPartials[j].match(/([\w\-\.\/~]+)/g)[0];
              var partialPattern = pattern_assembler.getPartial(partialName, patternlab);

              //create a copy of the partial so as to not pollute it after the get_pattern_by_key call.
              var cleanPartialPattern;
              try {
                cleanPartialPattern = JSON5.parse(JSON5.stringify(partialPattern));
              } catch (err) {
                console.log('There was an error parsing JSON for ' + pattern.relPath);
                console.log(err);
              }

              //if we retrieved a pattern we should make sure that its extendedTemplate is reset. looks to fix #356
              cleanPartialPattern.extendedTemplate = cleanPartialPattern.template;

              //if partial has style modifier data, replace the styleModifier value
              if (foundPartials[j].indexOf(':') > -1) {
                style_modifier_hunter.consume_style_modifier(cleanPartialPattern, foundPartials[j], patternlab);
              }

              //replace its reference within the block with the extended template
              thisBlockTemplate = thisBlockTemplate.replace(foundPartials[j], cleanPartialPattern.extendedTemplate);
            }

            //render with data
            thisBlockHTML = pattern_assembler.renderPattern(thisBlockTemplate, allData, patternlab.partials);

          } else {
            //just render with mergedData
            thisBlockHTML = pattern_assembler.renderPattern(thisBlockTemplate, allData, patternlab.partials);
          }

          //add the rendered HTML to our string
          repeatedBlockHtml = repeatedBlockHtml + thisBlockHTML;
        }

        //replace the block with our generated HTML
        var repeatingBlock = pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatch), pattern.extendedTemplate.indexOf(end) + end.length);
        pattern.extendedTemplate = pattern.extendedTemplate.replace(repeatingBlock, repeatedBlockHtml);

        //update the extendedTemplate in the partials object in case this pattern is consumed later
        patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate;

      });
    }
  }

  return {
    process_list_item_partials: function (pattern, patternlab) {
      processListItemPartials(pattern, patternlab);
    }
  };
};

module.exports = list_item_hunter;
