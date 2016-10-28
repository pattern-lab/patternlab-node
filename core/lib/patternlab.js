/* 
 * patternlab-node - v2.6.0-alpha - 2016 
 * 
 * Brian Muenzenmeyer, Geoff Pursell, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

"use strict";

var diveSync = require('diveSync'),
  glob = require('glob'),
  _ = require('lodash'),
  fs = require('fs-extra'),
  path = require('path'),
  cleanHtml = require('js-beautify').html,
  inherits = require('util').inherits,
  pm = require('./plugin_manager'),
  plutils = require('./utilities');

var EventEmitter = require('events').EventEmitter;

function buildPatternData(dataFilesPath, fs) {
  var dataFiles = glob.sync(dataFilesPath + '*.json', {"ignore" : [dataFilesPath + 'listitems.json']});
  var mergeObject = {};
  dataFiles.forEach(function (filePath) {
    var jsonData = fs.readJSONSync(path.resolve(filePath), 'utf8');
    mergeObject = _.merge(mergeObject, jsonData);
  });
  return mergeObject;
}

// GTP: these two diveSync pattern processors factored out so they can be reused
// from unit tests to reduce code dupe!
function processAllPatternsIterative(pattern_assembler, patterns_dir, patternlab) {
  diveSync(
    patterns_dir,
    function (err, file) {
      //log any errors
      if (err) {
        console.log(err);
        return;
      }
      pattern_assembler.process_pattern_iterative(path.relative(patterns_dir, file), patternlab);
    }
  );
}

function processAllPatternsRecursive(pattern_assembler, patterns_dir, patternlab) {
  diveSync(
    patterns_dir,
    function (err, file) {
      //log any errors
      if (err) {
        console.log(err);
        return;
      }
      pattern_assembler.process_pattern_recursive(path.relative(patterns_dir, file), patternlab);
    }
  );
}

function checkConfiguration(patternlab) {
  //default the output suffixes if not present
  var outputFileSuffixes = {
    rendered: '.rendered',
    rawTemplate: '',
    markupOnly: '.markup-only'
  };

  if (!patternlab.config.outputFileSuffixes) {
    plutils.logOrange('Configuration Object "outputFileSuffixes" not found, and defaulted to the following:');
    console.log(outputFileSuffixes);
    plutils.logOrange('Since Pattern Lab Core 2.3.0 this configuration option is required. Suggest you add it to your patternlab-config.json file.');
    console.log();
  }
  patternlab.config.outputFileSuffixes = _.extend(outputFileSuffixes, patternlab.config.outputFileSuffixes);
}

/**
 * Finds and calls the main method of any found plugins.
 * @param patternlab - global data store
 */
function initializePlugins(patternlab) {
  var plugin_manager = new pm(patternlab.config, path.resolve(__dirname, '../../patternlab-config.json'));
  var foundPlugins = plugin_manager.detect_plugins();

  if (foundPlugins && foundPlugins.length > 0) {

    for (var i = 0; i < foundPlugins.length; i++) {
      var plugin = plugin_manager.load_plugin(foundPlugins[i]);
      plugin(patternlab);
    }
  }
}

function PatternLabEventEmitter() {
  EventEmitter.call(this);
}
inherits(PatternLabEventEmitter, EventEmitter);

