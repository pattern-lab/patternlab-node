"use strict";

const list_item_hunter = function () {
  const extend = require('util')._extend;
  const _ = require('lodash');
  const smh = require('./style_modifier_hunter');
  const jsonCopy = require('./json_copy');
  const Pattern = require('./object_factory').Pattern;

  const logger = require('./log');
  const parseLink = require('./parseLink');
  const getPartial = require('./get');
  const render = require('./render');

  const style_modifier_hunter = new smh();
  const items = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

  function processListItemPartials(pattern, patternlab) {
    //find any listitem blocks
    const matches = pattern.findListItems();

    if (matches !== null) {

      return matches.reduce((previousMatchPromise, liMatch) => {

        return previousMatchPromise.then(() => {
          logger.debug(`found listItem of size ${liMatch} inside ${pattern.patternPartial}`);

          //find the boundaries of the block
          const loopNumberString = liMatch.split('.')[1].split('}')[0].trim();
          const end = liMatch.replace('#', '/');
          const patternBlock = pattern.template.substring(pattern.template.indexOf(liMatch) + liMatch.length, pattern.template.indexOf(end)).trim();

          //build arrays that repeat the block, however large we need to
          const repeatedBlockTemplate = [];

          //what we will eventually replace our template's listitems block with
          let repeatedBlockHtml = '';

          for (let i = 0; i < items.indexOf(loopNumberString); i++) {

            logger.debug(`list item(s) in pattern ${pattern.patternPartial}, adding ${patternBlock} to repeatedBlockTemplate`);
            repeatedBlockTemplate.push(patternBlock);
          }

          //check for a local listitems.json file
          let listData;
          try {
            listData = jsonCopy(patternlab.listitems, 'config.paths.source.data listitems');
          } catch (err) {
            logger.warning(`There was an error parsing JSON for ${pattern.relPath}`);
            logger.warning(err);
          }

          listData = _.merge(listData, pattern.listitems);
          listData = parseLink(patternlab, listData, 'listitems.json + any pattern listitems.json');

          //iterate over each copied block, rendering its contents
          const allBlocks = repeatedBlockTemplate.reduce((previousPromise, currentBlockTemplate, index) => {

            let thisBlockTemplate = currentBlockTemplate;

            return previousPromise.then(() => {

              //combine listItem data with pattern data with global data
              const itemData = listData['' + items.indexOf(loopNumberString)]; //this is a property like "2"
              let globalData;
              let localData;
              try {
                globalData = jsonCopy(patternlab.data, 'config.paths.source.data global data');
                localData = jsonCopy(pattern.jsonFileData, `${pattern.patternPartial} data`);
              } catch (err) {
                logger.warning(`There was an error parsing JSON for ${pattern.relPath}`);
                logger.warning(err);
              }

              let allData = _.merge(globalData, localData);
              allData = _.merge(allData, itemData !== undefined ? itemData[index] : {}); //itemData could be undefined if the listblock contains no partial, just markup
              allData.link = extend({}, patternlab.data.link);

              //check for partials within the repeated block
              const foundPartials = Pattern.createEmpty({'template': thisBlockTemplate}).findPartials();

              let renderPromise = undefined;

              if (foundPartials && foundPartials.length > 0) {

                for (let j = 0; j < foundPartials.length; j++) {

                  //get the partial
                  const partialName = foundPartials[j].match(/([\w\-\.\/~]+)/g)[0];
                  const partialPattern = getPartial(partialName, patternlab);

                  //create a copy of the partial so as to not pollute it after the get_pattern_by_key call.
                  let cleanPartialPattern;
                  try {
                    cleanPartialPattern = JSON.parse(JSON.stringify(partialPattern));
                    cleanPartialPattern = jsonCopy(partialPattern, `partial pattern ${partialName}`);
                  } catch (err) {
                    logger.warning(`There was an error parsing JSON for ${pattern.relPath}`);
                    logger.warning(err);
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
                renderPromise = render(Pattern.createEmpty({'template': thisBlockTemplate}), allData, patternlab.partials);
              } else {
                //just render with mergedData
                renderPromise = render(Pattern.createEmpty({'template': thisBlockTemplate}), allData, patternlab.partials);
              }

              return renderPromise.then((thisBlockHTML) => {

                //add the rendered HTML to our string
                repeatedBlockHtml = repeatedBlockHtml + thisBlockHTML;
              }).catch((reason) => {
                logger.error(reason);
              });
            }).catch((reason) => {
              logger.error(reason);
            });
          }, Promise.resolve());

          return allBlocks.then(() => {

            //replace the block with our generated HTML
            const repeatingBlock = pattern.extendedTemplate.substring(pattern.extendedTemplate.indexOf(liMatch), pattern.extendedTemplate.indexOf(end) + end.length);
            pattern.extendedTemplate = pattern.extendedTemplate.replace(repeatingBlock, repeatedBlockHtml);

            //update the extendedTemplate in the partials object in case this pattern is consumed later
            patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate;
          }).catch((reason) => {
            logger.error(reason);
          });
        });

      }, Promise.resolve());

    } else {
      return Promise.resolve();
    }
  }

  return {
    process_list_item_partials: function (pattern, patternlab) {
      return processListItemPartials(pattern, patternlab);
    }
  };
};

module.exports = list_item_hunter;
