'use strict';

const plugin_manager = function(config, configPath) {
  const path = require('path');
  const fs = require('fs-extra');

  const _ = require('lodash');

  const logger = require('./log');

  const pluginMatcher = /^plugin-(.*)$/;

  /**
   * Loads a plugin
   *
   * @param modulePath {string} the path to the plugin
   * @return {object} the loaded plugin
   */
  function loadPlugin(modulePath) {
    return require(modulePath);
  }

  /**
   * Installs a plugin
   *
   * @param pluginName {string} the name of the plugin
   */
  function installPlugin(pluginName) {
    console.log('install plugin');
    try {
      const pluginPath = path.resolve(
        path.join(process.cwd(), 'node_modules', pluginName)
      );
      logger.debug(`Attempting to load plugin from ${pluginPath}`);
      let pluginDirStats;
      try {
        pluginDirStats = fs.statSync(pluginPath);
      } catch (ex) {
        logger.warning(`${pluginName} not found, use npm to install it first.`);
        logger.warning(`${pluginName} not loaded.`);
        return;
      }
      const pluginPathDirExists = pluginDirStats.isDirectory();
      if (pluginPathDirExists) {
        const diskConfig = fs.readJSONSync(path.resolve(configPath), 'utf8');

        //add the plugin entry to patternlab-config.json
        if (!diskConfig.plugins) {
          diskConfig.plugins = {};
        }

        const safePluginName = _.kebabCase(pluginName);

        if (!diskConfig.plugins[safePluginName]) {
          diskConfig.plugins[safePluginName] = {
            enabled: true,
            initialized: false,
          };
        }

        const pluginPathConfig = path.resolve(pluginPath, 'config.json');
        try {
          const pluginConfigJSON = require(pluginPathConfig);
          if (!diskConfig.plugins[safePluginName].options) {
            diskConfig.plugins[safePluginName].options = pluginConfigJSON;
          }
        } catch (ex) {
          //a config.json file is not required at this time
        }

        //write config entry back
        fs.outputFileSync(
          path.resolve(configPath),
          JSON.stringify(diskConfig, null, 2)
        );

        logger.info('Plugin ' + safePluginName + ' installed.');
        logger.info('Plugin configration added to patternlab-config.json.');
      }
    } catch (ex) {
      logger.warning(
        `An error occurred during plugin installation for plugin ${pluginName}`
      );
      logger.warning(ex);
    }
  }

  /**
   * Disables an installed plugin
   * Not implemented yet
   */
  function disablePlugin(pluginName) {
    logger.warning(
      `disablePlugin() not implemented yet. No change made to state of plugin ${pluginName}`
    );
  }

  /**
   * Enables an installed plugin
   * Not implemented yet
   */
  function enablePlugin(pluginName) {
    logger.warning(
      `enablePlugin() not implemented yet. No change made to state of plugin ${pluginName}`
    );
  }

  /**
   * Given a path: return the plugin name if the path points to a valid plugin
   * module directory, or false if it doesn't.
   * @param filePath
   * @returns Plugin name if exists or FALSE
   */
  function isPlugin(filePath) {
    const baseName = path.basename(filePath);
    const pluginMatch = baseName.match(pluginMatcher);

    if (pluginMatch) {
      return pluginMatch[1];
    }
    return false;
  }

  return {
    install_plugin: function(pluginName) {
      installPlugin(pluginName);
    },
    load_plugin: function(modulePath) {
      return loadPlugin(modulePath);
    },
    disable_plugin: function(pluginName) {
      disablePlugin(pluginName);
    },
    enable_plugin: function(pluginName) {
      enablePlugin(pluginName);
    },
    is_plugin: function(filePath) {
      return isPlugin(filePath);
    },
  };
};

module.exports = plugin_manager;
