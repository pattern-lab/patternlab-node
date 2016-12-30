'use strict';
const path = require('path');
const checkAndInstallPackage = require('./utils').checkAndInstallPackage;
const copyAsync = require('./utils').copyAsync;
const wrapAsync = require('./utils').wrapAsync;

const installStarterkit = (starterkit, config) => wrapAsync(function*() {
	const sourceDir = config.paths.source.root;
	const name = starterkit.name || starterkit;
	const url = `pattern-lab/${name}`;
	yield checkAndInstallPackage(name, url);
	yield copyAsync(path.resolve('./node_modules', name, 'dist'), path.resolve(sourceDir));
});

module.exports = installStarterkit;
