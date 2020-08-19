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

/**
 * Loads uikits, connecting configuration and installed modules
 * [1] Looks in node_modules for uikits.
 * [2] Filter out our uikit-polyfills package.
 * [3] Only continue if uikit is enabled in patternlab-config.json
 * [4] Reads files from uikit that apply to every template
 * @param {object} patternlab
 */
module.exports = patternlab => {
  const paths = patternlab.config.paths;

  const uikits = findModules(nodeModulesPath, isUIKitModule) // [1]
    .filter(kit => kit.name !== 'polyfills'); // [2]
  uikits.forEach(kit => {
    const configEntry = _.find(_.filter(patternlab.config.uikits, 'enabled'), {
      name: `uikit-${kit.name}`,
    }); // [3]

    if (!configEntry) {
      logger.warning(
        `Could not find uikit with name uikit-${kit.name} defined within patternlab-config.json, or it is not enabled.`
      );
      return;
    }

    try {
      patternlab.uikits[`uikit-${kit.name}`] = {
        name: `uikit-${kit.name}`,
        modulePath: kit.modulePath,
        enabled: true,
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
        patternSectionSubgroup: readModuleFile(
          kit,
          paths.source.patternlabFiles.patternSectionSubgroup
        ),
        viewAll: readModuleFile(kit, paths.source.patternlabFiles.viewall),
      }; // [4]
    } catch (ex) {
      logger.error(ex);
      logger.error(
        '\nERROR: missing an essential file from ' +
          kit.modulePath +
          paths.source.patternlabFiles +
          ". Pattern Lab won't work without this file.\n"
      );
    }
  });
  return Promise.resolve();
};
