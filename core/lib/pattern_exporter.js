"use strict";

var fs = require('fs-extra');
var path = require('path');

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
    var exportAll = patternlab.config.patternExportAll;

    if (exportAll) {
      for (var i = 0; i < patternlab.patterns.length; i++) {
        if (!patternlab.patterns[i].patternPartial.startsWith('-')) {
          exportSinglePattern(patternlab, patternlab.patterns[i]);
        }
      }

      return;
    }

    //find the chosen patterns to export
    for (var i = 0; i < exportPartials.length; i++) {
      for (var j = 0; j < patternlab.patterns.length; j++) {
        if (exportPartials[i] === patternlab.patterns[j].patternPartial) {
          //write matches to the desired location
          exportSinglePattern(patternlab, patternlab.patterns[j]);
        }
      }
    }
  }

  function exportSinglePattern(patternlab, pattern) {
    var preserveDirStructure = patternlab.config.patternExportPreserveDirectoryStructure;
    var patternName = pattern.patternPartial;
    var patternDir = patternlab.config.patternExportDirectory;
    var patternCode = pattern.patternPartialCode;
    var patternFileExtension = ".html";
    if (preserveDirStructure) {
      // Extract the first part of the pattern partial as the directory in which
      // it should go.
      patternDir = path.join(patternDir, pattern.patternPartial.split('-')[0]);
      patternName = pattern.patternPartial.split('-').slice(1).join('-');
    }

    if (patternlab.config.patternExportRaw) {
      patternCode = pattern.extendedTemplate;
      patternFileExtension = "." + JSON.parse(pattern.patternData).patternExtension;
    }

    fs.outputFileSync(path.join(patternDir, patternName) + patternFileExtension, patternCode);
  }

  return {
    export_patterns: function (patternlab) {
      exportPatterns(patternlab);
    }
  };

};

module.exports = pattern_exporter;
