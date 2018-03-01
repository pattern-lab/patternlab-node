'use strict';

const logger = require('./log');
const _ = require('lodash');

module.exports = function(partialName, patternlab) {
  if (patternlab.patterns.length > 0) {
    //look for exact partial matches
    for (let i = 0; i < patternlab.patterns.length; i++) {
      if (patternlab.patterns[i].patternPartial === partialName) {
        return patternlab.patterns[i];
      }
    }

    //else look by verbose syntax
    for (let j = 0; j < patternlab.patterns.length; j++) {
      switch (partialName) {
        case patternlab.patterns[j].relPath:
          return patternlab.patterns[j];
        case patternlab.patterns[j].verbosePartial:
          return patternlab.patterns[j];
      }
    }

    const partialParts = partialName.split('-');
    const partialType = partialParts[0];
    const partialNameEnd = partialParts.slice(1).join('-');

    //return the fuzzy match if all else fails
    for (let k = 0; k < patternlab.patterns.length; k++) {
      if (
        patternlab.patterns[k].patternPartial.split('-')[0] === partialType &&
        patternlab.patterns[k].patternPartial.indexOf(partialNameEnd) > -1
      ) {
        return patternlab.patterns[k];
      }
    }

    // Use fuzzy scoring
    const scoredPartials = patternlab.patterns
      .map(pattern => {
        const patternParts = pattern.patternPartial.split('-');

        let score = 0;
        score += _.intersection(partialParts, patternParts).length;
        score -= _.difference(partialParts, patternParts).length;
        score -= _.difference(patternParts, partialParts).length;

        return Object.assign({ score }, pattern);
      })
      .sort((a, b) => b.score - a.score);

    return scoredPartials[0].path;
  }

  logger.warning(
    'Could not find pattern referenced with partial syntax ' +
      partialName +
      '. This can occur when a pattern was renamed, moved, or no longer exists but it still referenced within a different template or within data as a link.'
  );
  return undefined;
};
