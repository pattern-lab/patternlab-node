'use strict';

const path = require('path');
const _ = require('lodash');

const logger = require('./log');

let findModules = require('./findModules'); //eslint-disable-line prefer-const
let fs = require('fs-extra'); // eslint-disable-line

const uiKitMatcher = /^uikit-(.*)$/;
const nodeModulesPath = path.join(process.cwd(), 'node_modules');

/**
 * Given a path: return the uikit name if the path points to a valid uikit
 * module directory, or false if it doesn't.
 * @param filePath
 * @returns UIKit name if exists or FALSE
 */
const isUIKitModule = filePath => {
  const baseName = path.basename(filePath);
  const engineMatch = baseName.match(uiKitMatcher);

  if (engineMatch) {
    return engineMatch[1];
  }
  return false;
};

const readModuleFile = (kit, subPath) => {
  return fs.readFileSync(
    path.resolve(path.join(kit.modulePath, subPath)),
    'utf8'
  );
};

module.exports = patternlab => {
  const paths = patternlab.config.paths;

  // load all ui kits mentioned in the config, if they are enabled
  const uikits = findModules(nodeModulesPath, isUIKitModule);

  // add them to the patternlab object for later iteration
  uikits.forEach(kit => {
    const configEntry = _.find(patternlab.config.uikits, {
      name: `uikit-${kit.name}`,
    });

    if (!configEntry) {
      logger.error(
        `Could not find uikit with name uikit-${
          kit.name
        } defined within patternlab-config.json`
      );
    }

    try {
      // load up all the necessary files from pattern lab that apply to every template
      patternlab.uikits[`uikit-${kit.name}`] = {
        modulePath: kit.modulePath,
        enabled: configEntry.enabled,
        outputDir: configEntry.outputDir,
        excludedPatternStates: configEntry.excludedPatternStates,
        excludedTags: configEntry.excludedTags,
        header: readModuleFile(
          kit,
          paths.source.patternlabFiles['general-header']
        ),
        footer: readModuleFile(
          kit,
          paths.source.patternlabFiles['general-footer']
        ),
        patternSection: readModuleFile(
          kit,
          paths.source.patternlabFiles.patternSection
        ),
        patternSectionSubType: readModuleFile(
          kit,
          paths.source.patternlabFiles.patternSectionSubtype
        ),
        viewAll: readModuleFile(kit, paths.source.patternlabFiles.viewall),
      };
    } catch (ex) {
      logger.error(ex);
      logger.error(
        '\nERROR: missing an essential file from ' +
          paths.source.patternlabFiles +
          ". Pattern Lab won't work without this file.\n"
      );
    }
  });
  return Promise.resolve();
};
