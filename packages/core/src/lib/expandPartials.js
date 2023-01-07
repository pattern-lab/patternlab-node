'use strict';

const logger = require('./log');
const jsonCopy = require('./json_copy');
const getPartial = require('./get');

module.exports = function (currentPattern, patternlab) {
  const processRecursive = require('./processRecursive');

  //find how many partials there may be for the given pattern
  const foundPatternPartials = currentPattern.findPartials();

  // expand any partials present in this pattern; that is, drill down into
  // the template and replace their calls in this template with rendered
  // results
  if (
    currentPattern.engine.expandPartials &&
    foundPatternPartials !== null &&
    foundPatternPartials.length > 0
  ) {
    logger.debug(`found partials for ${currentPattern.patternPartial}`);
  }
  return Promise.resolve();
};
