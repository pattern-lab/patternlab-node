'use strict';

const plugin_manager = function() {
  const path = require('path');
  const findModules = require('./findModules');
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

  /**
   * Looks for installed plugins, loads them, and invokes them
   * @param {object} patternlab
   */
  function initializePlugins(patternlab) {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const foundPlugins = findModules(nodeModulesPath, isPlugin);
    foundPlugins.forEach(plugin => {
      logger.info(`Found plugin: plugin-${plugin.name}`);
      logger.info(`Attempting to load and initialize plugin.`);
      const pluginModule = loadPlugin(plugin.modulePath);
      pluginModule(patternlab);
    });
  }

  async function raiseEvent(patternlab, eventName, ...args) {
    patternlab.events.emit(eventName, args);

    await (async function() {
      const hookHandlers = patternlab.hooks[eventName].map(h => h(args));

      const results = await Promise.all(hookHandlers);
    })();
  }

  return {
    intialize_plugins: patternlab => {
      initializePlugins(patternlab);
    },
    load_plugin: modulePath => {
      return loadPlugin(modulePath);
    },
    is_plugin: filePath => {
      return isPlugin(filePath);
    },
    raiseEvent: async (patternlab, eventName, ...args) => {
      await raiseEvent(patternlab, eventName, args);
    },
  };
};

module.exports = plugin_manager;
