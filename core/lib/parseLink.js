"use strict";

const path = require('path');

const logger = require('./log');
const getPartial = require('./get');

module.exports = function (patternlab, obj, key) {
  var linkRE, dataObjAsString, linkMatches;

  //check for 'link.patternPartial'
  linkRE = /(?:'|")(link\.[A-z0-9-_]+)(?:'|")/g;

  //stringify the passed in object
  dataObjAsString = JSON.stringify(obj);
  if (!dataObjAsString) { return obj; }

  //find matches
  linkMatches = dataObjAsString.match(linkRE);

  if (linkMatches) {
    for (var i = 0; i < linkMatches.length; i++) {
      var dataLink = linkMatches[i];
      if (dataLink && dataLink.split('.').length >= 2) {

        //get the partial the link refers to
        var linkPatternPartial = dataLink.split('.')[1].replace('"', '').replace("'", "");
        var pattern = getPartial(linkPatternPartial, patternlab);
        if (pattern !== undefined) {

          //get the full built link and replace it
          var fullLink = patternlab.data.link[linkPatternPartial];
          if (fullLink) {
            fullLink = path.normalize(fullLink).replace(/\\/g, '/');

            logger.debug(`expanded data link from ${dataLink} to ${fullLink} inside ${key}`);

            //also make sure our global replace didn't mess up a protocol
            fullLink = fullLink.replace(/:\//g, '://');
            dataObjAsString = dataObjAsString.replace('link.' + linkPatternPartial, fullLink);
          }
        } else {
          logger.warning(`pattern not found for ${dataLink} inside ${key}`);
        }
      }
    }
  }

  var dataObj;
  try {
    dataObj = JSON.parse(dataObjAsString);
  } catch (err) {
    logger.warning(`There was an error parsing JSON for ${key}`);
    logger.warning(err);
  }

  return dataObj;
};