var patternlab_engine = function (config) {
  'use strict';

  var JSON5 = require('json5'),
    fs = require('fs-extra'),
    pa = require('./pattern_assembler'),
    pe = require('./pattern_exporter'),
    lh = require('./lineage_hunter'),
    ui = require('./ui_builder'),
    sm = require('./starterkit_manager'),
    Pattern = require('./object_factory').Pattern,
    CompileState = require('./object_factory').CompileState,
    patternlab = {};

  var pattern_assembler = new pa(),
    pattern_exporter = new pe(),
    lineage_hunter = new lh();

  patternlab.package = fs.readJSONSync(path.resolve(__dirname, '../../package.json'));
  patternlab.config = config || fs.readJSONSync(path.resolve(__dirname, '../../patternlab-config.json'));
  patternlab.events = new PatternLabEventEmitter();

  checkConfiguration(patternlab);

  //todo: determine if this is the best place to wire up plugins
  initializePlugins(patternlab);

  var paths = patternlab.config.paths;

  function getVersion() {
    console.log(patternlab.package.version);
  }

  function help() {

    console.log('');

    console.log('|=======================================|');
    plutils.logGreen('     Pattern Lab Node Help v' + patternlab.package.version);
    console.log('|=======================================|');

    console.log('');
    console.log('Command Line Interface - usually consumed by an edition');
    console.log('');

    plutils.logGreen(' patternlab:build');
    console.log('   > Compiles the patterns and frontend, outputting to config.paths.public');
    console.log('');

    plutils.logGreen(' patternlab:patternsonly');
    console.log('   > Compiles the patterns only, outputting to config.paths.public');
    console.log('');

    plutils.logGreen(' patternlab:version');
    console.log('   > Return the version of patternlab-node you have installed');
    console.log('');

    plutils.logGreen(' patternlab:help');
    console.log('   > Get more information about patternlab-node, pattern lab in general, and where to report issues.');
    console.log('');

    plutils.logGreen(' patternlab:liststarterkits');
    console.log('   > Returns a url with the list of available starterkits hosted on the Pattern Lab organization Github account');
    console.log('');

    plutils.logGreen(' patternlab:loadstarterkit');
    console.log('   > Load a starterkit into config.paths.source/*');
    console.log('   > NOTE: Overwrites existing content, and only cleans out existing directory if --clean=true argument is passed.');
    console.log('   > NOTE: In most cases, `npm install starterkit-name` will precede this call.');
    console.log('   > arguments:');
    console.log('      -- kit ');
    console.log('      > the name of the starter kit to load');
    console.log('      -- clean ');
    console.log('      > removes all files from config.paths.source/ prior to load');
    console.log('   > example (gulp):');
    console.log('    `gulp patternlab:loadstarterkit --kit=starterkit-mustache-demo`');
    console.log('');

    console.log('===============================');
    console.log('');
    console.log('Visit http://patternlab.io/ for more info about Pattern Lab');
    console.log('Visit https://github.com/pattern-lab/patternlab-node/issues to open an issue.');
    console.log('Visit https://github.com/pattern-lab/patternlab-node/wiki to view the changelog, roadmap, and other info.');
    console.log('');
    console.log('===============================');
  }

  function printDebug() {
    // A replacer function to pass to stringify below; this is here to prevent
    // the debug output from blowing up into a massive fireball of circular
    // references. This happens specifically with the Handlebars engine. Remove
    // if you like 180MB log files.
    function propertyStringReplacer(key, value) {
      if (key === 'engine' && value && value.engineName) {
        return '{' + value.engineName + ' engine object}';
      }
      return value;
    }

    //debug file can be written by setting flag on patternlab-config.json
    if (patternlab.config.debug) {
      console.log('writing patternlab debug file to ./patternlab.json');
      fs.outputFileSync('./patternlab.json', JSON.stringify(patternlab, propertyStringReplacer, 3));
    }
  }

  function setCacheBust() {
    if (patternlab.config.cacheBust) {
      if (patternlab.config.debug) {
        console.log('setting cacheBuster value for frontend assets.');
      }
      patternlab.cacheBuster = new Date().getTime();
    } else {
      patternlab.cacheBuster = 0;
    }
  }

  function listStarterkits() {
    var starterkit_manager = new sm(patternlab.config);
    return starterkit_manager.list_starterkits();
  }

  function loadStarterKit(starterkitName, clean) {
    var starterkit_manager = new sm(patternlab.config);
    starterkit_manager.load_starterkit(starterkitName, clean);
  }

  /**
   * Process the user-defined pattern head and prepare it for rendering
   */
  function processHeadPattern() {
    try {
      var headPath = path.resolve(paths.source.meta, '_00-head.mustache');
      var headPattern = new Pattern(headPath, null, patternlab);
      headPattern.template = fs.readFileSync(headPath, 'utf8');
      headPattern.isPattern = false;
      headPattern.isMetaPattern = true;
      pattern_assembler.decomposePattern(headPattern, patternlab, true);
      patternlab.userHead = headPattern.extendedTemplate;
    }
    catch (ex) {
      plutils.logRed('\nWARNING: Could not find the user-editable header template, currently configured to be at ' + path.join(config.paths.source.meta, '_00-head.mustache') + '. Your configured path may be incorrect (check paths.source.meta in your config file), the file may have been deleted, or it may have been left in the wrong place during a migration or update.\n');
      if (patternlab.config.debug) { console.log(ex); }
      process.exit(1);
    }
  }

  /**
   * Process the user-defined pattern footer and prepare it for rendering
   */
  function processFootPattern() {
    try {
      var footPath = path.resolve(paths.source.meta, '_01-foot.mustache');
      var footPattern = new Pattern(footPath, null, patternlab);
      footPattern.template = fs.readFileSync(footPath, 'utf8');
      footPattern.isPattern = false;
      footPattern.isMetaPattern = true;
      pattern_assembler.decomposePattern(footPattern, patternlab, true);
      patternlab.userFoot = footPattern.extendedTemplate;
    }
    catch (ex) {
      plutils.logRed('\nWARNING: Could not find the user-editable footer template, currently configured to be at ' + path.join(config.paths.source.meta, '_01-foot.mustache') + '. Your configured path may be incorrect (check paths.source.meta in your config file), the file may have been deleted, or it may have been left in the wrong place during a migration or update.\n');
      if (patternlab.config.debug) { console.log(ex); }
      process.exit(1);
    }
  }

  function buildPatterns(deletePatternDir) {

    patternlab.events.emit('patternlab-build-pattern-start', patternlab);

    try {
      patternlab.data = buildPatternData(paths.source.data, fs);
    } catch (ex) {
      plutils.logRed('missing or malformed' + paths.source.data + 'data.json  Pattern Lab may not work without this file.');
      patternlab.data = {};
    }
    try {
      patternlab.listitems = fs.readJSONSync(path.resolve(paths.source.data, 'listitems.json'));
    } catch (ex) {
      plutils.logOrange('WARNING: missing or malformed ' + paths.source.data + 'listitems.json file.  Pattern Lab may not work without this file.');
      patternlab.listitems = {};
    }
    try {
      patternlab.header = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials', 'general-header.mustache'), 'utf8');
      patternlab.footer = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials', 'general-footer.mustache'), 'utf8');
      patternlab.patternSection = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials', 'patternSection.mustache'), 'utf8');
      patternlab.patternSectionSubType = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials', 'patternSectionSubtype.mustache'), 'utf8');
      patternlab.viewAll = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'viewall.mustache'), 'utf8');
    } catch (ex) {
      console.log(ex);
      plutils.logRed('\nERROR: missing an essential file from ' + paths.source.patternlabFiles + '. Pattern Lab won\'t work without this file.\n');
      process.exit(1);
    }
    patternlab.patterns = [];
    patternlab.subtypePatterns = {};
    patternlab.partials = {};
    patternlab.data.link = {};

    setCacheBust();

    pattern_assembler.combine_listItems(patternlab);

    patternlab.events.emit('patternlab-build-global-data-end', patternlab);

    // diveSync once to perform iterative populating of patternlab object
    processAllPatternsIterative(pattern_assembler, paths.source.patterns, patternlab);

    patternlab.events.emit('patternlab-pattern-iteration-end', patternlab);

    //diveSync again to recursively include partials, filling out the
    //extendedTemplate property of the patternlab.patterns elements
    processAllPatternsRecursive(pattern_assembler, paths.source.patterns, patternlab);

    //take the user defined head and foot and process any data and patterns that apply
    processHeadPattern();
    processFootPattern();

    //now that all the main patterns are known, look for any links that might be within data and expand them
    //we need to do this before expanding patterns & partials into extendedTemplates, otherwise we could lose the data -> partial reference
    pattern_assembler.parse_data_links(patternlab);

    //cascade any patternStates
    lineage_hunter.cascade_pattern_states(patternlab);

    //delete the contents of config.patterns.public before writing
    if (deletePatternDir) {
      fs.removeSync(paths.public.patterns);
      fs.emptyDirSync(paths.public.patterns);
    }

    //set pattern-specific header if necessary
    var head;
    if (patternlab.userHead) {
      head = patternlab.userHead;
    } else {
      head = patternlab.header;
    }

    //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
    patternlab.data.patternLabHead = pattern_assembler.renderPattern(patternlab.header, {
      cacheBuster: patternlab.cacheBuster
    });

    // FIXME This simply iterates over all patterns, now we need to iterate over changed files
    // with a defined order


    var patternsToBuild = patternlab.patterns;

    //render all patterns last, so lineageR works
    patternsToBuild.forEach( pattern => renderSinglePattern(pattern, head));

    //export patterns if necessary
    pattern_exporter.export_patterns(patternlab);
  }

  function renderSinglePattern(pattern, head) {
    // Pattern does not need to be built and recompiled more than once
    if (!pattern.isPattern || pattern.compileState === CompileState.CLEAN) {
      return false;
    }
    pattern.compileState = CompileState.BUILDING;

    //todo move this into lineage_hunter
    pattern.patternLineages = pattern.lineage;
    pattern.patternLineageExists = pattern.lineage.length > 0;
    pattern.patternLineagesR = pattern.lineageR;
    pattern.patternLineageRExists = pattern.lineageR.length > 0;
    pattern.patternLineageEExists = pattern.patternLineageExists || pattern.patternLineageRExists;

    //render the pattern, but first consolidate any data we may have
    var allData;
    try {
      allData = JSON5.parse(JSON5.stringify(patternlab.data));
    } catch (err) {
      console.log('There was an error parsing JSON for ' + pattern.relPath);
      console.log(err);
    }
    allData = plutils.mergeData(allData, pattern.jsonFileData);
    allData.cacheBuster = patternlab.cacheBuster;

    //re-rendering the headHTML each time allows pattern-specific data to influence the head of the pattern
    pattern.header = head;
    var headHTML = pattern_assembler.renderPattern(pattern.header, allData);

    //render the extendedTemplate with all data
    pattern.patternPartialCode = pattern_assembler.renderPattern(pattern, allData);

    // stringify this data for individual pattern rendering and use on the styleguide
    // see if patternData really needs these other duped values
    pattern.patternData = JSON.stringify({
      cssEnabled: false,
      patternLineageExists: pattern.patternLineageExists,
      patternLineages: pattern.patternLineages,
      lineage: pattern.patternLineages,
      patternLineageRExists: pattern.patternLineageRExists,
      patternLineagesR: pattern.patternLineagesR,
      lineageR: pattern.patternLineagesR,
      patternLineageEExists: pattern.patternLineageExists || pattern.patternLineageRExists,
      patternDesc: pattern.patternDescExists ? pattern.patternDesc : '',
      patternBreadcrumb:
        pattern.patternGroup === pattern.patternSubGroup ?
        {
          patternType: pattern.patternGroup
        } : {
          patternType: pattern.patternGroup,
          patternSubtype: pattern.patternSubGroup
        },
      patternExtension: pattern.fileExtension.substr(1), //remove the dot because styleguide asset default adds it for us
      patternName: pattern.patternName,
      patternPartial: pattern.patternPartial,
      patternState: pattern.patternState,
      patternEngineName: pattern.engine.engineName,
      extraOutput: {}
    });

    //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
    var footerPartial = pattern_assembler.renderPattern(patternlab.footer, {
      isPattern: pattern.isPattern,
      patternData: pattern.patternData,
      cacheBuster: patternlab.cacheBuster
    });

    var allFooterData;
    try {
      allFooterData = JSON5.parse(JSON5.stringify(patternlab.data));
    } catch (err) {
      console.log('There was an error parsing JSON for ' + pattern.relPath);
      console.log(err);
    }
    allFooterData = plutils.mergeData(allFooterData, pattern.jsonFileData);
    allFooterData.patternLabFoot = footerPartial;

    var footerHTML = pattern_assembler.renderPattern(patternlab.userFoot, allFooterData);

    patternlab.events.emit('patternlab-pattern-write-begin', patternlab, pattern);

    //write the compiled template to the public patterns directory
    var patternPage = headHTML + pattern.patternPartialCode + footerHTML;

    //beautify the output if configured to do so
    var cleanedPatternPage = config.cleanOutputHtml ? cleanHtml(patternPage, {indent_size: 2}) : patternPage;
    var cleanedPatternPartialCode = config.cleanOutputHtml ? cleanHtml(pattern.patternPartialCode, {indent_size: 2}) : pattern.patternPartialCode;
    var cleanedPatternTemplateCode = config.cleanOutputHtml ? cleanHtml(pattern.template, {indent_size: 2}) : pattern.template;

    fs.outputFileSync(paths.public.patterns + pattern.getPatternLink(patternlab, 'rendered'), cleanedPatternPage);

    //write the mustache file too
    fs.outputFileSync(paths.public.patterns + pattern.getPatternLink(patternlab, 'rawTemplate'), cleanedPatternTemplateCode);

    //write the encoded version too
    fs.outputFileSync(paths.public.patterns + pattern.getPatternLink(patternlab, 'markupOnly'), cleanedPatternPartialCode);

    patternlab.events.emit('patternlab-pattern-write-end', patternlab, pattern);
    pattern.compileState = CompileState.CLEAN;
    return true;
  }

  return {
    version: function () {
      return getVersion();
    },
    build: function (callback, deletePatternDir) {
      if (patternlab && patternlab.isBusy) {
        console.log('Pattern Lab is busy building a previous run - returning early.');
        return;
      }
      patternlab.isBusy = true;
      buildPatterns(deletePatternDir);
      new ui().buildFrontend(patternlab);
      printDebug();
      patternlab.isBusy = false;
      callback();
    },
    help: function () {
      help();
    },
    patternsonly: function (callback, deletePatternDir) {
      if (patternlab && patternlab.isBusy) {
        console.log('Pattern Lab is busy building a previous run - returning early.');
        return;
      }
      patternlab.isBusy = true;
      buildPatterns(deletePatternDir);
      printDebug();
      patternlab.isBusy = false;
      callback();
    },
    liststarterkits: function () {
      return listStarterkits();
    },
    loadstarterkit: function (starterkitName, clean) {
      loadStarterKit(starterkitName, clean);
    }
  };
};

// export these free functions so they're available without calling the exported
// function, for use in reducing code dupe in unit tests. At least, until we
// have a better way to do this
patternlab_engine.build_pattern_data = buildPatternData;
patternlab_engine.process_all_patterns_iterative = processAllPatternsIterative;
patternlab_engine.process_all_patterns_recursive = processAllPatternsRecursive;

module.exports = patternlab_engine;
