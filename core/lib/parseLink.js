'use strict';

const path = require('path');

const logger = require('./log');
const getPartial = require('./get');

module.exports = function(patternlab, obj, key) {
  //check for 'link.patternPartial'
  const linkRE = /(?:'|")(link\.[A-z0-9-_]+)(?:'|")/g;

  //stringify the passed in object
  let dataObjAsString;
  dataObjAsString = JSON.stringify(obj);
  if (!dataObjAsString) {
    return obj;
  }

  //find matches
  const linkMatches = dataObjAsString.match(linkRE);

  if (linkMatches) {
    for (let i = 0; i < linkMatches.length; i++) {
      const dataLink = linkMatches[i];
      if (dataLink && dataLink.split('.').length >= 2) {
        //get the partial the link refers to
        const linkPatternPartial = dataLink
          .split('.')[1]
          .replace('"', '')
          .replace("'", '');
        const pattern = getPartial(linkPatternPartial, patternlab);
        if (pattern !== undefined) {
          //get the full built link and replace it
          let fullLink = patternlab.data.link[linkPatternPartial];
          if (fullLink) {
            fullLink = path.normalize(fullLink).replace(/\\/g, '/');

            logger.debug(
              `expanded data link from ${dataLink} to ${fullLink} inside ${key}`
            );

            //also make sure our global replace didn't mess up a protocol
            fullLink = fullLink.replace(/:\//g, '://');
            dataObjAsString = dataObjAsString.replace(
              'link.' + linkPatternPartial,
              fullLink
            );
          }
        } else {
          logger.warning(`pattern not found for ${dataLink} inside ${key}`);
        }
      }
    }
  }

  let dataObj;
  try {
    dataObj = JSON.parse(dataObjAsString);
  } catch (err) {
    logger.warning(`There was an error parsing JSON for ${key}`);
    logger.warning(err);
  }

  return dataObj;
};
