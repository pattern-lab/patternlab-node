'use strict';

const dive = require('dive');
const _ = require('lodash');
const path = require('path');
const cleanHtml = require('js-beautify').html;

const inherits = require('util').inherits;
const pm = require('./plugin_manager');
const plugin_manager = new pm();
const packageInfo = require('../../package.json');
const events = require('./events');
const buildListItems = require('./buildListItems');
const dataLoader = require('./data_loader')();
const loaduikits = require('./loaduikits');
const logger = require('./log');
const processIterative = require('./processIterative');
const processRecursive = require('./processRecursive');

const loadPattern = require('./loadPattern');
const sm = require('./starterkit_manager');

const patternEngines = require('./pattern_engines');

//these are mocked in unit tests, so let them be overridden
let fs = require('fs-extra'); // eslint-disable-line

const EventEmitter = require('events').EventEmitter;

function PatternLabEventEmitter() {
  EventEmitter.call(this);
}
inherits(PatternLabEventEmitter, EventEmitter);

module.exports = class PatternLab {
  constructor(config) {
    // Either use the config we were passed, or load one up from the config file ourselves
    this.config =
      config ||
      fs.readJSONSync(path.resolve(__dirname, '../../patternlab-config.json'));

    //register our log events
    this.registerLogger(config.logLevel);

    logger.info(`Pattern Lab Node v${packageInfo.version}`);

    // Load up engines please
    this.engines = patternEngines;
    this.engines.loadAllEngines(config);
    this.isBusy = false;

    //
    // INITIALIZE EMPTY GLOBAL DATA STRUCTURES
    //
    this.data = {};
    this.patterns = [];
    this.subgroupPatterns = {};
    this.partials = {};

    // Cache the package.json in RAM
    this.package = fs.readJSONSync(
      path.resolve(__dirname, '../../package.json')
    );

    // Make ye olde event emitter
    this.events = new PatternLabEventEmitter();

    this.hooks = {};
    this.hooks[events.PATTERNLAB_PATTERN_WRITE_END] = [];

    // Make a place for the pattern graph to sit
    this.graph = null;

    // Make a place to attach known watchers so we can manage them better during serve and watch
    this.watchers = {};

    // make a place to register any uikits
    this.uikits = {};
    loaduikits(this);

    // Verify correctness of configuration (?)
    this.checkConfiguration(this);

    this.initializePlugins(this);
  }

  checkConfiguration(patternlab) {
    //default the output suffixes if not present
    const outputFileSuffixes = {
      rendered: '.rendered',
      rawTemplate: '',
      markupOnly: '.markup-only',
    };

    if (!patternlab.config.outputFileSuffixes) {
      logger.warning('');
      logger.warning(
        'Configuration key [outputFileSuffixes] not found, and defaulted to the following:'
      );
      logger.info(outputFileSuffixes);
      logger.warning(
        'Since Pattern Lab Node Core 2.3.0 this configuration option is required. Suggest you add it to your patternlab-config.json file.'
      );
      logger.warning('');
    }
    patternlab.config.outputFileSuffixes = _.extend(
      outputFileSuffixes,
      patternlab.config.outputFileSuffixes
    );

    if (typeof patternlab.config.paths.source.patternlabFiles === 'string') {
      logger.warning('');
      logger.warning(
        `Configuration key [paths.source.patternlabFiles] inside patternlab-config.json was found as the string '${patternlab.config.paths.source.patternlabFiles}'`
      );
      logger.warning(
        'Since Pattern Lab Node Core 3.0.0 this key is an object. Suggest you update this key following this issue: https://github.com/pattern-lab/patternlab-node/issues/683.'
      );
      logger.warning('');
    }

    if (typeof patternlab.config.debug === 'boolean') {
      logger.warning('');
      logger.warning(
        `Configuration key [debug] inside patternlab-config.json was found. As of Pattern Lab Node Core 3.0.0 this key is replaced with a new key, [logLevel]. This is a string with possible values ['debug', 'info', 'warning', 'error', 'quiet'].`
      );
      logger.warning(
        `Turning on 'info', 'warning', and 'error' levels by default, unless [logLevel] is present. If that is the case, [debug] has no effect.`
      );
      logger.warning('');
    }
  }

  /**
   * Finds and calls the main method of any found plugins.
   * @param patternlab - global data store
   */
  initializePlugins(patternlab) {
    if (!patternlab.config.plugins) {
      return;
    }
    plugin_manager.intialize_plugins(patternlab);
  }

  buildGlobalData(additionalData) {
    const paths = this.config.paths;

    //
    // COLLECT GLOBAL LIBRARY DATA
    //

    // data.json
    try {
      this.data = this.buildPatternData(paths.source.data, fs); // eslint-disable-line no-use-before-define
      this.data.link = {};
    } catch (ex) {
      logger.error(
        'missing or malformed' +
          paths.source.data +
          'data.json  Pattern Lab may not work without this file.'
      );
      this.data = {};
    }

    // listitems.json
    try {
      this.listitems = fs.readJSONSync(
        path.resolve(paths.source.data, 'listitems.json')
      );
    } catch (ex) {
      logger.warning(
        'WARNING: missing or malformed ' +
          paths.source.data +
          'listitems.json file.  Pattern Lab may not work without this file.'
      );
      this.listitems = {};
    }

    this.data = Object.assign({}, this.data, additionalData);

    this.setCacheBust();

    buildListItems(this);

    this.events.emit(events.PATTERNLAB_BUILD_GLOBAL_DATA_END, this);
  }

  setCacheBust() {
    if (this.config.cacheBust) {
      logger.debug('setting cacheBuster value for frontend assets.');
      this.cacheBuster = new Date().getTime();
    } else {
      this.cacheBuster = 0;
    }
  }

  // Starter Kit loading methods

  listStarterkits() {
    const starterkit_manager = new sm(this.config);
    return starterkit_manager.list_starterkits();
  }

  loadStarterKit(starterkitName, clean) {
    const starterkit_manager = new sm(this.config);
    starterkit_manager.load_starterkit(starterkitName, clean);
  }

  // info methods
  getVersion() {
    return this.package.version;
  }
  getSupportedTemplateExtensions() {
    return this.engines.getSupportedFileExtensions();
  }

  writePatternFiles(headHTML, pattern, footerHTML, outputBasePath) {
    const nullFormatter = (str) => str;
    const defaultFormatter = (codeString) =>
      cleanHtml(codeString, { indent_size: 2 });
    const makePath = (type) =>
      path.join(
        this.config.paths.public.patterns,
        pattern.getPatternLink(this, type)
      );
    const patternPage = headHTML + pattern.patternPartialCode + footerHTML;
    const eng = pattern.engine;

    //beautify the output if configured to do so
    const formatters = this.config.cleanOutputHtml
      ? {
          rendered: eng.renderedCodeFormatter || defaultFormatter,
          rawTemplate: eng.rawTemplateCodeFormatter || defaultFormatter,
          markupOnly: eng.markupOnlyCodeFormatter || defaultFormatter,
        }
      : {
          rendered: nullFormatter,
          rawTemplate: nullFormatter,
          markupOnly: nullFormatter,
        };

    //prepare the path and contents of each output file
    const outputFiles = [
      {
        path: makePath('rendered'),
        content: formatters.rendered(patternPage, pattern),
      },
      {
        path: makePath('rawTemplate'),
        content: formatters.rawTemplate(pattern.template, pattern),
      },
      {
        path: makePath('markupOnly'),
        content: formatters.markupOnly(pattern.patternPartialCode, pattern),
      },
    ].concat(
      eng.addOutputFiles ? eng.addOutputFiles(this.config.paths, this) : []
    );

    //write the compiled template to the public patterns directory
    outputFiles.forEach((outFile) =>
      fs.outputFileSync(
        path.join(process.cwd(), outputBasePath, outFile.path),
        outFile.content
      )
    );
  }

  /**
   * Binds console logging to different levels
   *
   * @param {string} logLevel
   * @memberof PatternLab
   */
  registerLogger(logLevel) {
    if (logLevel === undefined) {
      logger.log.on('info', (msg) => console.info(msg));
      logger.log.on('warning', (msg) => console.info(msg));
      logger.log.on('error', (msg) => console.info(msg));
    } else {
      if (logLevel === 'quiet') {
        return;
      }
      switch (logLevel) {
        case 'debug':
          logger.log.on('debug', (msg) => console.info(msg));
        case 'info':
          logger.log.on('info', (msg) => console.info(msg));
        case 'warning':
          logger.log.on('warning', (msg) => console.info(msg));
        case 'error':
          logger.log.on('error', (msg) => console.info(msg));
      }
    }
  }

  /**
   * Given a path, load info from the folder to compile into a single config object.
   * @param dataFilesPath
   * @param fsDep
   * @returns {{}}
   */
  buildPatternData(dataFilesPath, fsDep) {
    return dataLoader.loadDataFromFolder(dataFilesPath, 'listitems', fsDep);
  }

  // dive once to perform iterative populating of patternlab object
  processAllPatternsIterative(patterns_dir) {
    const self = this;

    // before updating the patterns has to be reset, otherwise
    // deleted pattern would still be present in the patterns array
    this.patterns = [];

    const promiseAllPatternFiles = new Promise(function (resolve) {
      dive(
        patterns_dir,
        (err, file) => {
          //log any errors
          if (err) {
            logger.info('error in processAllPatternsIterative():', err);
            return;
          }

          // We now have the loading and process phases spearated; this
          // loads all the patterns before beginning any analysis, so we
          // can load them asynchronously and be sure we know about all
          // of them before we start lineage hunting, for
          // example. Incidentally, this should also allow people to do
          // horrifying things like include a page in a atom. But
          // please, if you're reading this: don't.

          // NOTE: sync for now
          loadPattern(path.relative(patterns_dir, file), self);
        },
        resolve
      );
    });
    return promiseAllPatternFiles.then(() => {
      return Promise.all(
        this.patterns.map((pattern) => {
          return processIterative(pattern, self);
        })
      ).then(() => {
        // patterns sorted by name so the patternGroup and patternSubgroup is adhered to for menu building
        this.patterns.sort((pattern1, pattern2) =>
          pattern1.name.localeCompare(pattern2.name)
        );
      });
    });
  }

  processAllPatternsRecursive(patterns_dir) {
    const self = this;

    const promiseAllPatternFiles = new Promise(function (resolve) {
      dive(
        patterns_dir,
        (err, file) => {
          //log any errors
          if (err) {
            logger.info(err);
            return;
          }
          processRecursive(path.relative(patterns_dir, file), self);
        },
        resolve
      );
    });
    return promiseAllPatternFiles;
  }
};
