'use strict';
const archive = require('../archive');
const resolveConfig = require('../resolve-config');
const wrapAsync = require('../utils').wrapAsync;

const _export = (options) =>
  wrapAsync(function* () {
    const config = yield resolveConfig(options.config);
    archive(config);
  });

module.exports = _export;
