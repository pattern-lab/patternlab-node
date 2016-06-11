/*
 * patternlab-node - v2.0.0 - 2016
 *
 * Brian Muenzenmeyer, Geoff Pursell, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

"use strict";

var diveSync = require('diveSync'),
  path = require('path');

// GTP: these two diveSync pattern processors factored out so they can be reused
// from unit tests to reduce code dupe!

function processAllPatternsIterative(pattern_assembler, patterns_dir, patternlab) {
  diveSync(
    patterns_dir,
    {
      filter: function (thisPath, dir) {
        if (dir) {
          var remainingPath = thisPath.replace(patterns_dir, '');
          var isValidPath = remainingPath.indexOf('/_') === -1;
          return isValidPath;
        }
        return true;
      }
    },
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
    {
      filter: function (thisPath, dir) {
        if (dir) {
          var remainingPath = thisPath.replace(patterns_dir, '');
          var isValidPath = remainingPath.indexOf('/_') === -1;
          return isValidPath;
        }
        return true;
      }
    },
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

var patternlab_engine = function (config) {
  'use strict';

  var JSON5 = require('json5'),
    fs = require('fs-extra'),
    pa = require('./pattern_assembler'),
    pe = require('./pattern_exporter'),
    lh = require('./lineage_hunter'),
    buildFrontEnd = require('./ui_builder'),
    he = require('html-entities').AllHtmlEntities,
    plutils = require('./utilities'),
    sm = require('./starterkit_manager'),
    patternlab = {};

  patternlab.package = fs.readJSONSync(path.resolve(__dirname, '../../package.json'));
  patternlab.config = config || fs.readJSONSync(path.resolve(__dirname, '../../patternlab-config.json'));

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
    console.log('   > Load a starterkit into config.paths.soource/*');
    console.log('   > NOTE: This does overwrite any existing contents, and does not clean the directory first.');
    console.log('   > NOTE: In most cases, `npm install starterkit-name` will precede this call.');
    console.log('   > arguments:');
    console.log('      -- kit ');
    console.log('      > the name of the starter kit to load');
    console.log('   > example (gulp):');
    console.log('    `gulp patternlab:starterkit-load --kit=starterkit-mustache-demo`');
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
      if (key === 'engine' && value.engineName) {
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
    var starterkit_manager = new sm(patternlab);
    return starterkit_manager.list_starterkits();
  }

  function loadStarterKit(starterkitName) {
    var starterkit_manager = new sm(patternlab);
    starterkit_manager.load_starterkit(starterkitName);
  }

  function buildPatterns(deletePatternDir) {
    try {
      patternlab.data = fs.readJSONSync(path.resolve(paths.source.data, 'data.json'));
    } catch (ex) {
      console.log('missing ' + paths.source.data + 'data.json  Pattern Lab may not work without this file.');
      patternlab.data = {};
    }
    try {
      patternlab.listitems = fs.readJSONSync(path.resolve(paths.source.data, 'listitems.json'));
    } catch (ex) {
      console.log('missing ' + paths.source.data + 'listitems.json  Pattern Lab may not work without this file.');
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
      console.log('\nERROR: missing an essential file from ' + paths.source.patternlabFiles + '. Pattern Lab won\'t work without this file.\n');
      process.exit(1);
    }
    patternlab.patterns = [];
    patternlab.partials = {};
    patternlab.data.link = {};

    setCacheBust();

    var pattern_assembler = new pa(),
      entity_encoder = new he(),
      pattern_exporter = new pe(),
      lineage_hunter = new lh(),
      patterns_dir = paths.source.patterns;

    pattern_assembler.combine_listItems(patternlab);

    // diveSync once to perform iterative populating of patternlab object
    processAllPatternsIterative(pattern_assembler, patterns_dir, patternlab);

    //diveSync again to recursively include partials, filling out the
    //extendedTemplate property of the patternlab.patterns elements
    processAllPatternsRecursive(pattern_assembler, patterns_dir, patternlab);

    //set user defined head and foot if they exist
    try {
      patternlab.userHead = fs.readFileSync(path.resolve(paths.source.meta, '_00-head.mustache'), 'utf8');
    }
    catch (ex) {
      if (patternlab.config.debug) {
        console.log(ex);
        console.log('Could not find optional user-defined header, usually found at ./source/_meta/_00-head.mustache. It was likely deleted.');
      }
    }
    try {
      patternlab.userFoot = fs.readFileSync(path.resolve(paths.source.meta, '_01-foot.mustache'), 'utf8');
    }
    catch (ex) {
      if (patternlab.config.debug) {
        console.log(ex);
        console.log('Could not find optional user-defined footer, usually found at ./source/_meta/_01-foot.mustache. It was likely deleted.');
      }
    }

    //now that all the main patterns are known, look for any links that might be within data and expand them
    //we need to do this before expanding patterns & partials into extendedTemplates, otherwise we could lose the data -> partial reference
    pattern_assembler.parse_data_links(patternlab);

    //cascade any patternStates
    lineage_hunter.cascade_pattern_states(patternlab);

    //delete the contents of config.patterns.public before writing
    if (deletePatternDir) {
      fs.emptyDirSync(paths.public.patterns);
    }

    //set pattern-specific header if necessary
    var head;
    if (patternlab.userHead) {
      head = patternlab.userHead.replace('{% pattern-lab-head %}', patternlab.header);
    } else {
      head = patternlab.header;
    }

    //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
    patternlab.data.patternLabHead = pattern_assembler.renderPattern(patternlab.header, {
      cacheBuster: patternlab.cacheBuster
    });

    //render all patterns last, so lineageR works
    patternlab.patterns.forEach(function (pattern) {

      pattern.header = head;

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

      //var headHTML = pattern_assembler.renderPattern(patternlab.userHead, allData);
      var headHTML = pattern_assembler.renderPattern(pattern.header, allData);

      //render the extendedTemplate with all data
      pattern.patternPartialCode = pattern_assembler.renderPattern(pattern, allData);

      //todo see if this is still needed
      pattern.patternPartialCodeE = entity_encoder.encode(pattern.patternPartialCode);

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
        patternBreadcrumb: pattern.patternGroup === pattern.patternSubGroup ? pattern.patternGroup : pattern.patternGroup + ' > ' + pattern.patternSubGroup,
        patternExtension: pattern.fileExtension,
        patternName: pattern.patternName,
        patternPartial: pattern.patternPartial,
        patternState: pattern.patternState,
        extraOutput: {}
      });

      //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
      var footerPartial = pattern_assembler.renderPattern(patternlab.footer, {
        isPattern: true,
        patternData: pattern.patternData,
        cacheBuster: patternlab.cacheBuster
      });

      var footerHTML = pattern_assembler.renderPattern(patternlab.userFoot, {
        patternLabFoot : footerPartial
      });

      //write the compiled template to the public patterns directory
      var patternPage = headHTML + pattern.patternPartialCode + footerHTML;
      fs.outputFileSync(paths.public.patterns + pattern.patternLink, patternPage);

      //write the mustache file too
      fs.outputFileSync(paths.public.patterns + pattern.patternLink.replace('.html', pattern.fileExtension), pattern.template);

      //write the encoded version too
      fs.outputFileSync(paths.public.patterns + pattern.patternLink.replace('.html', '.markup-only.html'), pattern.patternPartialCode);
    });

    //export patterns if necessary
    pattern_exporter.export_patterns(patternlab);
  }

  return {
    version: function () {
      return getVersion();
    },
    build: function (deletePatternDir) {
      buildPatterns(deletePatternDir);
      buildFrontEnd(patternlab);
      printDebug();
    },
    help: function () {
      help();
    },
    patternsonly: function (deletePatternDir) {
      buildPatterns(deletePatternDir);
      printDebug();
    },
    liststarterkits: function () {
      return listStarterkits();
    },
    loadstarterkit: function (starterkitName) {
      loadStarterKit(starterkitName);
    }
  };
};

// export these free functions so they're available without calling the exported
// function, for use in reducing code dupe in unit tests. At least, until we
// have a better way to do this
patternlab_engine.process_all_patterns_iterative = processAllPatternsIterative;
patternlab_engine.process_all_patterns_recursive = processAllPatternsRecursive;

module.exports = patternlab_engine;
