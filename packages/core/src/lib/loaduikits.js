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
 * [2] Map them to enabled uikit's in patternlab-config.json
 * [3] Reads files from uikit that apply to every template
 * @param {object} patternlab
 */
module.exports = patternlab => {
  const paths = patternlab.config.paths;

  const uikitModules = findModules(nodeModulesPath, isUIKitModule); // [1]

  _.filter(patternlab.config.uikits, 'enabled').forEach(uikit => {
    const kit = _.find(uikitModules, {
      name: uikit.name.replace('uikit-', ''),
    }); // [2]

    if (!kit) {
      logger.warning(
        `Could not find uikit plugin with name uikit-${kit.name} defined within patternlab-config.json.`
      );
      return;
    }

    if (!uikit.id) {
      logger.warning(
        `ID for ${uikit.name} is missing, ${uikit.name} will be used instead. Caution, this can cause uikit's using the same package to malfunction.`
      );
      uikit.id = uikit.name;
    }

    try {
      patternlab.uikits[uikit.id] = {
        name: uikit.name,
        modulePath: kit.modulePath,
        enabled: true,
        outputDir: uikit.outputDir,
        excludedPatternStates: uikit.excludedPatternStates,
        excludedTags: uikit.excludedTags,
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
      }; // [3]
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
