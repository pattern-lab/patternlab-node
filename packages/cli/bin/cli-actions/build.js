'use strict';
const buildPatterns = require('../build');
const resolveConfig = require('../resolve-config');
const { error, info, wrapAsync } = require('../utils');

const build = (options) =>
  wrapAsync(function* () {
    try {
      const config = yield resolveConfig(options.config);
      yield buildPatterns(config, options);
      info(`build: Yay, your Pattern Lab project was successfully built ☺`);
    } catch (err) {
      error(err);
    }
  });

module.exports = build;
