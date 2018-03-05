'use strict';
const patternlab = require('@pattern-lab/core');
const _ = require('lodash');

const isValidConfig = require('./validate-config');
const { error, info } = require('./utils');

/**
 * @func serve
 * @desc Start a browser-sync server in the PatternLab public dir
 * @param {object} config - The passed PatternLab config
 */
function serve(config) {
  if (!isValidConfig) {
    throw new TypeError(
      'serve: Expects config not to be empty and of type object.'
    );
  }

  if (
    !_.has(config, 'paths.public.root') ||
    _.isEmpty(config.paths.public.root)
  ) {
    throw new TypeError(
      'serve: config.paths.public.root is empty or does not exist. Please check your PatternLab config.'
    );
  }
  if (
    !_.has(config, 'paths.source.root') ||
    _.isEmpty(config.paths.source.root)
  ) {
    throw new TypeError(
      'serve: config.paths.source.root is empty or does not exist. Please check your PatternLab config.'
    );
  }

  try {
    info(`serve: Serving your files …`);
    const pl = patternlab(config);
    pl.serve({});
  } catch (err) {
    error(err);
  }
}

module.exports = serve;
