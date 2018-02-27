'use strict';

const dive = require('dive');
const _ = require('lodash');
const path = require('path');
const cleanHtml = require('js-beautify').html;

const inherits = require('util').inherits;
const pm = require('./plugin_manager');
const packageInfo = require('../../package.json');
const events = require('./events');
const buildListItems = require('./buildListItems');
const dataLoader = require('./data_loader')();
const logger = require('./log');
const parseLink = require('./parseLink');
const processIterative = require('./processIterative');
const processRecursive = require('./processRecursive');
const jsonCopy = require('./json_copy');
const render = require('./render');
const loadPattern = require('./loadPattern');
const sm = require('./starterkit_manager');
const Pattern = require('./object_factory').Pattern;
const CompileState = require('./object_factory').CompileState;
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

    //
    // INITIALIZE EMPTY GLOBAL DATA STRUCTURES
    //
    this.data = {};
    this.patterns = [];
    this.subtypePatterns = {};
    this.partials = {};

    // Cache the package.json in RAM
    this.package = fs.readJSONSync(
      path.resolve(__dirname, '../../package.json')
    );

    // Make ye olde event emitter
    this.events = new PatternLabEventEmitter();

    // Make a place for the pattern graph to sit
    this.graph = null;

    // Make a place to attach known watchers so we can manage them better during serve and watch
    this.watchers = {};

    // Verify correctness of configuration (?)
    this.checkConfiguration(this);

    // TODO: determine if this is the best place to wire up plugins
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
        `Configuration key [paths.source.patternlabFiles] inside patternlab-config.json was found as the string '${
          patternlab.config.paths.source.patternlabFiles
        }'`
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
  //todo, move this to plugin_manager
  initializePlugins(patternlab) {
    if (!patternlab.config.plugins) {
      return;
    }

    const plugin_manager = new pm(
      patternlab.config,
      path.resolve(__dirname, '../../patternlab-config.json')
    );
    const foundPlugins = plugin_manager.detect_plugins();

    if (foundPlugins && foundPlugins.length > 0) {
      for (let i = 0; i < foundPlugins.length; i++) {
        const pluginKey = foundPlugins[i];

        logger.info(`Found plugin: ${pluginKey}`);
        logger.info(`Attempting to load and initialize plugin.`);

        const plugin = plugin_manager.load_plugin(pluginKey);
        plugin(patternlab);
      }
    }
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

    // load up all the necessary files from pattern lab that apply to every template
    try {
      this.header = fs.readFileSync(
        path.resolve(paths.source.patternlabFiles['general-header']),
        'utf8'
      );
      this.footer = fs.readFileSync(
        path.resolve(paths.source.patternlabFiles['general-footer']),
        'utf8'
      );
      this.patternSection = fs.readFileSync(
        path.resolve(paths.source.patternlabFiles.patternSection),
        'utf8'
      );
      this.patternSectionSubType = fs.readFileSync(
        path.resolve(paths.source.patternlabFiles.patternSectionSubtype),
        'utf8'
      );
      this.viewAll = fs.readFileSync(
        path.resolve(paths.source.patternlabFiles.viewall),
        'utf8'
      );
    } catch (ex) {
      logger.error(ex);
      logger.error(
        '\nERROR: missing an essential file from ' +
          paths.source.patternlabFiles +
          ". Pattern Lab won't work without this file.\n"
      );
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
  logVersion() {
    logger.info(this.package.version);
  }
  getSupportedTemplateExtensions() {
    return this.engines.getSupportedFileExtensions();
  }

  writePatternFiles(headHTML, pattern, footerHTML) {
    const nullFormatter = str => str;
    const defaultFormatter = codeString =>
      cleanHtml(codeString, { indent_size: 2 });
    const makePath = type =>
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
    outputFiles.forEach(outFile =>
      fs.outputFileSync(outFile.path, outFile.content)
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
      logger.log.on('info', msg => console.info(msg));
      logger.log.on('warning', msg => console.info(msg));
      logger.log.on('error', msg => console.info(msg));
    } else {
      if (logLevel === 'quiet') {
        return;
      }
      switch (logLevel) {
        case 'debug':
          logger.log.on('debug', msg => console.info(msg));
        case 'info':
          logger.log.on('info', msg => console.info(msg));
        case 'warning':
          logger.log.on('warning', msg => console.info(msg));
        case 'error':
          logger.log.on('error', msg => console.info(msg));
      }
    }
  }

  renderSinglePattern(pattern) {
    // Pattern does not need to be built and recompiled more than once
    if (!pattern.isPattern || pattern.compileState === CompileState.CLEAN) {
      return Promise.resolve(false);
    }

    // Allows serializing the compile state
    this.graph.node(pattern).compileState = pattern.compileState =
      CompileState.BUILDING;

    //todo move this into lineage_hunter
    pattern.patternLineages = pattern.lineage;
    pattern.patternLineageExists = pattern.lineage.length > 0;
    pattern.patternLineagesR = pattern.lineageR;
    pattern.patternLineageRExists = pattern.lineageR.length > 0;
    pattern.patternLineageEExists =
      pattern.patternLineageExists || pattern.patternLineageRExists;

    this.events.emit(
      events.PATTERNLAB_PATTERN_BEFORE_DATA_MERGE,
      this,
      pattern
    );

    //render the pattern, but first consolidate any data we may have
    let allData;

    let allListItems = _.merge({}, this.listitems, pattern.listitems);
    allListItems = parseLink(
      this,
      allListItems,
      'listitems.json + any pattern listitems.json'
    );

    allData = _.merge({}, this.data, pattern.jsonFileData);
    allData = _.merge({}, allData, allListItems);
    allData.cacheBuster = this.cacheBuster;
    allData.patternPartial = pattern.patternPartial;

    ///////////////
    // HEADER
    ///////////////

    //re-rendering the headHTML each time allows pattern-specific data to influence the head of the pattern
    let headPromise;
    if (this.userHead) {
      headPromise = render(this.userHead, allData);
    } else {
      headPromise = render(
        Pattern.createEmpty({ extendedTemplate: this.header }),
        allData
      );
    }

    ///////////////
    // PATTERN
    ///////////////

    //render the extendedTemplate with all data
    const patternPartialPromise = render(pattern, allData, this.partials);

    ///////////////
    // FOOTER
    ///////////////

    // stringify this data for individual pattern rendering and use on the styleguide
    // see if patternData really needs these other duped values

    // construct our extraOutput dump
    const extraOutput = Object.assign(
      {},
      pattern.extraOutput,
      pattern.allMarkdown
    );
    delete extraOutput.title;
    delete extraOutput.state;
    delete extraOutput.markdown;

    pattern.patternData = JSON.stringify({
      cssEnabled: false,
      patternLineageExists: pattern.patternLineageExists,
      patternLineages: pattern.patternLineages,
      lineage: pattern.patternLineages,
      patternLineageRExists: pattern.patternLineageRExists,
      patternLineagesR: pattern.patternLineagesR,
      lineageR: pattern.patternLineagesR,
      patternLineageEExists:
        pattern.patternLineageExists || pattern.patternLineageRExists,
      patternDesc: pattern.patternDescExists ? pattern.patternDesc : '',
      patternBreadcrumb:
        pattern.patternGroup === pattern.patternSubGroup
          ? {
              patternType: pattern.patternGroup,
            }
          : {
              patternType: pattern.patternGroup,
              patternSubtype: pattern.patternSubGroup,
            },
      patternExtension: pattern.fileExtension.substr(1), //remove the dot because styleguide asset default adds it for us
      patternName: pattern.patternName,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState,
      patternEngineName: pattern.engine.engineName,
      extraOutput: extraOutput,
    });

    //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
    const footerPartialPromise = render(
      Pattern.createEmpty({ extendedTemplate: this.footer }),
      {
        isPattern: pattern.isPattern,
        patternData: pattern.patternData,
        cacheBuster: this.cacheBuster,
      }
    );

    const self = this;

    return Promise.all([
      headPromise,
      patternPartialPromise,
      footerPartialPromise,
    ])
      .then(intermediateResults => {
        // retrieve results of promises
        const headHTML = intermediateResults[0]; //headPromise
        pattern.patternPartialCode = intermediateResults[1]; //patternPartialPromise
        const footerPartial = intermediateResults[2]; //footerPartialPromise

        //finish up our footer data
        let allFooterData;
        try {
          allFooterData = jsonCopy(
            self.data,
            'config.paths.source.data global data'
          );
        } catch (err) {
          logger.info('There was an error parsing JSON for ' + pattern.relPath);
          logger.info(err);
        }
        allFooterData = _.merge(allFooterData, pattern.jsonFileData);
        allFooterData.patternLabFoot = footerPartial;

        return render(self.userFoot, allFooterData).then(footerHTML => {
          ///////////////
          // WRITE FILES
          ///////////////

          self.events.emit(
            events.PATTERNLAB_PATTERN_WRITE_BEGIN,
            self,
            pattern
          );

          //write the compiled template to the public patterns directory
          self.writePatternFiles(headHTML, pattern, footerHTML);

          self.events.emit(events.PATTERNLAB_PATTERN_WRITE_END, self, pattern);

          // Allows serializing the compile state
          self.graph.node(pattern).compileState = pattern.compileState =
            CompileState.CLEAN;
          logger.info('Built pattern: ' + pattern.patternPartial);
        });
      })
      .catch(reason => {
        console.log(reason);
      });
  }

  /**
   * Installs a given plugin. Assumes it has already been pulled down via npm
   * @param pluginName - the name of the plugin
   */
  installPlugin(pluginName) {
    //get the config
    const configPath = path.resolve(process.cwd(), 'patternlab-config.json');
    const config = fs.readJSONSync(path.resolve(configPath), 'utf8');
    const plugin_manager = new pm(config, configPath);

    plugin_manager.install_plugin(pluginName);
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
    const promiseAllPatternFiles = new Promise(function(resolve) {
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
        this.patterns.map(pattern => {
          return processIterative(pattern, self);
        })
      );
    });
  }

  processAllPatternsRecursive(patterns_dir) {
    const self = this;

    const promiseAllPatternFiles = new Promise(function(resolve) {
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
