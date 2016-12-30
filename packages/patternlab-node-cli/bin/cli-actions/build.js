'use strict';
const buildPatterns = require('../build');
const copyFiles = require('../copy-source-files');
const resolveConfig = require('../resolve-config');
const wrapAsync = require('../utils').wrapAsync;

const build = options => wrapAsync(function*() {
	const config = yield resolveConfig(options.parent.config);
	yield copyFiles(config.paths);
	buildPatterns(config, options);
});

module.exports = build;
