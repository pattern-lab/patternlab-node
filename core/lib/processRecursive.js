"use strict";

const logger = require('./log');
const decompose = require('./decompose');

module.exports = function (file, patternlab) {

  console.log(8, file)

  //find current pattern in patternlab object using file as a partial
  var currentPattern, i;

  for (i = 0; i < patternlab.patterns.length; i++) {
    if (patternlab.patterns[i].relPath === file) {
      currentPattern = patternlab.patterns[i];
    }
  }

  //return if processing an ignored file
  if (typeof currentPattern === 'undefined') { return Promise.resolve(); }

  //we are processing a markdown only pattern
  if (currentPattern.engine === null) { return Promise.resolve(); }

  console.log(25, currentPattern.patternPartial)

  //call our helper method to actually unravel the pattern with any partials
  return decompose(currentPattern, patternlab)
    .catch(reason => {
      console.log(reason);
      logger.error(reason);
    });
};
