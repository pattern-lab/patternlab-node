'use strict';
const resolveConfig = require('../resolve-config');
const build = require('./build');
const servePatterns = require('../serve');
const wrapAsync = require('../utils').wrapAsync;

const serve = options =>
  wrapAsync(function*() {
    const config = yield resolveConfig(options.parent.config);
    yield build(options);
    servePatterns(config, options.watch);
  });

module.exports = serve;
