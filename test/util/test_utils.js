"use strict";

module.exports = {

  // fake pattern lab constructor:
  // sets up a fake patternlab object, which is needed by the pattern processing
  // apparatus.
  fakePatternLab: (testPatternsPath) => {
    var fpl = {
      partials: {},
      patterns: [],
      footer: '',
      header: '',
      listitems: {},
      listItemArray: [],
      data: {
        link: {}
      },
      config: require('../../patternlab-config.json'),
      package: {}
    };

    // patch the pattern source so the pattern assembler can correctly determine
    // the "subdir"
    fpl.config.paths.source.patterns = testPatternsPath;

    return fpl;
  },

  /**
   * Strip out control characters from output if needed so make comparisons easier
   * @param output - the template to strip
   */
  sanitized: (outputTemplate) => {
    return outputTemplate.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/\s\s+/g, ' ').trim();
  }
};
