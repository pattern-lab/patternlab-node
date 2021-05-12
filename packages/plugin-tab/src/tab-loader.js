'use strict';

const path = require('path');

const _ = require('lodash');
const fs = require('fs-extra');

/**
 * The backend method that is called during the patternlab-pattern-write-end event.
 * Responsible for looking for a companion filetype file alongside a pattern file and outputting it if found.
 * @param patternlab - the global data store
 * @param pattern - the pattern object being iterated over
 */
async function findTab(patternlab, pattern) {
  //read the filetypes from the configuration
  const fileTypes =
    patternlab.config.plugins['@pattern-lab/plugin-tab'].options.tabsToAdd;

  //exit if either of these two parameters are missing
  if (!patternlab) {
    console.error('plugin-tab: patternlab object not provided to findTab');
    process.exit(1);
  }

  if (!pattern) {
    console.error('plugin-tab: pattern object not provided to findTab');
    process.exit(1);
  }

  //derive the custom filetype paths from the pattern relPath
  let customFileTypePath = path.join(
    patternlab.config.paths.source.patterns,
    pattern.relPath
  );

  //loop through all configured types
  for (let i = 0; i < fileTypes.length; i++) {
    const fileType = fileTypes[i].toLowerCase();

    customFileTypePath =
      customFileTypePath.substr(0, customFileTypePath.lastIndexOf('.')) +
      '.' +
      fileType;
    const customFileTypeOutputPath =
      patternlab.config.paths.public.patterns +
      pattern.getPatternLink(patternlab, 'custom', '.' + fileType);

    //look for a custom filetype for this template
    let tabFileName;
    let tabFileNameStats;
    try {
      tabFileName = path.resolve(customFileTypePath);
      try {
        tabFileNameStats = fs.statSync(tabFileName);
      } catch (err) {
        //not a file - move on quietly
      }
      if (tabFileNameStats && tabFileNameStats.isFile()) {
        if (patternlab.config.debug) {
          console.log(
            'plugin-tab: copied pattern-specific custom file for ' +
              pattern.patternPartial
          );
        }

        //copy the file to our output target if found
        _.each(patternlab.uikits, (uikit) => {
          fs.copySync(
            tabFileName,
            path.join(process.cwd(), uikit.outputDir, customFileTypeOutputPath)
          );
        });
      } else {
        //otherwise write nothing to the same location - this prevents GET errors on the tab.
        _.each(patternlab.uikits, (uikit) => {
          fs.outputFileSync(
            path.join(process.cwd(), uikit.outputDir, customFileTypeOutputPath),
            ''
          );
        });
      }
    } catch (err) {
      console.log(
        'plugin-tab: There was an error parsing sibling JSON for ' +
          pattern.relPath
      );
      console.log(err);
    }
  }
}

module.exports = findTab;
