"use strict";

var plugin_manager = function (config, configPath) {
  var path = require('path'),
    fs = require('fs-extra'),
    util = require('./utilities');

  function loadPlugin(pluginName) {
    return require(path.join(process.cwd(), 'node_modules', pluginName));
  }

  function installPlugin(pluginName) {
    try {
      var pluginPath = path.resolve(
        path.join(process.cwd(), 'node_modules', pluginName)
      );
      console.log('Attempting to load plugin from', pluginPath);
      try {
        var pluginDirStats = fs.statSync(pluginPath);
      } catch (ex) {
        util.logRed(pluginName + ' not found, please use npm to install it first.');
        util.logRed(pluginName + ' not loaded.');
        return;
      }
      var pluginPathDirExists = pluginDirStats.isDirectory();
      if (pluginPathDirExists) {

        //write config entry back
        var diskConfig = fs.readJSONSync(path.resolve(configPath), 'utf8');
        diskConfig[pluginName] = true;
        fs.outputFileSync(path.resolve(configPath), JSON.stringify(diskConfig, null, 2));
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  function detectPlugins() {
    var node_modules_path = path.join(process.cwd(), 'node_modules');
    return fs.readdirSync(node_modules_path).filter(function (dir) {
      var module_path = path.join(process.cwd(), 'node_modules', dir);
      return fs.statSync(module_path).isDirectory() && dir.indexOf('plugin-node-') === 0;
    });
  }

  function disablePlugin(pluginName) {
    console.log('not implemented yet');
  }

  function enablePlugin(pluginName) {
    console.log('not implemented yet');
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
