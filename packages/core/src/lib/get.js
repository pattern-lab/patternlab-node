'use strict';

const logger = require('./log');

module.exports = function (partialName, patternlab, reportWarning = true) {
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

  //return the fuzzy match if all else fails
  for (let k = 0; k < patternlab.patterns.length; k++) {
    const partialParts = partialName.split('-');
    const partialType = partialParts[0];
    const partialNameEnd = partialParts.slice(1).join('-');

    if (
      patternlab.patterns[k].patternPartial.split('-')[0] === partialType &&
      patternlab.patterns[k].patternPartial.indexOf(partialNameEnd) > -1
    ) {
      return patternlab.patterns[k];
    }
  }
  if (reportWarning) {
    logger.warning(
      `Could not find pattern referenced with partial syntax "${partialName}" from "${patternlab.config.paths.source.patterns}".
      This can occur when a pattern was renamed, moved, or no longer exists but it still referenced within a different template or within data as a link.`
    );
  }
  return undefined;
};
