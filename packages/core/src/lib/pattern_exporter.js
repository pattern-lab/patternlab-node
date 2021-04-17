'use strict';

const fs = require('fs-extra');
const path = require('path');

function exportSinglePattern(patternlab, pattern) {
  const preserveDirStructure =
    patternlab.config.patternExportPreserveDirectoryStructure;
  let patternName = pattern.patternPartial;
  let patternDir = patternlab.config.patternExportDirectory;
  let patternCode = pattern.patternPartialCode;
  let patternFileExtension = '.html';
  if (preserveDirStructure) {
    // Extract the first part of the pattern partial as the directory in which
    // it should go.
    patternDir = path.join(patternDir, pattern.patternPartial.split('-')[0]);
    patternName = pattern.patternPartial.split('-').slice(1).join('-');
  }

  if (patternlab.config.patternExportRaw) {
    patternCode = pattern.extendedTemplate;
    patternFileExtension = `.${patternlab.config.patternExtension}`;
  }

  fs.outputFileSync(
    path.join(patternDir, patternName) + patternFileExtension,
    patternCode
  );
}

const pattern_exporter = function () {
  /**
   * Exports all pattern's final HTML as defined in patternlab-config.json to desired location.
   * Originally created to help facilitate easier consumption by jekyll.
   * This method is off spec with PL PHP and will change or be augmented some day.
   *
   * @param patternlab {object} patternlab reference
   */
  function exportPatterns(patternlab) {
    //read the config export options
    const exportPartials = patternlab.config.patternExportPatternPartials;
    const exportAll = patternlab.config.patternExportAll;

    if (exportAll) {
      for (let i = 0; i < patternlab.patterns.length; i++) {
        if (!patternlab.patterns[i].patternPartial.startsWith('-')) {
          exportSinglePattern(patternlab, patternlab.patterns[i]);
        }
      }

      return;
    }

    //find the chosen patterns to export
    for (let i = 0; i < exportPartials.length; i++) {
      for (let j = 0; j < patternlab.patterns.length; j++) {
        if (exportPartials[i] === patternlab.patterns[j].patternPartial) {
          //write matches to the desired location
          exportSinglePattern(patternlab, patternlab.patterns[j]);
        }
      }
    }
  }

  return {
    export_patterns: function (patternlab) {
      exportPatterns(patternlab);
    },
  };
};

module.exports = pattern_exporter;
