'use strict';

const PatternGraph = require('./pattern_graph').PatternGraph;

/**
 * If a graph was serialized and then {@code deletePatternDir == true}, there is a mismatch in the
 * pattern metadata and not all patterns might be recompiled.
 * For that reason an empty graph is returned in this case, so every pattern will be flagged as
 * "needs recompile". Otherwise the pattern graph is loaded from the meta data.
 *
 * @param patternlab
 * @param {boolean} deletePatternDir When {@code true}, an empty graph is returned
 * @return {PatternGraph}
 */
module.exports = (patternlab, deletePatternDir) => {
  // Sanity check to prevent problems when code is refactored
  if (deletePatternDir) {
    return PatternGraph.empty();
  }
  return PatternGraph.loadFromFile();
};
