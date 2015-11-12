/* 
 * patternlab-node - v0.15.0 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

var patternlab_engine = function () {
  'use strict';

  var path = require('path'),
  fs = require('fs-extra'),
  extend = require('util')._extend,
  diveSync = require('diveSync'),
  mustache = require('mustache'),
  glob = require('glob'),
  of = require('./object_factory'),
  pa = require('./pattern_assembler'),
  mh = require('./media_hunter'),
  pe = require('./pattern_exporter'),
  he = require('html-entities').AllHtmlEntities,
  patternlab = {};

  patternlab.package = fs.readJSONSync('./package.json');
  patternlab.config = fs.readJSONSync('./config.json');

  function getVersion() {
    console.log(patternlab.package.version);
  }

  function help(){
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
    //debug file can be written by setting flag on config.json
    if(patternlab.config.debug){
      console.log('writing patternlab debug file to ./patternlab.json');
      fs.outputFileSync('./patternlab.json', JSON.stringify(patternlab, null, 3));
    }
  }

  function buildPatterns(deletePatternDir){
    patternlab.data = fs.readJSONSync('./source/_data/data.json');
    patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
    patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
    patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
    patternlab.patterns = [];
    patternlab.partials = {};
    patternlab.data.link = {};

    var pattern_assembler = new pa(),
    entity_encoder = new he(),
    pattern_exporter = new pe(),
    patterns_dir = './source/_patterns';

    pattern_assembler.combine_listItems(patternlab);

    //diveSync once to perform iterative populating of patternlab object
    diveSync(patterns_dir, {
      filter: function(path, dir) {
        if(dir){
          var remainingPath = path.replace(patterns_dir, '');
          var isValidPath = remainingPath.indexOf('/_') === -1;
          return isValidPath;
        }
          return true;
        }
      },
      function(err, file){
        //log any errors
        if(err){
          console.log(err);
          return;
        }

        pattern_assembler.process_pattern_iterative(file.substring(2), patternlab);
    });

    //diveSync again to recursively include partials, filling out the
    //extendedTemplate property of the patternlab.patterns elements
    diveSync(patterns_dir, {
      filter: function(path, dir) {
        if(dir){
          var remainingPath = path.replace(patterns_dir, '');
          var isValidPath = remainingPath.indexOf('/_') === -1;
          return isValidPath;
        }
          return true;
        }
      },
      function(err, file){
        //log any errors
        if(err){
          console.log(err);
          return;
        }

        pattern_assembler.process_pattern_recursive(file.substring(2), patternlab);
    });

    //delete the contents of config.patterns.public before writing
    if(deletePatternDir){
      fs.emptyDirSync(patternlab.config.patterns.public);
    }

    //render all patterns last, so lineageR works
    patternlab.patterns.forEach(function(pattern, index, patterns){
      //render the pattern, but first consolidate any data we may have
      var allData =  JSON.parse(JSON.stringify(patternlab.data));
      allData = pattern_assembler.merge_data(allData, pattern.jsonFileData);

      pattern.patternPartial = pattern_assembler.renderPattern(pattern.extendedTemplate, allData);

      //add footer info before writing
      var patternFooter = pattern_assembler.renderPattern(patternlab.footer, pattern);

      //write the compiled template to the public patterns directory
      fs.outputFileSync(patternlab.config.patterns.public + pattern.patternLink, patternlab.header + pattern.patternPartial + patternFooter);

      //write the mustache file too
      fs.outputFileSync(patternlab.config.patterns.public + pattern.patternLink.replace('.html', '.mustache'), entity_encoder.encode(pattern.template));

      //write the encoded version too
      fs.outputFileSync(patternlab.config.patterns.public + pattern.patternLink.replace('.html', '.escaped.html'), entity_encoder.encode(pattern.patternPartial));
    });

    //export patterns if necessary
    pattern_exporter.export_patterns(patternlab);

  }

  function buildFrontEnd(){
    var pattern_assembler = new pa(),
        media_hunter = new mh(),
        styleGuideExcludes = patternlab.config.styleGuideExcludes,
        styleguidePatterns = [];
    patternlab.buckets = [];
    patternlab.bucketIndex = [];
    patternlab.patternPaths = {};
    patternlab.viewAllPaths = {};

    //find mediaQueries
    media_hunter.find_media_queries('./source/css', patternlab);

    // check if patterns are excluded, if not add them to styleguidePatterns
    if (styleGuideExcludes.length) {
        for (i = 0; i < patternlab.patterns.length; i++) {
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

    //build the styleguide
    var styleguideTemplate = fs.readFileSync('./source/_patternlab-files/styleguide.mustache', 'utf8'),
    styleguideHtml = pattern_assembler.renderPattern(styleguideTemplate, {partials: styleguidePatterns});
    fs.outputFileSync('./public/styleguide/html/styleguide.html', styleguideHtml);

    //build the viewall pages
    var prevSubdir = '',
    i;

    for (i = 0; i < patternlab.patterns.length; i++) {
      // skip underscore-prefixed files
      if (path.basename(patternlab.patterns[i].abspath).charAt(0) === '_') {
        continue;
      }

      var pattern = patternlab.patterns[i];

      // check if the current sub section is different from the previous one
      if (pattern.subdir !== prevSubdir) {
        prevSubdir = pattern.subdir;

        var viewAllPatterns = [],
        patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup,
        j;

        for (j = 0; j < patternlab.patterns.length; j++) {
          if (patternlab.patterns[j].subdir === pattern.subdir) {
            viewAllPatterns.push(patternlab.patterns[j]);
          }
        }

        var viewAllTemplate = fs.readFileSync('./source/_patternlab-files/viewall.mustache', 'utf8');
        var viewAllHtml = pattern_assembler.renderPattern(viewAllTemplate, {partials: viewAllPatterns, patternPartial: patternPartial});
        fs.outputFileSync(patternlab.config.patterns.public + pattern.flatPatternPath + '/index.html', viewAllHtml);
      }
    }

    //build the patternlab website
    var patternlabSiteTemplate = fs.readFileSync('./source/_patternlab-files/index.mustache', 'utf8');

    //loop through all patterns.to build the navigation
    //todo: refactor this someday
    for(var i = 0; i < patternlab.patterns.length; i++){
      // skip underscore-prefixed files
      if (path.basename(patternlab.patterns[i].abspath).charAt(0) === '_') {
        continue;
      }

      var pattern = patternlab.patterns[i];
      var bucketName = pattern.name.replace(/\\/g, '-').split('-')[1];

      //check if the bucket already exists
      var bucketIndex = patternlab.bucketIndex.indexOf(bucketName);
      if(bucketIndex === -1){
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
        if(navItemName === bucketName){
          flatPatternItem = true;
        }

        //assume the navItem does not exist.
        var navItem = new of.oNavItem(navItemName);

        //assume the navSubItem does not exist.
        var navSubItem = new of.oNavSubItem(navSubItemName);
        navSubItem.patternPath = pattern.patternLink;
        navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

        //add the patternState if it exists
        if(pattern.patternState){
          navSubItem.patternState = pattern.patternState;
        }

        //if it is flat - we should not add the pattern to patternPaths
        if(flatPatternItem){

          bucket.patternItems.push(navSubItem);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

        } else{

          bucket.navItems.push(navItem);
          bucket.navItemsIndex.push(navItemName);
          navItem.navSubItems.push(navSubItem);
          navItem.navSubItemsIndex.push(navSubItemName);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

        }

        //add the bucket.
        patternlab.buckets.push(bucket);
        patternlab.bucketIndex.push(bucketName);

        //done

      } else{
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
        if(pattern.patternState){
          navSubItem.patternState = pattern.patternState;
        }

        //test whether the pattern struture is flat or not - usually due to a template or page
        var flatPatternItem = false;
        if(navItemName === bucketName){
          flatPatternItem = true;
        }

        //if it is flat - we should not add the pattern to patternPaths
        if(flatPatternItem){

          //add the navItem to patternItems
          bucket.patternItems.push(navSubItem);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

        } else{
          //check to see if navItem exists
          var navItemIndex = bucket.navItemsIndex.indexOf(navItemName);
          if(navItemIndex === -1){

            var navItem = new of.oNavItem(navItemName);

            //add the navItem and navSubItem
            navItem.navSubItems.push(navSubItem);
            navItem.navSubItemsIndex.push(navSubItemName);
            bucket.navItems.push(navItem);
            bucket.navItemsIndex.push(navItemName);

          } else{
            //add the navSubItem
            var navItem = bucket.navItems[navItemIndex];
            navItem.navSubItems.push(navSubItem);
            navItem.navSubItemsIndex.push(navSubItemName);
          }

          //add the navViewAllSubItem
          var navViewAllSubItem = new of.oNavSubItem("");
          navViewAllSubItem.patternName = "View All";
          navViewAllSubItem.patternPath = pattern.flatPatternPath + "/index.html";
          navViewAllSubItem.patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup;

          //check if we are moving to a new sub section in the next loop
          if (!patternlab.patterns[i + 1] || pattern.patternSubGroup !== patternlab.patterns[i + 1].patternSubGroup) {
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
    var patternNavTemplate = fs.readFileSync('./source/_patternlab-files/partials/patternNav.mustache', 'utf8');
    var patternNavPartialHtml = pattern_assembler.renderPattern(patternNavTemplate, patternlab);

    //ishControls
    var ishControlsTemplate = fs.readFileSync('./source/_patternlab-files/partials/ishControls.mustache', 'utf8');
    patternlab.config.mqs = patternlab.mediaQueries;
    var ishControlsPartialHtml = pattern_assembler.renderPattern(ishControlsTemplate, patternlab.config);

    //patternPaths
    var patternPathsTemplate = fs.readFileSync('./source/_patternlab-files/partials/patternPaths.mustache', 'utf8');
    var patternPathsPartialHtml = pattern_assembler.renderPattern(patternPathsTemplate, {'patternPaths': JSON.stringify(patternlab.patternPaths)});

    //viewAllPaths
    var viewAllPathsTemplate = fs.readFileSync('./source/_patternlab-files/partials/viewAllPaths.mustache', 'utf8');
    var viewAllPathsPartialHtml = pattern_assembler.renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

    //render the patternlab template, with all partials
    var patternlabSiteHtml = pattern_assembler.renderPattern(patternlabSiteTemplate, {}, {
      'ishControls': ishControlsPartialHtml,
      'patternNav': patternNavPartialHtml,
      'patternPaths': patternPathsPartialHtml,
      'viewAllPaths': viewAllPathsPartialHtml
    });
    fs.outputFileSync('./public/index.html', patternlabSiteHtml);
  }

  function addToPatternPaths(bucketName, pattern){
    //this is messy, could use a refactor.
    patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.fileName;
  }

  return {
    version: function(){
      return getVersion();
    },
    build: function(deletePatternDir){
      buildPatterns(deletePatternDir);
      buildFrontEnd();
      printDebug();
    },
    help: function(){
      help();
    },
    build_patterns_only: function(deletePatternDir){
      buildPatterns(deletePatternDir);
      printDebug();
    }
  };

};

module.exports = patternlab_engine;
