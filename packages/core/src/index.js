/*
 * patternlab-node https://github.com/pattern-lab/patternlab-node
 *
 * Brian Muenzenmeyer, Geoff Pursell, Raphael Okon, tburny and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

'use strict';

const packageInfo = require('../package.json');

const updateNotifier = require('update-notifier');

const buildPatterns = require('./lib/buildPatterns');
const help = require('./lib/help');
const events = require('./lib/events');
const loaduikits = require('./lib/loaduikits');
const logger = require('./lib/log');
const PatternGraph = require('./lib/pattern_graph').PatternGraph;
const pe = require('./lib/pattern_exporter');

const defaultConfig = require('../patternlab-config.json');

let fs = require('fs-extra'); // eslint-disable-line
let ui_builder = require('./lib/ui_builder'); // eslint-disable-line
let copier = require('./lib/copier'); // eslint-disable-line
let pattern_exporter = new pe(); // eslint-disable-line
let serve = require('./lib/serve'); // eslint-disable-line

//bootstrap update notifier
updateNotifier({
  pkg: packageInfo,
  updateCheckInterval: 1000 * 60 * 60 * 24, // notify at most once a day
}).notify();

/**
 * Returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.
 *
 * @return {object} Returns the object representation of the `patternlab-config.json`
 */
const getDefaultConfig = function() {
  return defaultConfig;
};

const patternlab_module = function(config) {
  const PatternLab = require('./lib/patternlab');
  const patternlab = new PatternLab(config);

  return {
    /**
     * Logs current version to standard output
     *
     * @returns {void} current patternlab-node version as defined in `package.json`
     */
    version: function() {
      return patternlab.logVersion();
    },

    /**
     * Returns current version
     *
     * @returns {string} current patternlab-node version as defined in `package.json`, as string
     */
    v: function() {
      return patternlab.getVersion();
    },

    /**
     * Builds patterns, copies assets, and constructs user interface
     *
     * @param {object} options an object used to control build behavior
     * @param {bool} options.cleanPublic whether or not to delete the configured output location (usually `public/`) before build
     * @param {object} options.data additional data to be merged with global data prior to build
     * @param {bool} options.watch whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild
     * @returns {Promise} a promise fulfilled when build is complete
     */
    build: function(options) {
      // process.on('unhandledRejection', (reason, p) => {
      //   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
      //   // application specific logging, throwing an error, or other logic here

      //   console.log(reason.stack);
      //   debugger;
      // });

      if (patternlab && patternlab.isBusy) {
        logger.info(
          'Pattern Lab is busy building a previous run - returning early.'
        );
        return Promise.resolve();
      }
      patternlab.isBusy = true;

      return loaduikits(patternlab).then(() => {
        return buildPatterns(
          options.cleanPublic,
          patternlab,
          options.data
        ).then(() => {
          return new ui_builder().buildFrontend(patternlab).then(() => {
            copier()
              .copyAndWatch(patternlab.config.paths, patternlab, options)
              .then(() => {
                if (
                  !this.events.listenerCount(events.PATTERNLAB_PATTERN_CHANGE)
                ) {
                  this.events.once(events.PATTERNLAB_PATTERN_CHANGE, () => {
                    console.log('WIP: rebuilding');
                    if (!patternlab.isBusy) {
                      return this.build(options);
                    }
                    return Promise.resolve();
                  });
                }

                if (
                  !this.events.listenerCount(events.PATTERNLAB_GLOBAL_CHANGE)
                ) {
                  this.events.once(events.PATTERNLAB_GLOBAL_CHANGE, () => {
                    console.log('WIP: rebuilding');
                    if (!patternlab.isBusy) {
                      return this.build(
                        Object.assign({}, options, { cleanPublic: true }) // rebuild everything
                      );
                    }
                    return Promise.resolve();
                  });
                }

                patternlab.isBusy = false;
              });
          });
        });
      });
    },

    /**
     * Returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.
     *
     * @return {object} Returns the object representation of the `patternlab-config.json`
     */
    getDefaultConfig: function() {
      return getDefaultConfig();
    },

    /**
     * Returns all file extensions supported by installed PatternEngines
     *
     * @returns {Array<string>} all supported file extensions
     */
    getSupportedTemplateExtensions: function() {
      return patternlab.getSupportedTemplateExtensions();
    },

    /**
     * Logs usage to standard output
     *
     * @returns {void} pattern lab API usage, as console output
     */
    help: function() {
      logger.info(help(patternlab.package.version));
    },

    /**
     * Installs plugin already available via `node_modules/`
     *
     * @param {string} pluginName name of plugin
     * @returns {void}
     */
    installplugin: function(pluginName) {
      patternlab.installPlugin(pluginName);
    },

    /**
     * Fetches starterkit repositories from pattern-lab github org that contain 'starterkit' in their name
     *
     * @returns {Promise} Returns an Array<{name,url}> for the starterkit repos
     */
    liststarterkits: function() {
      return patternlab.listStarterkits();
    },

    /**
     * Loads starterkit already available via `node_modules/`
     *
     * @param {string} starterkitName name of starterkit
     * @param {boolean} clean whether or not to delete contents of source/ before load
     * @returns {void}
     */
    loadstarterkit: function(starterkitName, clean) {
      patternlab.loadStarterKit(starterkitName, clean);
    },

    /**
     * Builds patterns only, leaving existing user interface files intact
     *
     * @param {object} options an object used to control build behavior
     * @param {bool} options.cleanPublic whether or not to delete the configured output location (usually `public/`) before build
     * @param {object} options.data additional data to be merged with global data prior to build
     * @returns {Promise} a promise fulfilled when build is complete
     */
    patternsonly: function(options) {
      if (patternlab && patternlab.isBusy) {
        logger.info(
          'Pattern Lab is busy building a previous run - returning early.'
        );
        return Promise.resolve();
      }
      patternlab.isBusy = true;
      return loaduikits(patternlab).then(() => {
        return buildPatterns(
          options.cleanPublic,
          patternlab,
          options.data
        ).then(() => {
          patternlab.isBusy = false;
        });
      });
    },

    /**
     * Build patterns, copies assets, and constructs user interface. Watches configured `source/` directories, and serves all output locally
     *
     * @param {object} options an object used to control build behavior
     * @param {bool} options.cleanPublic whether or not to delete the configured output location (usually `public/`) before build
     * @param {object} options.data additional data to be merged with global data prior to build
     * @param {bool} options.watch **ALWAYS OVERRIDDEN to `true`** whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild
     * @returns {Promise} a promise fulfilled when build is complete
     */
    serve: function(options) {
      options.watch = true;
      return this.build(options).then(function() {
        serve(patternlab);
        return Promise.resolve();
      });
    },

    events: patternlab.events,
  };
};

patternlab_module.getDefaultConfig = getDefaultConfig;

module.exports = patternlab_module;
