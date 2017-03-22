"use strict";

var plugin_manager = function (config, configPath) {
  var path = require('path'),
    fs = require('fs-extra'),
    util = require('./utilities');

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
      var pluginPath = path.resolve(
        path.join(process.cwd(), 'node_modules', pluginName)
      );
      console.log('Attempting to load plugin from', pluginPath);
      try {
        var pluginDirStats = fs.statSync(pluginPath);
      } catch (ex) {
        util.error(pluginName + ' not found, please use npm to install it first.');
        util.error(pluginName + ' not loaded.');
        return;
      }
      var pluginPathDirExists = pluginDirStats.isDirectory();
      if (pluginPathDirExists) {

        var diskConfig = fs.readJSONSync(path.resolve(configPath), 'utf8');

        //add the plugin entry to patternlab-config.json
        if (!diskConfig.plugins) {
          diskConfig.plugins = {};
        }

        if (!diskConfig.plugins[pluginName]) {
          diskConfig.plugins[pluginName] = {
            enabled: true,
            initialized: false
          };
        }

        const pluginPathConfig = path.resolve(pluginPath, 'config.json');
        try {
          var pluginConfigJSON = require(pluginPathConfig);
          if (!diskConfig.plugins[pluginName].options) {
            diskConfig.plugins[pluginName].options = pluginConfigJSON;
          }
        } catch (ex) {
          //a config.json file is not required at this time
        }

        //write config entry back
        fs.outputFileSync(path.resolve(configPath), JSON.stringify(diskConfig, null, 2));

        util.debug('Plugin ' + pluginName + ' installed.');

        //todo, tell them how to uninstall or disable

      }
    } catch (ex) {
      console.log(ex);
    }
  }

  /**
   * Detect installed plugins
   *
   * @return {array} list of installed plugins
   */
  function detectPlugins() {
    var node_modules_path = path.join(process.cwd(), 'node_modules');
    return fs.readdirSync(node_modules_path).filter(function (dir) {
      var module_path = path.join(process.cwd(), 'node_modules', dir);
      return fs.statSync(module_path).isDirectory() && dir.indexOf('plugin-node-') === 0;
    });
  }

  /**
   * Disables an installed plugin
   * Not implemented yet
   */
  function disablePlugin(pluginName) {
    console.log('disablePlugin not implemented yet. No change made to state of plugin', pluginName);
  }

  /**
   * Enables an installed plugin
   * Not implemented yet
   */
  function enablePlugin(pluginName) {
    console.log('enablePlugin not implemented yet. No change made to state of plugin', pluginName);
  }

  return {
    install_plugin: function (pluginName) {
      installPlugin(pluginName);
    },
    load_plugin: function (pluginName) {
      return loadPlugin(pluginName);
    },
    detect_plugins: function () {
      return detectPlugins();
    },
    disable_plugin: function (pluginName) {
      disablePlugin(pluginName);
    },
    enable_plugin: function (pluginName) {
      enablePlugin(pluginName);
    }
  };

};

module.exports = plugin_manager;
