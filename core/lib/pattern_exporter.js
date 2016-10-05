"use strict";

var fs = require('fs-extra');

var pattern_exporter = function () {

  /**
   * Exports all pattern's final HTML as defined in patternlab-config.json to desired location.
   * Originally created to help facilitate easier consumption by jekyll.
   * This method is off spec with PL PHP and will change or be augmented some day.
   *
   * @param patternlab {object} patternlab reference
   */
  function exportPatterns(patternlab) {
    //read the config export options
    var exportPartials = patternlab.config.patternExportPatternPartials;

    //find the chosen patterns to export
    for (var i = 0; i < exportPartials.length; i++) {
      for (var j = 0; j < patternlab.patterns.length; j++) {
        if (exportPartials[i] === patternlab.patterns[j].patternPartial) {
          //write matches to the desired location
          fs.outputFileSync(patternlab.config.patternExportDirectory + patternlab.patterns[j].patternPartial + '.html', patternlab.patterns[j].patternPartialCode);
        }
      }
    }
  }

  return {
    export_patterns: function (patternlab) {
      exportPatterns(patternlab);
    }
  };

};

module.exports = pattern_exporter;
