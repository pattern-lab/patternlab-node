'use strict';

const logger = require('./log');
const pph = require('./pseudopattern_hunter');

// This is now solely for analysis; loading of the pattern file is
// above, in loadPatternIterative()
module.exports = function (pattern, patternlab) {
  //look for a pseudo pattern by checking if there is a file
  //containing same name, with ~ in it, ending in .json
  return pph
    .find_pseudopatterns(pattern, patternlab)
    .then(() => {
      //find any pattern parameters that may be in the current pattern
      pattern.parameteredPartials = pattern.findPartialsWithPatternParameters();
      return Promise.resolve(pattern);
    })
    .catch(
      logger.reportError('There was an error in processPatternIterative():')
    );
};
