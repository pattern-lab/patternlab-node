'use strict';

var PatternGraph = require('./../../src/lib/pattern_graph').PatternGraph;

module.exports = {
  // fake pattern lab constructor:
  // sets up a fake patternlab object, which is needed by the pattern processing
  // apparatus.
  fakePatternLab: (testPatternsPath, extraData) => {
    var fpl = {
      graph: PatternGraph.empty(),
      partials: {},
      patterns: [],
      subtypePatterns: {},
      footer: '',
      header: '',
      listitems: {},
      data: {
        link: {},
      },
      config: require('../../patternlab-config.json'),
      package: {},
    };

    // patch the pattern source so the pattern assembler can correctly determine
    // the "subdir"
    fpl.config.paths.source.patterns = testPatternsPath;

    return Object.assign({}, fpl, extraData);
  },

  /**
   * Strip out control characters from output if needed so make comparisons easier
   * @param output - the template to strip
   */
  sanitized: outputTemplate => {
    return outputTemplate
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim();
  },

  /**
   * normalize a string (probably a path) to posix - style
   * @param s - the string or array of strings to normalize path separators to posix - style
   */
  posixPath: s => {
    if (Array.isArray(s)) {
      var paths = [];
      for (let i = 0; i < s.length; i++) {
        paths.push(s[i].replace(/\\/g, '/'));
      }
      return paths;
    } else {
      return s.replace(/\\/g, '/');
    }
  },
};
