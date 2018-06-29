'use strict';
const _ = require('lodash');
const checkAndInstallPackage = require('./utils').checkAndInstallPackage;
const wrapAsync = require('./utils').wrapAsync;

const installPlugin = (plugin, config) =>
  wrapAsync(function*() {
    const name = plugin.name || plugin;
    yield checkAndInstallPackage(name);
    // Put the installed plugin in the patternlab-config.json
    _.set(config, `plugins[${name}]['enabled']`, false);
    return name;
  });

module.exports = installPlugin;
