/**
 * Build thoughtful, pattern-driven user interfaces using atomic design principles.
 * Many of these functions are exposed to users within {@link https://github.com/pattern-lab/patternlab-node#editions|Editions}, but {@link https://github.com/pattern-lab/patternlab-node#direct-consumption|direct consumption} is also encouraged.
 *
 * @namespace patternlab
 * @see {@link patternlab.io} for more documentation.
 * @see {@link https://github.com/pattern-lab/patternlab-node} for code, issues, and releases
 * @license MIT
 */

'use strict';

const updateNotifier = require('update-notifier');

const packageInfo = require('../package.json');
const events = require('./lib/events');
const pe = require('./lib/pattern_exporter');

const defaultConfig = require('../patternlab-config.json');

let buildPatterns = require('./lib/buildPatterns'); // eslint-disable-line
let logger = require('./lib/log'); // eslint-disable-line
let fs = require('fs-extra'); // eslint-disable-line
let ui_builder = require('./lib/ui_builder'); // eslint-disable-line
let copier = require('./lib/copier'); // eslint-disable-line
let pattern_exporter = new pe(); // eslint-disable-line
let serverModule = require('./lib/server'); // eslint-disable-line

//bootstrap update notifier
updateNotifier({
  pkg: packageInfo,
  updateCheckInterval: 1000 * 60 * 60 * 24, // notify at most once a day
}).notify();

/**
 * Static method that returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.
 *
 * @memberof patternlab
 * @name getDefaultConfig
 * @static
 * @return {object} Returns the object representation of the `patternlab-config.json`
 */
const getDefaultConfig = function () {
  return defaultConfig;
};

/**
 * Static method that returns current version
 *
 * @memberof patternlab
 * @name getVersion
 * @static
 * @returns {string} current @pattern-lab/core version as defined in `package.json`
 */
const getVersion = function () {
  return packageInfo.version;
};

