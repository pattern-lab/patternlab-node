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

// PRIVATE FUNCTIONS

function addToPatternPaths(patternlab, bucketName, pattern) {
  //this is messy, could use a refactor.
  patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.fileName;
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


// MAIN BUILDER FUNCTION

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

function buildFrontEnd(patternlab) {
  var pa = require('./pattern_assembler');
  var of = require('./object_factory');
  var mh = require('./media_hunter');
  var pattern_assembler = new pa();
  var media_hunter = new mh();
  var styleguidePatterns = [];
  var paths = patternlab.config.paths;
  var i;

  patternlab.buckets = [];
  patternlab.bucketIndex = [];
  patternlab.patternPaths = {};
  patternlab.viewAllPaths = {};

  //sort all patterns explicitly.
  patternlab.patterns = patternlab.patterns.sort(function (a, b) {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }

    // a must be equal to b
    return 0;
  });

  //find mediaQueries
  media_hunter.find_media_queries('./source/css', patternlab);

  // check if patterns are excluded, if not add them to styleguidePatterns
  styleguidePatterns = assembleStyleguidePatterns(patternlab);

  //also add the cachebuster value. slight chance this could collide with a user that has defined cacheBuster as a value
  patternlab.data.cacheBuster = patternlab.cacheBuster;

  //get the main page head and foot
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
  for (i = 0; i < patternlab.patterns.length; i++) {

    var pattern = patternlab.patterns[i];
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
        addToPatternPaths(patternlab, bucketName, pattern);

      } else {

        bucket.navItems.push(navItem);
        bucket.navItemsIndex.push(navItemName);
        navItem.navSubItems.push(navSubItem);
        navItem.navSubItemsIndex.push(navSubItemName);

        //add to patternPaths
        addToPatternPaths(patternlab, bucketName, pattern);

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
      bucket = patternlab.buckets[bucketIndex];

      //get the navItem
      //if there is one or more slashes in the subdir, get everything after
      //the last slash. if no slash, get the whole subdir string and strip
      //any numeric + hyphen prefix
      navItemName = pattern.subdir.split('/').pop().replace(/^\d*\-/, '');

      //get the navSubItem
      navSubItemName = pattern.patternName.replace(/-/g, ' ');

      //assume the navSubItem does not exist.
      navSubItem = new of.oNavSubItem(navSubItemName);
      navSubItem.patternPath = pattern.patternLink;
      navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

      //add the patternState if it exists
      if (pattern.patternState) {
        navSubItem.patternState = pattern.patternState;
      }

      //test whether the pattern struture is flat or not - usually due to a template or page
      flatPatternItem = false;
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
        addToPatternPaths(patternlab, bucketName, pattern);

      } else {

        // only do this if pattern is included
        if (!isPatternExcluded(pattern)) {
          //check to see if navItem exists
          var navItemIndex = bucket.navItemsIndex.indexOf(navItemName);
          if (navItemIndex === -1) {
            navItem = new of.oNavItem(navItemName);

            //add the navItem and navSubItem
            navItem.navSubItems.push(navSubItem);
            navItem.navSubItemsIndex.push(navSubItemName);
            bucket.navItems.push(navItem);
            bucket.navItemsIndex.push(navItemName);

          } else {
            //add the navSubItem
            navItem = bucket.navItems[navItemIndex];
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
        addToPatternPaths(patternlab, bucketName, pattern);
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
  var patternPathsPartialHtml = pattern_assembler.renderPattern(patternPathsTemplate, {'patternPaths': JSON.stringify(patternlab.patternPaths)});

  //viewAllPaths
  var viewAllPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'templates/partials/viewAllPaths.mustache'), 'utf8');
  var viewAllPathsPartialHtml = pattern_assembler.renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

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

module.exports = buildFrontEnd;
