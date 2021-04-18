'use strict';

const plugin_manager = function () {
  const logger = require('./log');

  /**
   * Looks for installed plugins, loads them, and invokes them
   * @param {object} patternlab
   */
  function initializePlugins(patternlab) {
    const foundPlugins = Object.keys(patternlab.config.plugins || {});
    foundPlugins.forEach((plugin) => {
      logger.info(`Found plugin: ${plugin}`);
      logger.info(`Attempting to load and initialize plugin.`);
      const pluginModule = require(plugin);
      pluginModule(patternlab);
    });
  }

  async function raiseEvent(patternlab, eventName, args) {
    patternlab.events.emit(eventName, args);
    await (async function () {
      const hookHandlers = (patternlab.hooks[eventName] || []).map((h) =>
        h(args)
      );

      await Promise.all(hookHandlers);
    })();
  }

  return {
    intialize_plugins: (patternlab) => {
      initializePlugins(patternlab);
    },
    raiseEvent: async (patternlab, eventName, ...args) => {
      await raiseEvent(patternlab, eventName, args);
    },
  };
};

module.exports = plugin_manager;
