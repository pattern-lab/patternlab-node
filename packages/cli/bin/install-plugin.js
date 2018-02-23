'use strict';
const checkAndInstallPackage = require('./utils').checkAndInstallPackage;
const wrapAsync = require('./utils').wrapAsync;

const installPlugin = (plugin, config) => wrapAsync(function*() {
	const name = plugin.name || plugin;
	const url = `pattern-lab/${name}`;
	yield checkAndInstallPackage(name, url);
	// Put the installed plugin in the patternlab-config.json
	config[name] = false;
	return name;
});

module.exports = installPlugin;

