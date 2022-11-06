'use strict';

const _ = require('lodash');

const { checkAndInstallPackage, wrapAsync } = require('./utils');
const { resolveFileInPackage } = require('@pattern-lab/core/src/lib/resolver');

const installPlugin = (plugin, config) =>
  wrapAsync(function* () {
    const name = plugin.name || plugin;
    yield checkAndInstallPackage(name);
    // Put the installed plugin in the patternlab-config.json
    _.set(config, `plugins[${name}]['enabled']`, true);
    _.set(config, `plugins[${name}]['initialized']`, false);

    // Get the options from the plugin, if any
    const pluginPathConfig = resolveFileInPackage(name, 'config.json');
    try {
      const pluginConfigJSON = require(pluginPathConfig);
      if (!_.has(config.plugins[name].options)) {
        _.set(config, `plugins[${name}][options]`, pluginConfigJSON);
      }
    } catch (ex) {
      //a config.json file is not required at this time
    }
    return name;
  });

module.exports = installPlugin;
