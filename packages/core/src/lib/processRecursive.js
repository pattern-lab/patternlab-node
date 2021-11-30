'use strict';

const logger = require('./log');
const decompose = require('./decompose');
const getPartial = require('./get');

module.exports = function (file, patternlab) {
  //find current pattern in patternlab object using file as a partial
  const currentPattern = getPartial(file, patternlab, false);

  //return if processing an ignored file
  if (typeof currentPattern === 'undefined') {
    return Promise.resolve();
  }

  //we are processing a markdown only pattern
  if (currentPattern.engine === null) {
    return Promise.resolve();
  }

  //call our helper method to actually unravel the pattern with any partials
  return decompose(currentPattern, patternlab).catch((reason) => {
    console.log(reason);
    logger.error(reason);
  });
};
