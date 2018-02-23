'use strict';
const path = require('path');
const hasYarn = require('has-yarn');
const checkAndInstallPackage = require('./utils').checkAndInstallPackage;
const copyAsync = require('./utils').copyAsync;
const wrapAsync = require('./utils').wrapAsync;

const installEdition = (edition, config) => wrapAsync(function*() {
	/**
	 * 1. Trigger edition install
	 * 2. Copy over the mandatory edition files to sourceDir
	 * 3. Check whether we need to deal with peerDeps for npm < v3 Can be deprecated once we drop Node v4
	 * 4. Adjust config paths
	 */
	const sourceDir = config.paths.source.root;
	yield checkAndInstallPackage(edition); // 1
	yield copyAsync(path.resolve('./node_modules', edition, 'source', '_meta'), path.resolve(sourceDir, '_meta')); // 2
	const editionPath = (+process.version.match(/^v(\d*)\.\d*\.\d*$/)[1] <= 4 && !hasYarn()) ? path.join('node_modules', edition, 'node_modules') : 'node_modules'; // 3
	config.paths.source.styleguide = config.paths.source.styleguide.replace(/node_modules/, editionPath); // 4
	config.paths.source.patternlabFiles = config.paths.source.patternlabFiles.replace(/node_modules/, editionPath); // 5
	return config;
});

module.exports = installEdition;
