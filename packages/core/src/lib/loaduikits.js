'use strict';

const path = require('path');
const _ = require('lodash');

const logger = require('./log');

const { resolvePackageFolder } = require('./resolver');

let fs = require('fs-extra'); // eslint-disable-line

const readModuleFile = (uikitLocation, subPath) => {
  return fs.readFileSync(
    path.resolve(path.join(uikitLocation, subPath)),
    'utf8'
  );
};

/**
 * Loads uikits, connecting configuration and installed modules
 * [1] Lists the enabled uikits from patternlab-config.json
 * [2] Try to resolve the location of the uikit in the package dependencies
 * [3] Warn when the uikit couldn't be loaded
 * [4] Reads files from uikit that apply to every template
 * @param {object} patternlab
 */
module.exports = patternlab => {
  const paths = patternlab.config.paths;

  const uikitConfigs = _.filter(patternlab.config.uikits, 'enabled'); // [1]
  uikitConfigs.forEach(uikitConfig => {
    let uikitLocation = null;
    try {
      resolvePackageFolder(uikitConfig.name); // [2]
    } catch (ex) {
      // Ignore
    }
    if (!uikitLocation) {
      try {
        uikitLocation = resolvePackageFolder(
          `@pattern-lab/${uikitConfig.name}`
        );
      } catch (ex) {
        // Ignore
      }
    }
    if (!uikitLocation) {
      try {
        uikitLocation = resolvePackageFolder(
          `@pattern-lab/uikit-${uikitConfig.name}`
        );
      } catch (ex) {
        // Ignore
      }
    }

    if (!uikitLocation) {
      logger.warning(
        `Could not find uikit with package name ${uikitConfig.name}, @pattern-lab/${uikitConfig.name} or @pattern-lab/uikit-${uikitConfig.name} defined within patternlab-config.json in the package dependencies.`
      );
      return;
    } // [3]

    try {
      patternlab.uikits[uikitConfig.name] = {
        name: uikitConfig.name,
        modulePath: uikitLocation,
        enabled: true,
        outputDir: uikitConfig.outputDir,
        excludedPatternStates: uikitConfig.excludedPatternStates,
        excludedTags: uikitConfig.excludedTags,
        header: readModuleFile(
          uikitLocation,
          paths.source.patternlabFiles['general-header']
        ),
        footer: readModuleFile(
          uikitLocation,
          paths.source.patternlabFiles['general-footer']
        ),
        patternSection: readModuleFile(
          uikitLocation,
          paths.source.patternlabFiles.patternSection
        ),
        patternSectionSubType: readModuleFile(
          uikitLocation,
          paths.source.patternlabFiles.patternSectionSubtype
        ),
        viewAll: readModuleFile(
          uikitLocation,
          paths.source.patternlabFiles.viewall
        ),
      }; // [4]
    } catch (ex) {
      logger.error(ex);
      logger.error(
        '\nERROR: missing an essential file from ' +
          uikitLocation +
          paths.source.patternlabFiles +
          ". Pattern Lab won't work without this file.\n"
      );
    }
  });
  return Promise.resolve();
};
