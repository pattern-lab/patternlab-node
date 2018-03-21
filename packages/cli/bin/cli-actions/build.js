'use strict';
const buildPatterns = require('../build');
const copyFiles = require('../copy-source-files');
const resolveConfig = require('../resolve-config');
const { error, info, wrapAsync } = require('../utils');

const build = options =>
	wrapAsync(function*() {
		try {
			const config = yield resolveConfig(options.parent.config);
			yield copyFiles(config.paths);
			yield buildPatterns(config, options);
			info(`build: Yay, your PatternLab project was successfully built ☺`);
		} catch (err) {
			error(err);
		}
	});

module.exports = build;
