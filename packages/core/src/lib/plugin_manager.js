'use strict';

const plugin_manager = function(config, configPath) {
  const path = require('path');
  const fs = require('fs-extra');
  const logger = require('./log');

  /**
   * Loads a plugin
   *
   * @param pluginName {string} the name of the plugin
   * @return {object} the loaded plugin
   */
  function loadPlugin(pluginName) {
    return require(path.join(process.cwd(), 'node_modules', pluginName));
  }

  /**
   * Installs a plugin
   *
   * @param pluginName {string} the name of the plugin
   */
  function installPlugin(pluginName) {
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

        if (!diskConfig.plugins[pluginName]) {
          diskConfig.plugins[pluginName] = {
            enabled: true,
            initialized: false,
          };
        }

        const pluginPathConfig = path.resolve(pluginPath, 'config.json');
        try {
          const pluginConfigJSON = require(pluginPathConfig);
          if (!diskConfig.plugins[pluginName].options) {
            diskConfig.plugins[pluginName].options = pluginConfigJSON;
          }
        } catch (ex) {
          //a config.json file is not required at this time
        }

        //write config entry back
        fs.outputFileSync(
          path.resolve(configPath),
          JSON.stringify(diskConfig, null, 2)
        );

        logger.info('Plugin ' + pluginName + ' installed.');
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

  return {
    install_plugin: function(pluginName) {
      installPlugin(pluginName);
    },
    load_plugin: function(pluginName) {
      return loadPlugin(pluginName);
    },
    disable_plugin: function(pluginName) {
      disablePlugin(pluginName);
    },
    enable_plugin: function(pluginName) {
      enablePlugin(pluginName);
    },
  };
};

module.exports = plugin_manager;