const patternlab_module = function (config) {
  const PatternLabClass = require('./lib/patternlab');
  const patternlab = new PatternLabClass(config);
  const server = serverModule(patternlab);

  const _api = {
    /**
     * Returns current version
     *
     * @memberof patternlab
     * @name version
     * @instance
     * @returns {string} current patternlab-node version as defined in `package.json`, as string
     */
    version: function () {
      return patternlab.getVersion();
    },

    /**
     * Returns the current pattern lab configuration being used
     *
     * @memberof patternlab
     * @name getConfig
     * @instance
     * @returns {object} the current patternlab-node config (defaults + customizations)
     */
    getConfig() {
      return config;
    },

    /**
     * Returns if Pattern Lab is busy compiling or not
     *
     * @memberof patternlab
     * @name isBusy
     * @instance
     * @returns {boolean} if pattern lab is currently busy compiling
     */
    isBusy: function () {
      return patternlab.isBusy;
    },

    /**
     * Builds patterns, copies assets, and constructs user interface
     *
     * @memberof patternlab
     * @name build
     * @instance
     * @param {object} options an object used to control build behavior
     * @param {bool} [options.cleanPublic=true] whether or not to delete the configured output location (usually `public/`) before build
     * @param {object} [options.data={}] additional data to be merged with global data prior to build
     * @param {bool} [options.watch=true] whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild
     * @emits PATTERNLAB_BUILD_START
     * @emits PATTERNLAB_BUILD_END
     * @see {@link ./events.md|all events}
     * @returns {Promise} a promise fulfilled when build is complete
     */
    build: async function (options) {
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

      return await buildPatterns(
        options.cleanPublic,
        patternlab,
        options.data
      ).then(() => {
        return new ui_builder().buildFrontend(patternlab).then(() => {
          copier()
            .copyAndWatch(patternlab.config.paths, patternlab, options)
            .then(() => {
              patternlab.isBusy = false;
              // only wire up this listener and the one inside serve.js
              // figure out how to detect if serve was called. we should not assume it was
              if (
                patternlab.serverReady //check for server presence
                  ? this.events.listenerCount(
                      events.PATTERNLAB_PATTERN_CHANGE
                    ) === 1 //if the server is started, it has already setup one listener
                  : !this.events.listenerCount(events.PATTERNLAB_PATTERN_CHANGE) // else, check for the presnce of none
              ) {
                this.events.on(events.PATTERNLAB_PATTERN_CHANGE, () => {
                  if (!patternlab.isBusy) {
                    return this.build(options).then(() => {
                      patternlab.isBusy = false;
                    });
                  }
                  return Promise.resolve();
                });
              }

              if (!this.events.listenerCount(events.PATTERNLAB_GLOBAL_CHANGE)) {
                this.events.on(events.PATTERNLAB_GLOBAL_CHANGE, () => {
                  if (!patternlab.isBusy) {
                    return this.build(
                      Object.assign({}, options, { cleanPublic: true }) // rebuild everything
                    );
                  }
                  return Promise.resolve();
                });
              }
            })
            .then(() => {
              this.events.emit(events.PATTERNLAB_BUILD_END, patternlab);
            });
        });
      });
    },

    /**
     * Returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.
     *
     * @memberof patternlab
     * @name getDefaultConfig
     * @instance
     * @return {object} Returns the object representation of the `patternlab-config.json`
     */
    getDefaultConfig: function () {
      return getDefaultConfig();
    },

    /**
     * Returns all file extensions supported by installed PatternEngines
     *
     * @memberof patternlab
     * @name getSupportedTemplateExtensions
     * @instance
     * @returns {Array<string>} all supported file extensions
     */
    getSupportedTemplateExtensions: function () {
      return patternlab.getSupportedTemplateExtensions();
    },

    /**
     * Fetches starterkit repositories from pattern-lab github org that contain 'starterkit' in their name
     *
     * @memberof patternlab
     * @name liststarterkits
     * @instance
     * @returns {Promise} Returns an Array<{name,url}> for the starterkit repos
     */
    liststarterkits: function () {
      return patternlab.listStarterkits();
    },

    /**
     * Loads starterkit already available as a package dependency
     *
     * @memberof patternlab
     * @name loadstarterkit
     * @instance
     * @param {string} starterkitName name of starterkit
     * @param {boolean} clean whether or not to delete contents of source/ before load
     * @returns {void}
     */
    loadstarterkit: function (starterkitName, clean) {
      patternlab.loadStarterKit(starterkitName, clean);
    },

    /**
     * Builds patterns only, leaving existing user interface files intact
     *
     * @memberof patternlab
     * @name patternsonly
     * @instance
     * @param {bool} [options.cleanPublic=true] whether or not to delete the configured output location (usually `public/`) before build
     * @param {object} [options.data={}] additional data to be merged with global data prior to build
     * @param {bool} [options.watch=true] whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild
     * @returns {Promise} a promise fulfilled when build is complete
     */
    patternsonly: async function (options) {
      if (patternlab && patternlab.isBusy) {
        logger.info(
          'Pattern Lab is busy building a previous run - returning early.'
        );
        return Promise.resolve();
      }
      patternlab.isBusy = true;
      return await buildPatterns(
        options.cleanPublic,
        patternlab,
        options.data
      ).then(() => {
        patternlab.isBusy = false;
      });
    },

    /**
     * Server module
     *
     * @memberof patternlab
     * @type {object}
     */
    server: {
      /**
       * Build patterns, copies assets, and constructs user interface. Watches configured `source/` directories, and serves all output locally
       *
       * @method serve
       * @memberof patternlab.server
       * @param {object} options an object used to control build behavior
       * @param {bool} [options.cleanPublic=true] whether or not to delete the configured output location (usually `public/`) before build
       * @param {object} [options.data={}] additional data to be merged with global data prior to build
       * @param {bool} [options.watch=true] whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild
       * @returns {Promise} a promise fulfilled when build is complete
       */
      serve: (options) => {
        return _api
          .build(options)
          .then(() => server.serve())
          .catch((e) =>
            logger.error(`error inside core index.js server serve: ${e}`)
          );
      },
      /**
       * Reloads any active live-server instances
       *
       * @method reload
       * @memberof patternlab.server
       * @returns {Promise} a promise fulfilled when operation is complete
       */
      reload: server.reload,
      /**
       * Reloads CSS on any active live-server instances
       *
       * @method refreshCSS
       * @memberof patternlab.server
       * @returns {Promise} a promise fulfilled when operation is complete
       */
      refreshCSS: server.refreshCSS,
    },

    /**
     * @memberof patternlab
     * @type {EventEmitter}
     * @see {@link https://nodejs.org/api/events.html#events_class_eventemitter|EventEmitter}
     * @see {@link ./events.md|All Pattern Lab events}
     */
    events: patternlab.events,
  };

  return _api;
};

patternlab_module.getDefaultConfig = getDefaultConfig;
patternlab_module.getVersion = getVersion;

module.exports = patternlab_module;
