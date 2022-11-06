'use strict';
const fs = require('fs-extra');
const path = require('path');
const error = require('./utils').error;
const readJsonAsync = require('./utils').readJsonAsync;
const wrapAsync = require('./utils').wrapAsync;

/**
 * @func resolveConfig
 * @desc Resolves the given Pattern Lab config file.
 * @param {string} [configPath=./patternlab-config.json] - Path to the patternlab-config.json. Defaults to project dir.
 * @return {object|boolean} Returns the config object or false otherwise.
 */
function resolveConfig(configPath) {
  return wrapAsync(function* () {
    if (typeof configPath !== 'string') {
      error(
        'resolveConfig: If configPath is set, it is expected to be of type string.'
      );
      return false;
    }
    if (!fs.existsSync(configPath)) {
      error(`resolveConfig: configPath ${configPath} does not exists`);
      return false;
    }

    /**
     * Setup the config.
     * 1. Check if user specified custom Pattern Lab config location
     * 2. Read the config file
     */
    try {
      const absoluteConfigPath = path.resolve(configPath); // 1
      return yield readJsonAsync(absoluteConfigPath); // 2
    } catch (err) {
      error(
        'resolveConfig: Got an error during parsing your Pattern Lab config. Please make sure your config file exists.'
      );
      error(err);
      return false;
    }
  });
}

module.exports = resolveConfig;
