/*
 * patternlab-node - v1.2.0 - 2016
 *
 * Brian Muenzenmeyer, Geoffrey Pursell, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

"use strict";

var path = require('path');
var fs = require('fs-extra');
var of = require('./object_factory');


// PRIVATE FUNCTIONS

function addToPatternPaths(patternlab, patternTypeName, pattern) {
  //this is messy, could use a refactor.
  patternlab.patternPaths[patternTypeName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.fileName;
}

//todo: refactor this as a method on the pattern object itself once we merge dev with pattern-engines branch
function isPatternExcluded(pattern) {
  // returns whether or not the first character of the pattern filename is an underscore, or excluded
  return pattern.fileName.charAt(0) === '_';
}

// Returns the array of patterns to be rendered in the styleguide view and
// linked to in the pattern navigation. Checks if patterns are excluded.
function assembleStyleguidePatterns(patternlab) {
  var styleguideExcludes = patternlab.config.styleGuideExcludes;
  var styleguidePatterns = [];

  if (styleguideExcludes && styleguideExcludes.length) {
    for (var i = 0; i < patternlab.patterns.length; i++) {

      // skip underscore-prefixed files
      if (isPatternExcluded(patternlab.patterns[i])) {
        if (patternlab.config.debug) {
          console.log('Omitting ' + patternlab.patterns[i].key + " from styleguide pattern exclusion.");
        }
        continue;
      }

      var key = patternlab.patterns[i].key;
      var typeKey = key.substring(0, key.indexOf('-'));
      var isExcluded = (styleguideExcludes.indexOf(typeKey) > -1);
      if (!isExcluded) {
        styleguidePatterns.push(patternlab.patterns[i]);
      }
    }
  } else {
    styleguidePatterns = patternlab.patterns;
  }

  return styleguidePatterns;
}

function buildNavigation(patternlab) {
  for (var i = 0; i < patternlab.patterns.length; i++) {

    var pattern = patternlab.patterns[i];
    //todo: check if this is already available
    var patternTypeName = pattern.name.replace(/\\/g, '-').split('-')[1];

    // skip underscore-prefixed files. don't create a patternType on account of an underscored pattern
    if (isPatternExcluded(pattern)) {
      continue;
    }

    var patternSubTypeName;
    var patternSubTypeItemName;
    var flatPatternItem;
    var patternSubType;
    var patternSubTypeItem;
    var viewAllPatternSubTypeItem;

    //get the patternSubType.
    //if there is one or more slashes in the subdir, get everything after
    //the last slash. if no slash, get the whole subdir string and strip
    //any numeric + hyphen prefix
    patternSubTypeName = pattern.subdir.split('/').pop().replace(/^\d*\-/, '');

    //get the patternSubTypeItem
    patternSubTypeItemName = pattern.patternName.replace(/-/g, ' ');

    //assume the patternSubTypeItem does not exist.
    patternSubTypeItem = new of.oPatternSubTypeItem(patternSubTypeItemName);
    patternSubTypeItem.patternPath = pattern.patternLink;
    //todo: isnt this just the pattern.key?
    patternSubTypeItem.patternPartial = patternTypeName + "-" + pattern.patternName; //add the hyphenated name

    //check if the patternType already exists
    var patternTypeIndex = patternlab.patternTypeIndex.indexOf(patternTypeName);
    if (patternTypeIndex === -1) {
      //add the patternType
      var patternType = new of.oPatternType(patternTypeName);

      //add patternPath and viewAllPath
      patternlab.patternPaths[patternTypeName] = {};
      patternlab.viewAllPaths[patternTypeName] = {};

      //test whether the pattern structure is flat or not - usually due to a template or page
      flatPatternItem = patternSubTypeName === patternTypeName;

      //assume the patternSubType does not exist.
      patternSubType = new of.oPatternSubType(patternSubTypeName);

      //add the patternState if it exists
      if (pattern.patternState) {
        patternSubTypeItem.patternState = pattern.patternState;
      }

      //if it is flat - we should not add the pattern to patternPaths
      if (flatPatternItem) {

        patternType.patternItems.push(patternSubTypeItem);

        //add to patternPaths
        addToPatternPaths(patternlab, patternTypeName, pattern);

      } else {

        patternType.patternTypeItems.push(patternSubType);
        patternType.patternTypeItemsIndex.push(patternSubTypeName);
        patternSubType.patternSubtypeItems.push(patternSubTypeItem);
        patternSubType.patternSubtypeItemsIndex.push(patternSubTypeItemName);

        //add to patternPaths
        addToPatternPaths(patternlab, patternTypeName, pattern);

        //add the view all PatternSubTypeItem
        viewAllPatternSubTypeItem = new of.oPatternSubTypeItem("View All");
        viewAllPatternSubTypeItem.patternPath = pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length) + "/index.html";
        viewAllPatternSubTypeItem.patternPartial = "viewall-" + pattern.patternGroup;

        patternType.patternItems.push(viewAllPatternSubTypeItem);
        patternlab.viewAllPaths[patternTypeName].viewall = pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length);

      }

      //add the patternType.
      patternlab.patternTypes.push(patternType);
      patternlab.patternTypeIndex.push(patternTypeName);

      //done

    } else {
      //find the patternType
      patternType = patternlab.patternTypes[patternTypeIndex];

      //add the patternState if it exists
      if (pattern.patternState) {
        patternSubTypeItem.patternState = pattern.patternState;
      }

      //test whether the pattern structure is flat or not - usually due to a template or page
      flatPatternItem = patternSubTypeName === patternTypeName;

      //if it is flat - we should not add the pattern to patternPaths
      if (flatPatternItem) {
        //add the patternSubType to patternItems
        patternType.patternItems.push(patternSubTypeItem);

        //add to patternPaths
        addToPatternPaths(patternlab, patternTypeName, pattern);

      } else {

        // only do this if pattern is included
        //check to see if patternSubType exists
        var patternTypeItemsIndex = patternType.patternTypeItemsIndex.indexOf(patternSubTypeName);
        if (patternTypeItemsIndex === -1) {
          patternSubType = new of.oPatternSubType(patternSubTypeName);

          //add the patternSubType and patternSubTypeItem
          patternSubType.patternSubtypeItems.push(patternSubTypeItem);
          patternSubType.patternSubtypeItemsIndex.push(patternSubTypeItemName);
          patternType.patternTypeItems.push(patternSubType);
          patternType.patternTypeItemsIndex.push(patternSubTypeName);

        } else {
          //add the patternSubTypeItem
          patternSubType = patternType.patternTypeItems[patternTypeItemsIndex];
          patternSubType.patternSubtypeItems.push(patternSubTypeItem);
          patternSubType.patternSubtypeItemsIndex.push(patternSubTypeItemName);
        }

        //check if we are moving to a new subgroup in the next loop
        if (!patternlab.patterns[i + 1] || pattern.patternSubGroup !== patternlab.patterns[i + 1].patternSubGroup) {

          //add the viewall SubTypeItem
          var viewAllPatternSubTypeItem = new of.oPatternSubTypeItem("View All");
          viewAllPatternSubTypeItem.patternPath = pattern.flatPatternPath + "/index.html";
          viewAllPatternSubTypeItem.patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup;

          patternSubType.patternSubtypeItems.push(viewAllPatternSubTypeItem);
          patternSubType.patternSubtypeItemsIndex.push("View All");
        }

        // just add to patternPaths
        addToPatternPaths(patternlab, patternTypeName, pattern);
      }
    }

    patternlab.viewAllPaths[patternTypeName][pattern.patternSubGroup] = pattern.flatPatternPath;
  }
  return patternTypeIndex;
}

function buildViewAllPages(mainPageHead, mainPageFoot, mainPageHeadHtml, mainPageFootHtml, pattern_assembler, patternlab) {
  var paths = patternlab.config.paths;
  var prevSubdir = '';
  var prevGroup = '';
  var i;

  for (i = 0; i < patternlab.patterns.length; i++) {
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

      var viewAllPatterns = [];
      var patternPartial = "viewall-" + pattern.patternGroup;
      var j;

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

    //create the view all for the subsection
    // check if the current sub section is different from the previous one
    if (pattern.subdir !== prevSubdir) {
      prevSubdir = pattern.subdir;

      viewAllPatterns = [];
      patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup;

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
  }
}

function sortPatterns(patternsArray) {
  return patternsArray.sort(function (a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }

    // a must be equal to b
    return 0;
  });
}


// MAIN BUILDER FUNCTION

function buildFrontEnd(patternlab) {
  var pa = require('./pattern_assembler');
  var mh = require('./media_hunter');
  var pattern_assembler = new pa();
  var media_hunter = new mh();
  var styleguidePatterns = [];
  var paths = patternlab.config.paths;

  patternlab.patternTypes = [];
  patternlab.patternTypeIndex = [];
  patternlab.patternPaths = {};
  patternlab.viewAllPaths = {};

  //sort all patterns explicitly.
  patternlab.patterns = sortPatterns(patternlab.patterns);

  //find mediaQueries
  media_hunter.find_media_queries('./source/css', patternlab);

  // check if patterns are excluded, if not add them to styleguidePatterns
  styleguidePatterns = assembleStyleguidePatterns(patternlab);

  //also add the cachebuster value. slight chance this could collide with a user that has defined cacheBuster as a value
  patternlab.data.cacheBuster = patternlab.cacheBuster;

  //get the main page head and foot and render them
  var mainPageHead = patternlab.userHead.extendedTemplate.replace('{% pattern-lab-head %}', patternlab.header);
  var mainPageHeadHtml = pattern_assembler.renderPattern(mainPageHead, patternlab.data);
  var mainPageFoot = patternlab.userFoot.extendedTemplate.replace('{% pattern-lab-foot %}', patternlab.footer);
  var mainPageFootHtml = pattern_assembler.renderPattern(mainPageFoot, patternlab.data);

  //build the styleguide
  var styleguideTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/styleguide.mustache'), 'utf8');
  var styleguideHtml = pattern_assembler.renderPattern(styleguideTemplate, {partials: styleguidePatterns, cacheBuster: patternlab.cacheBuster});

  fs.outputFileSync(path.resolve(paths.public.styleguide, 'html/styleguide.html'), mainPageHeadHtml + styleguideHtml + mainPageFootHtml);

  //build the viewall pages
  buildViewAllPages(mainPageHead, mainPageFoot, mainPageHeadHtml, mainPageFootHtml, pattern_assembler, patternlab);

  //build the patternlab website
  var patternlabSiteTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/index.mustache'), 'utf8');

  //loop through all patterns.to build the navigation
  //todo: refactor this someday
  //GTP: totally doing that right now
  buildNavigation(patternlab);

  //the patternlab site requires a lot of partials to be rendered!

  //patternNav
  //TODO: this file was moved to client side hogam rendering
  //var patternNavTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/patternNav.mustache'), 'utf8');
  //var patternNavPartialHtml = pattern_assembler.renderPattern(patternNavTemplate, patternlab);

  //ishControls
  //TODO: this file was moved to client side hogan rendering
  //var ishControlsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/ishControls.mustache'), 'utf8');
  //patternlab.config.mqs = patternlab.mediaQueries;
  //var ishControlsPartialHtml = pattern_assembler.renderPattern(ishControlsTemplate, patternlab.config);

  //TODO: write these two things to patternlab-data.js ala https://github.com/pattern-lab/patternlab-php-core/blob/c2c4bc6a8bda2b2f9c08b197669ebc94c025e7c6/src/PatternLab/Builder.php#L199
  //patternPaths
  //var patternPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/patternPaths.mustache'), 'utf8');
  //var patternPathsPartialHtml = pattern_assembler.renderPattern(patternPathsTemplate, {'patternPaths': JSON.stringify(patternlab.patternPaths)});

  //viewAllPaths
  //var viewAllPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/viewAllPaths.mustache'), 'utf8');
  //var viewAllPathsPartialHtml = pattern_assembler.renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

  //render the patternlab template, with all partials
  var patternlabSiteHtml = pattern_assembler.renderPattern(patternlabSiteTemplate, {
    defaultPattern: patternlab.config.defaultPattern || 'all',
    cacheBuster: patternlab.cacheBuster
  });
  fs.outputFileSync(path.resolve(paths.public.root, 'index.html'), patternlabSiteHtml);

  //write out the data
  var output = '';
  //config
  output += 'var config = ' + JSON.stringify(patternlab.config) + ';';

  //ishControls
  output += 'var ishControls = ' + JSON.stringify(patternlab.config.ishControlsHide) + ';';
  //todo add media queries to this

  //navItems
  output += 'var navItems = ' + JSON.stringify(patternlab.patternTypes) + ';';

  //patternPaths
  output += 'var patternPaths = ' + JSON.stringify(patternlab.patternPaths) + ';';

  //viewAllPaths
  output += 'var viewAllPaths = ' + JSON.stringify(patternlab.viewAllPaths) + ';';

  //plugins someday
  //TODO
  fs.outputFileSync(path.resolve(paths.public.data, 'patternlab-data.js'), output);
}

module.exports = buildFrontEnd;
