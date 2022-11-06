'use strict';

const path = require('path');

const logger = require('./log');
const getPartial = require('./get');

module.exports = function (patternlab, obj, key) {
  //check for 'link.patternPartial'
  const linkRE = /(?:'|")(link\.[\w-]+)(?:'|")/g;

  //stringify the passed in object
  let dataObjAsString;
  dataObjAsString = JSON.stringify(obj);
  if (!dataObjAsString) {
    return obj;
  }

  //find matches
  const linkMatches = dataObjAsString.match(linkRE);

  if (linkMatches) {
    linkMatches.forEach((dataLink) => {
      if (dataLink && dataLink.split('.').length >= 2) {
        //get the partial the link refers to
        const linkPatternPartial = dataLink.split('.')[1].replace(/'|"/g, '');
        const rawLink = `link.${linkPatternPartial}`;
        let replacement = null;

        if (linkPatternPartial.match(/viewall\-.+\-all/)) {
          // Reverse engineer viewall-group-all link (if there is a pattern with that
          // group there will be a view all page for that group)
          const partial = linkPatternPartial
            .replace('viewall-', '')
            .replace('-all', '');
          const pattern = patternlab.patterns.find(
            (p) => p.patternGroup === partial
          );

          if (pattern) {
            replacement = `/patterns/${partial}/index.html`;
          }
        } else if (linkPatternPartial.match(/viewall\-.+/)) {
          // Reverse engineer viewall-group-subgroup link (if there is a pattern with that
          // group and subgroup there will be a view all page for that group)
          const partial = linkPatternPartial.replace('viewall-', '');
          const pattern = patternlab.patterns.find(
            (p) => `${p.patternGroup}-${p.patternSubgroup}` === partial
          );

          if (pattern) {
            replacement = `/patterns/${pattern.flatPatternPath}/index.html`;
          }
        } else {
          // Just search for the pattern partial
          const pattern = getPartial(linkPatternPartial, patternlab);

          if (pattern) {
            // get the full built link and replace it
            let fullLink = patternlab.data.link[linkPatternPartial];
            if (fullLink) {
              fullLink = path.normalize(fullLink).replace(/\\/g, '/');

              logger.debug(
                `expanded data link from ${dataLink} to ${fullLink} inside ${key}`
              );

              // also make sure our global replace didn't mess up a protocol
              replacement = fullLink.replace(/:\//g, '://');
            }
          }
        }

        if (replacement) {
          dataObjAsString = dataObjAsString.replace(rawLink, replacement);
        } else {
          logger.warning(`pattern not found for ${dataLink} inside ${key}`);
        }
      }
    });
  }

  let dataObj;
  try {
    dataObj = JSON.parse(dataObjAsString);
  } catch (err) {
    logger.error(`There was an error parsing JSON for ${key}`);
    logger.error(err);
  }

  return dataObj;
};
