'use strict';
const resolveConfig = require('../resolve-config');
const servePatterns = require('../serve');
const wrapAsync = require('../utils').wrapAsync;

const serve = (options) =>
  wrapAsync(function* () {
    const config = yield resolveConfig(options.config);
    servePatterns(config, options);
  });

module.exports = serve;
