/* 
 * patternlab-node - v1.2.1 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

var patternlab_engine = function (config) {
  'use strict';

  var path = require('path'),
    JSON5 = require('json5'),
    fs = require('fs-extra'),
    diveSync = require('diveSync'),
    of = require('./object_factory'),
    pa = require('./pattern_assembler'),
    lh = require('./lineage_hunter'),
    lih = require('./list_item_hunter'),
    mh = require('./media_hunter'),
    pe = require('./pattern_exporter'),
    patternlab = {};

  patternlab.package = fs.readJSONSync('./package.json');
  patternlab.config = config || fs.readJSONSync(path.resolve(__dirname, '../../patternlab-config.json'));

  var paths = patternlab.config.paths;


  function getVersion() {
    console.log(patternlab.package.version);
  }

  function help() {
    console.log('Patternlab Node Help');
    console.log('===============================');
    console.log('Command Line Arguments');
    console.log('patternlab:only_patterns');
    console.log(' > Compiles the patterns only, outputting to config.patterns.public');
    console.log('patternlab:v');
    console.log(' > Retrieve the version of patternlab-node you have installed');
    console.log('patternlab:help');
    console.log(' > Get more information about patternlab-node, pattern lab in general, and where to report issues.');
    console.log('===============================');
    console.log('Visit http://patternlab.io/docs/index.html for general help on pattern-lab');
    console.log('Visit https://github.com/pattern-lab/patternlab-node/issues to open a bug.');
  }

  function printDebug() {
    //debug file can be written by setting flag on patternlab-config.json
    if (patternlab.config.debug) {
      console.log('writing patternlab debug file to ./patternlab.json');
      fs.outputFileSync('./patternlab.json', JSON.stringify(patternlab, null, 3));
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

  function buildPatterns(deletePatternDir) {
    patternlab.data = fs.readJSONSync(path.resolve(paths.source.data, 'data.json'));
    patternlab.listitems = fs.readJSONSync(path.resolve(paths.source.data, 'listitems.json'));
    patternlab.header = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/pattern-header-footer/header.html'), 'utf8');
    patternlab.footerPattern = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/pattern-header-footer/footer-pattern.html'), 'utf8');
    patternlab.footer = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/pattern-header-footer/footer.html'), 'utf8');
    patternlab.patterns = [];
    patternlab.data.link = {};

    setCacheBust();

    //also add the cachebuster value. slight chance this could collide with a user that has defined cacheBuster as a value
    patternlab.data.cacheBuster = patternlab.cacheBuster;

    var pattern_assembler = new pa(),
      list_item_hunter = new lih(),
      pattern_exporter = new pe(),
      lineage_hunter = new lh(),
      patterns_dir = paths.source.patterns;

    patternlab.dataKeys = pattern_assembler.get_data_keys(patternlab.data, []);
    patternlab.dataKeys = patternlab.dataKeys.concat(list_item_hunter.get_list_item_iteration_keys());
    patternlab.dataKeys = patternlab.dataKeys.concat(pattern_assembler.get_data_keys(patternlab.listitems, []));

    //diveSync once to perform iterative populating of patternlab object
    diveSync(
      patterns_dir,
      function (err, file) {
        //log any errors
        if (err) {
          console.log(err);
          return;
        }
        pattern_assembler.process_pattern_iterative(path.resolve(file), patternlab);
      }
    );

    patternlab.data = pattern_assembler.parse_data_links_helper(patternlab, patternlab.data, 'data.json');

    //set user defined head and foot if they exist
    var userHeader;
    try {
      userHeader = pattern_assembler.get_pattern_by_key('atoms-head', patternlab);
      patternlab.userHead = JSON.parse(JSON.stringify(userHeader));
    }
    catch (ex) {
      if (patternlab.config.debug) {
        console.log(ex);
        console.log('Could not find optional user-defined header, atoms-head  pattern. It was likely deleted.');
      }
    }

    if (patternlab.userHead) {
      patternlab.userHead.extendedTemplate = patternlab.userHead.template.replace('{% pattern-lab-head %}', patternlab.header);
    } else {
      patternlab.userHead = {
        template: patternlab.header,
        extendedTemplate: patternlab.header
      };
    }

    var userFooter;
    try {
      userFooter = pattern_assembler.get_pattern_by_key('atoms-foot', patternlab);
      patternlab.userFoot = JSON.parse(JSON.stringify(userFooter));
    }
    catch (ex) {
      if (patternlab.config.debug) {
        console.log(ex);
        console.log('Could not find optional user-defined footer, atoms-foot pattern. It was likely deleted.');
      }
    }

    if (patternlab.userFoot) {
      patternlab.userFoot.extendedTemplate = patternlab.userFoot.template.replace('{% pattern-lab-foot %}', patternlab.footerPattern + patternlab.footer);
    } else {
      patternlab.userFoot = {
        template: patternlab.footerPattern,
        extendedTemplate: patternlab.footerPattern
      };
    }

    //cascade any patternStates
    lineage_hunter.cascade_pattern_states(patternlab);

    //delete the contents of config.patterns.public before writing
    if (deletePatternDir) {
      fs.emptyDirSync(paths.public.patterns);
    }

    //diveSync again to recursively include partials, filling out the
    //extendedTemplate property of the patternlab.patterns elements
    diveSync(
      patterns_dir,
      function (err, file) {
        //log any errors
        if (err) {
          console.log(err);
          return;
        }
        pattern_assembler.process_pattern_recursive(path.resolve(file), patternlab);
      }
    );

    //export patterns if necessary
    pattern_exporter.export_patterns(patternlab);
  }

  function addToPatternPaths(bucketName, pattern) {
    //this is messy, could use a refactor.
    patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.fileName;
  }

  //todo: refactor this as a method on the pattern object itself once we merge dev with pattern-engines branch
  function isPatternExcluded(pattern) {
    // returns whether or not the first character of the pattern filename is an underscore, or excluded
    return pattern.fileName.charAt(0) === '_';
  }

  function buildFrontEnd() {
    var pattern_assembler = new pa(),
      media_hunter = new mh(),
      styleGuideExcludes = patternlab.config.styleGuideExcludes,
      styleguidePatterns = [],
      i; // for loops

    patternlab.buckets = [];
    patternlab.bucketIndex = [];
    patternlab.patternPaths = {};
    patternlab.viewAllPaths = {};

    //sort all patterns explicitly.
    patternlab.patterns = patternlab.patterns.sort(function (a, b) {
      if (a.name > b.name) { return 1; }
      if (a.name < b.name) { return -1; }

      // a must be equal to b
      return 0;
    });

    //find mediaQueries
    media_hunter.find_media_queries('./source/css', patternlab);

    // check if patterns are excluded, if not add them to styleguidePatterns
    if (styleGuideExcludes && styleGuideExcludes.length) {
      for (i = 0; i < patternlab.patterns.length; i++) {

        // skip underscore-prefixed files
        if (isPatternExcluded(patternlab.patterns[i])) {
          if (patternlab.config.debug) {
            console.log('Omitting ' + patternlab.patterns[i].key + " from styleguide pattern exclusion.");
          }
          continue;
        }

        var key = patternlab.patterns[i].key;
        var typeKey = key.substring(0, key.indexOf('-'));
        var isExcluded = (styleGuideExcludes.indexOf(typeKey) > -1);
        if (!isExcluded) {
          styleguidePatterns.push(patternlab.patterns[i]);
        }
      }
    } else {
      styleguidePatterns = patternlab.patterns;
    }

    //get the main page head and foot
    var mainPageHead = patternlab.userHead.template.replace('{% pattern-lab-head %}', patternlab.header);
    var mainPageHeadHtml = pattern_assembler.renderPattern(mainPageHead, patternlab.data);
    var mainPageFoot = patternlab.userFoot.template.replace('{% pattern-lab-foot %}', patternlab.footer);
    var mainPageFootHtml = pattern_assembler.renderPattern(mainPageFoot, patternlab.data);

    //build the styleguide
    var styleguideTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/styleguide.mustache'), 'utf8'),
      styleguideHtml = pattern_assembler.renderPattern(styleguideTemplate, {partials: styleguidePatterns, cacheBuster: patternlab.cacheBuster});

    fs.outputFileSync(path.resolve(paths.public.styleguide, 'html/styleguide.html'), mainPageHeadHtml + styleguideHtml + mainPageFootHtml);

    //unset styleguidePatterns
    styleguidePatterns = [];

    //build the viewall pages
    var prevSubdir = '',
      prevGroup = '';

    for (i = 0; i < patternlab.patterns.length; i++) {

      //unset escapedTemplates
      patternlab.patterns[i].escapedTemplate = '';

      // skip underscore-prefixed files
      if (isPatternExcluded(patternlab.patterns[i])) {
        if (patternlab.config.debug) {
          console.log('Omitting ' + patternlab.patterns[i].key + " from view all rendering.");
        }
        continue;
      }

      var pattern = patternlab.patterns[i];

      //create the view all for the section
      // check if the current section is different from the previous one
      if (pattern.patternGroup !== prevGroup) {
        prevGroup = pattern.patternGroup;

        var viewAllPatterns = [],
          patternPartial = "viewall-" + pattern.patternGroup,
          j;

        for (j = 0; j < patternlab.patterns.length; j++) {
          if (patternlab.patterns[j].patternGroup === pattern.patternGroup) {
            //again, skip any sibling patterns to the current one that may have underscores
            if (isPatternExcluded(patternlab.patterns[j])) {
              if (patternlab.config.debug) {
                console.log('Omitting ' + patternlab.patterns[j].key + " from view all sibling rendering.");
              }
              continue;
            }

            viewAllPatterns.push(patternlab.patterns[j]);
          }
        }

        var viewAllTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/viewall.mustache'), 'utf8');
        var viewAllHtml = pattern_assembler.renderPattern(viewAllTemplate, {partials: viewAllPatterns, patternPartial: patternPartial, cacheBuster: patternlab.cacheBuster });
        fs.outputFileSync(paths.public.patterns + pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length) + '/index.html', mainPageHead + viewAllHtml + mainPageFoot);
      }

      // create the view all for the subsection
      // check if the current sub section is different from the previous one
      if (pattern.subdir !== prevSubdir) {
        prevSubdir = pattern.subdir;

        var viewAllPatterns = [],
          patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup,
          j;

        for (j = 0; j < patternlab.patterns.length; j++) {
          if (patternlab.patterns[j].subdir === pattern.subdir) {
            //again, skip any sibling patterns to the current one that may have underscores
            if (isPatternExcluded(patternlab.patterns[j])) {
              if (patternlab.config.debug) {
                console.log('Omitting ' + patternlab.patterns[j].key + " from view all sibling rendering.");
              }
              continue;
            }
            viewAllPatterns.push(patternlab.patterns[j]);
          }
        }

        var viewAllTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/viewall.mustache'), 'utf8');
        var viewAllHtml = pattern_assembler.renderPattern(viewAllTemplate, {partials: viewAllPatterns, patternPartial: patternPartial, cacheBuster: patternlab.cacheBuster});
        fs.outputFileSync(paths.public.patterns + pattern.flatPatternPath + '/index.html', mainPageHeadHtml + viewAllHtml + mainPageFootHtml);
      }

      //unset viewAllPatterns
      viewAllPatterns = [];
    }

    //build the patternlab website
    var patternlabSiteTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/index.mustache'), 'utf8');

    //loop through all patterns.to build the navigation
    //todo: refactor this someday
    for (i = 0; i < patternlab.patterns.length; i++) {

      var pattern = patternlab.patterns[i];

      //unset all pattern.patternPartials here since they take up a lot of memory
      //and we won't be needing them again
      pattern.patternPartial = '';

      var bucketName = pattern.name.replace(/\\/g, '-').split('-')[1];

      //check if the bucket already exists
      var bucketIndex = patternlab.bucketIndex.indexOf(bucketName);
      if (bucketIndex === -1) {

        // skip underscore-prefixed files. don't create a bucket on account of an underscored pattern
        if (isPatternExcluded(pattern)) {
          continue;
        }

        //add the bucket
        var bucket = new of.oBucket(bucketName);

        //add patternPath and viewAllPath
        patternlab.patternPaths[bucketName] = {};
        patternlab.viewAllPaths[bucketName] = {};

        //get the navItem
        var navItemName = pattern.subdir.split('/').pop();
        navItemName = navItemName.replace(/(\d).(-)/g, '');

        //get the navSubItem
        var navSubItemName = pattern.patternName.replace(/-/g, ' ');

        //test whether the pattern struture is flat or not - usually due to a template or page
        var flatPatternItem = false;
        if (navItemName === bucketName) {
          flatPatternItem = true;
        }

        //assume the navItem does not exist.
        var navItem = new of.oNavItem(navItemName);

        //assume the navSubItem does not exist.
        var navSubItem = new of.oNavSubItem(navSubItemName);
        navSubItem.patternPath = pattern.patternLink;
        navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

        //add the patternState if it exists
        if (pattern.patternState) {
          navSubItem.patternState = pattern.patternState;
        }

        //if it is flat - we should not add the pattern to patternPaths
        if (flatPatternItem) {
          bucket.patternItems.push(navSubItem);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

        } else {
          bucket.navItems.push(navItem);
          bucket.navItemsIndex.push(navItemName);
          navItem.navSubItems.push(navSubItem);
          navItem.navSubItemsIndex.push(navSubItemName);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

          //add the navViewAllItem
          var navViewAllItem = new of.oNavSubItem("View All");
          navViewAllItem.patternPath = pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length) + "/index.html";
          navViewAllItem.patternPartial = "viewall-" + pattern.patternGroup;

          bucket.patternItems.push(navViewAllItem);
          patternlab.viewAllPaths[bucketName].viewall = pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length);
        }

        //add the bucket.
        patternlab.buckets.push(bucket);
        patternlab.bucketIndex.push(bucketName);

        //done

      } else {
        //find the bucket
        var bucket = patternlab.buckets[bucketIndex];

        //get the navItem
        //if there is one or more slashes in the subdir, get everything after
        //the last slash. if no slash, get the whole subdir string and strip
        //any numeric + hyphen prefix
        var navItemName = pattern.subdir.split('/').pop().replace(/^\d*\-/, '');

        //get the navSubItem
        var navSubItemName = pattern.patternName.replace(/-/g, ' ');

        //assume the navSubItem does not exist.
        var navSubItem = new of.oNavSubItem(navSubItemName);
        navSubItem.patternPath = pattern.patternLink;
        navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

        //add the patternState if it exists
        if (pattern.patternState) {
          navSubItem.patternState = pattern.patternState;
        }

        //test whether the pattern struture is flat or not - usually due to a template or page
        var flatPatternItem = false;
        if (navItemName === bucketName) {
          flatPatternItem = true;
        }

        //if it is flat - we should not add the pattern to patternPaths
        if (flatPatternItem) {

          // skip underscore-prefixed files
          if (isPatternExcluded(pattern)) {
            continue;
          }

          //add the navItem to patternItems
          bucket.patternItems.push(navSubItem);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

        } else {

          // only do this if pattern is included
          if (!isPatternExcluded(pattern)) {
            //check to see if navItem exists
            var navItemIndex = bucket.navItemsIndex.indexOf(navItemName);
            if (navItemIndex === -1) {
              var navItem = new of.oNavItem(navItemName);

              //add the navItem and navSubItem
              navItem.navSubItems.push(navSubItem);
              navItem.navSubItemsIndex.push(navSubItemName);
              bucket.navItems.push(navItem);
              bucket.navItemsIndex.push(navItemName);

            } else {
              //add the navSubItem
              var navItem = bucket.navItems[navItemIndex];
              navItem.navSubItems.push(navSubItem);
              navItem.navSubItemsIndex.push(navSubItemName);
            }
          }

          //check if we are moving to a new sub section in the next loop
          if (!patternlab.patterns[i + 1] || pattern.patternSubGroup !== patternlab.patterns[i + 1].patternSubGroup) {

            //add the navViewAllSubItem
            var navViewAllSubItem = new of.oNavSubItem("");
            navViewAllSubItem.patternName = "View All";
            navViewAllSubItem.patternPath = pattern.flatPatternPath + "/index.html";
            navViewAllSubItem.patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup;

            navItem.navSubItems.push(navViewAllSubItem);
            navItem.navSubItemsIndex.push("View All");
          }

          // just add to patternPaths
          addToPatternPaths(bucketName, pattern);
        }

      }

      patternlab.viewAllPaths[bucketName][pattern.patternSubGroup] = pattern.flatPatternPath;

    }

    //the patternlab site requires a lot of partials to be rendered.
    //patternNav
    var patternNavTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/patternNav.mustache'), 'utf8');
    var patternNavPartialHtml = pattern_assembler.renderPattern(patternNavTemplate, patternlab);

    //ishControls
    var ishControlsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/ishControls.mustache'), 'utf8');
    patternlab.config.mqs = patternlab.mediaQueries;
    var ishControlsPartialHtml = pattern_assembler.renderPattern(ishControlsTemplate, patternlab.config);

    //patternPaths
    var patternPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/patternPaths.mustache'), 'utf8');
    var patternPathsPartialHtml = pattern_assembler.renderPattern(patternPathsTemplate, {'patternPaths': JSON5.stringify(patternlab.patternPaths)});

    //viewAllPaths
    var viewAllPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/viewAllPaths.mustache'), 'utf8');
    var viewAllPathsPartialHtml = pattern_assembler.renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON5.stringify(patternlab.viewAllPaths)});

    //render the patternlab template, with all partials
    var patternlabSiteHtml = pattern_assembler.renderPattern(patternlabSiteTemplate, {
      defaultPattern: patternlab.config.defaultPattern || 'all',
      cacheBuster: patternlab.cacheBuster
    }, {
      'ishControls': ishControlsPartialHtml,
      'patternNav': patternNavPartialHtml,
      'patternPaths': patternPathsPartialHtml,
      'viewAllPaths': viewAllPathsPartialHtml
    });
    fs.outputFileSync(path.resolve(paths.public.root, 'index.html'), patternlabSiteHtml);
  }

  return {
    version: function () {
      return getVersion();
    },
    build: function (deletePatternDir) {
      buildPatterns(deletePatternDir);
      buildFrontEnd();
      printDebug();
    },
    help: function () {
      help();
    },
    build_patterns_only: function (deletePatternDir) {
      buildPatterns(deletePatternDir);
      printDebug();
    }
  };
};

module.exports = patternlab_engine;
