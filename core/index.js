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

const path = require('path');
const updateNotifier = require('update-notifier');

const events = require('./lib/events');
const logger = require('./lib/log');
const PatternGraph = require('./lib/pattern_graph').PatternGraph;
const CompileState = require('./lib/object_factory').CompileState;
const pe = require('./lib/pattern_exporter');
const lh = require('./lib/lineage_hunter');
const markModifiedPatterns = require('./lib/markModifiedPatterns');
const parseAllLinks = require('./lib/parseAllLinks');
const processMetaPattern = require('./lib/processMetaPattern');
const render = require('./lib/render');
const Pattern = require('./lib/object_factory').Pattern;

const defaultConfig = require('../patternlab-config.json');

let fs = require('fs-extra'); // eslint-disable-line
let ui_builder = require('./lib/ui_builder'); // eslint-disable-line
let assetCopier = require('./lib/asset_copy'); // eslint-disable-line
let pattern_exporter = new pe(); // eslint-disable-line
let serve = require('./lib/serve'); // eslint-disable-line

const lineage_hunter = new lh();

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
  const paths = patternlab.config.paths;

  function help() {
    logger.info('');

    logger.info('Pattern Lab Node v' + patternlab.package.version);

    logger.info('');
    logger.info('Usage: patternlab.<FUNCTION_NAME>()');
    logger.info('');

    logger.info(' build');
    logger.info(
      '   > builds patterns, copies assets, and constructs ui into config.paths.public'
    );
    logger.info('');

    logger.info(' patternsonly');
    logger.info(
      '   > builds patterns only, leaving existing public files intact'
    );
    logger.info('');

    logger.info(' version');
    logger.info('   > logs current version');
    logger.info('');

    logger.info(' v');
    logger.info('   > return current version as a string');
    logger.info('');

    logger.info(' help');
    logger.info(
      '   > logs more information about patternlab-node, pattern lab in general, and where to report issues.'
    );
    logger.info('');

    logger.info(' liststarterkits');
    logger.info(
      '   > fetches starterkit repos from pattern-lab github org that contain "starterkit" in their name'
    );
    logger.info('');

    logger.info(' loadstarterkit');
    logger.info(
      '   > loads starterkit already available via `node_modules/` into config.paths.source/*'
    );
    logger.info(
      '   > NOTE: Overwrites existing content, and only cleans out existing directory if --clean=true argument is passed.'
    );
    logger.info(
      '   > NOTE: In most cases, `npm install starterkit-name` will precede this call.'
    );
    logger.info('   > parameters:');
    logger.info('      kit:string ');
    logger.info('      > the name of the starter kit to load');
    logger.info('      clean:bool ');
    logger.info(
      '      > whether or not to remove all files from config.paths.source/ prior to load'
    );
    logger.info('   > example:');
    logger.info(
      '    `patternlab.loadstarterkit("starterkit-mustache-demo", true)'
    );
    logger.info('');

    // installplugin
    // serve
    // getSupportedTemplateExtensions
    // events
    // getDefaultConfig

    logger.info('===============================');
    logger.info('');
    logger.info('Visit http://patternlab.io/ for more info about Pattern Lab');
    logger.info(
      'Visit https://github.com/pattern-lab/patternlab-node/issues to open an issue.'
    );
    logger.info(
      'Visit https://github.com/pattern-lab/patternlab-node/wiki to view the changelog, roadmap, and other info.'
    );
    logger.info('');
    logger.info('===============================');
  }

  /**
   * If a graph was serialized and then {@code deletePatternDir == true}, there is a mismatch in the
   * pattern metadata and not all patterns might be recompiled.
   * For that reason an empty graph is returned in this case, so every pattern will be flagged as
   * "needs recompile". Otherwise the pattern graph is loaded from the meta data.
   *
   * @param patternlab
   * @param {boolean} deletePatternDir When {@code true}, an empty graph is returned
   * @return {PatternGraph}
   */
  function loadPatternGraph(deletePatternDir) {
    // Sanity check to prevent problems when code is refactored
    if (deletePatternDir) {
      return PatternGraph.empty();
    }
    return PatternGraph.loadFromFile(patternlab);
  }

  function cleanBuildDirectory(incrementalBuildsEnabled) {
    if (incrementalBuildsEnabled) {
      logger.info('Incremental builds enabled.');
      return Promise.resolve();
    } else {
      // needs to be done BEFORE processing patterns
      return fs
        .emptyDir(paths.public.patterns)
        .then(() => {
          return Promise.resolve();
        })
        .catch(reason => {
          logger.error(reason);
        });
    }
  }

  function buildPatterns(deletePatternDir, additionalData) {
    patternlab.events.emit(events.PATTERNLAB_BUILD_PATTERN_START, patternlab);

    //
    // CHECK INCREMENTAL BUILD GRAPH
    //
    const graph = (patternlab.graph = loadPatternGraph(deletePatternDir));
    const graphNeedsUpgrade = !PatternGraph.checkVersion(graph);
    if (graphNeedsUpgrade) {
      logger.info(
        'Due to an upgrade, a complete rebuild is required and the public/patterns directory was deleted. ' +
          'Incremental build is available again on the next successful run.'
      );

      // Ensure that the freshly built graph has the latest version again.
      patternlab.graph.upgradeVersion();
    }

    // Flags
    patternlab.incrementalBuildsEnabled = !(
      deletePatternDir || graphNeedsUpgrade
    );

    //
    // CLEAN BUILD DIRECTORY, maybe
    //
    return cleanBuildDirectory(patternlab.incrementalBuildsEnabled).then(() => {
      patternlab.buildGlobalData(additionalData);

      return patternlab
        .processAllPatternsIterative(paths.source.patterns)
        .then(() => {
          patternlab.events.emit(
            events.PATTERNLAB_PATTERN_ITERATION_END,
            patternlab
          );

          //now that all the main patterns are known, look for any links that might be within data and expand them
          //we need to do this before expanding patterns & partials into extendedTemplates, otherwise we could lose the data -> partial reference
          parseAllLinks(patternlab);

          //dive again to recursively include partials, filling out the
          //extendedTemplate property of the patternlab.patterns elements

          return patternlab
            .processAllPatternsRecursive(paths.source.patterns)
            .then(() => {
              //take the user defined head and foot and process any data and patterns that apply
              const headPatternPromise = processMetaPattern(
                `_00-head.${patternlab.config.patternExtension}`,
                'userHead',
                patternlab
              );
              const footPatternPromise = processMetaPattern(
                `_01-foot.${patternlab.config.patternExtension}`,
                'userFoot',
                patternlab
              );

              return Promise.all([headPatternPromise, footPatternPromise])
                .then(() => {
                  //cascade any patternStates
                  lineage_hunter.cascade_pattern_states(patternlab);

                  //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
                  return render(
                    Pattern.createEmpty({
                      extendedTemplate: patternlab.header,
                    }),
                    {
                      cacheBuster: patternlab.cacheBuster,
                    }
                  )
                    .then(results => {
                      patternlab.data.patternLabHead = results;

                      // If deletePatternDir == true or graph needs to be updated
                      // rebuild all patterns
                      let patternsToBuild = null;

                      // If deletePatternDir == true or graph needs to be updated
                      // rebuild all patterns
                      patternsToBuild = null;

                      if (patternlab.incrementalBuildsEnabled) {
                        // When the graph was loaded from file, some patterns might have been moved/deleted between runs
                        // so the graph data become out of sync
                        patternlab.graph.sync().forEach(n => {
                          logger.info('[Deleted/Moved] ' + n);
                        });

                        // TODO Find created or deleted files
                        const now = new Date().getTime();
                        markModifiedPatterns(now, patternlab);
                        patternsToBuild = patternlab.graph.compileOrder();
                      } else {
                        // build all patterns, mark all to be rebuilt
                        patternsToBuild = patternlab.patterns;
                        for (const p of patternsToBuild) {
                          p.compileState = CompileState.NEEDS_REBUILD;
                        }
                      }

                      //render all patterns last, so lineageR works
                      return patternsToBuild
                        .reduce((previousPromise, pattern) => {
                          return previousPromise.then(() =>
                            patternlab.renderSinglePattern(pattern)
                          );
                        }, Promise.resolve())
                        .then(() => {
                          // Saves the pattern graph when all files have been compiled
                          PatternGraph.storeToFile(patternlab);
                          if (patternlab.config.exportToGraphViz) {
                            PatternGraph.exportToDot(
                              patternlab,
                              'dependencyGraph.dot'
                            );
                            logger.info(
                              `Exported pattern graph to ${path.join(
                                config.paths.public.root,
                                'dependencyGraph.dot'
                              )}`
                            );
                          }

                          //export patterns if necessary
                          pattern_exporter.export_patterns(patternlab);
                        })
                        .catch(reason => {
                          console.log(reason);
                          logger.error('Error rendering patterns');
                        });
                    })
                    .catch(reason => {
                      console.log(reason);
                      logger.error('Error rendering pattern lab header');
                    });
                })
                .catch(reason => {
                  console.log(reason);
                  logger.error('Error processing meta patterns');
                });
            })
            .catch(reason => {
              console.log(reason);
              logger.error('Error processing patterns recursively');
            });
        })
        .catch(reason => {
          console.log(reason);
          logger.error('Error in buildPatterns()');
        });
    });
  }

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
      if (patternlab && patternlab.isBusy) {
        logger.info(
          'Pattern Lab is busy building a previous run - returning early.'
        );
        return Promise.resolve();
      }
      patternlab.isBusy = true;
      return buildPatterns(options.cleanPublic, options.data).then(() => {
        return new ui_builder().buildFrontend(patternlab).then(() => {
          assetCopier().copyAssets(
            patternlab.config.paths,
            patternlab,
            options
          );

          this.events.on('patternlab-pattern-change', () => {
            if (!patternlab.isBusy) {
              return this.build(options);
            }
            return Promise.resolve();
          });

          this.events.on('patternlab-global-change', () => {
            if (!patternlab.isBusy) {
              return this.build(
                Object.assign({}, options, { cleanPublic: true }) // rebuild everything
              );
            }
            return Promise.resolve();
          });

          patternlab.isBusy = false;
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
      help();
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
      return buildPatterns(options.cleanPublic, options.data).then(() => {
        patternlab.isBusy = false;
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
