'use strict';
const pl = require('@pattern-lab/core');
const { debug } = require('./utils');
const isValidConfig = require('./validate-config');

/**
 * @func build
 * @desc Init patternLab core and build the Pattern Lab files.
 * @param {object} config - The passed Pattern Lab config.
 * @param {object} options - Additional opts to specify build mode.
 */
function build(config, options) {
  if (!isValidConfig) {
    throw new TypeError(
      'build: Expects config not to be empty and of type object.'
    );
  }

  // Initiate Pattern Lab core with the config
  const patternLab = pl(config);

  if (options && options.watch) {
    config.watch = options.watch;
  }

  /**
   * Check whether a flag was passed for build
   * 1. Build only patterns
   * 2. Normal build
   */
  if (options && options.patternsOnly) {
    // 1
    debug(`build: Building only patterns now into ${config.paths.public.root}`);
    return patternLab.patternsonly(config.cleanPublic);
  } else {
    // 2
    debug(`build: Building your project now into ${config.paths.public.root}`);
    return patternLab.build(config);
  }
}

module.exports = build;
