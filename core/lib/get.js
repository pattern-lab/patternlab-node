'use strict';

const logger = require('./log');

module.exports = function(partialName, patternlab) {
  //look for exact partial matches
  for (var i = 0; i < patternlab.patterns.length; i++) {
    if (patternlab.patterns[i].patternPartial === partialName) {
      return patternlab.patterns[i];
    }
  }

  //else look by verbose syntax
  for (var i = 0; i < patternlab.patterns.length; i++) {
    switch (partialName) {
      case patternlab.patterns[i].relPath:
        return patternlab.patterns[i];
      case patternlab.patterns[i].verbosePartial:
        return patternlab.patterns[i];
    }
  }

  //return the fuzzy match if all else fails
  for (var i = 0; i < patternlab.patterns.length; i++) {
    let partialParts = partialName.split('-'),
      partialType = partialParts[0],
      partialNameEnd = partialParts.slice(1).join('-');

    if (
      patternlab.patterns[i].patternPartial.split('-')[0] === partialType &&
      patternlab.patterns[i].patternPartial.indexOf(partialNameEnd) > -1
    ) {
      return patternlab.patterns[i];
    }
  }
  logger.warning(
    'Could not find pattern referenced with partial syntax ' +
      partialName +
      '. This can occur when a pattern was renamed, moved, or no longer exists but it still referenced within a different template or within data as a link.'
  );
  return undefined;
};
