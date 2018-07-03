'use strict';

const path = require('path');

const _ = require('lodash');

const checkAndInstallPackage = require('./utils').checkAndInstallPackage;
const wrapAsync = require('./utils').wrapAsync;

const installPlugin = (plugin, config) =>
  wrapAsync(function*() {
    const name = plugin.name || plugin;
    const safePluginName = _.kebabCase(name);
    yield checkAndInstallPackage(safePluginName);
    // Put the installed plugin in the patternlab-config.json
    _.set(config, `plugins[${safePluginName}]['enabled']`, true);

    // Get the options from the plugin, if any
    const pluginPathConfig = path.resolve(
      path.join(process.cwd(), 'node_modules', safePluginName, 'config.json')
    );
    try {
      const pluginConfigJSON = require(pluginPathConfig);
      if (!_.has(config.plugins[safePluginName].options)) {
        _.set(config, `plugins[${safePluginName}]['options]`, pluginConfigJSON);
      }
    } catch (ex) {
      //a config.json file is not required at this time
    }
    return safePluginName;
  });

module.exports = installPlugin;
