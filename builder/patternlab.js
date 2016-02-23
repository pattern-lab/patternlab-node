/* 
 * patternlab-node - v1.1.2 - 2016 
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
  patternlab.config = config || fs.readJSONSync(path.resolve(__dirname, '../config.json'));

  var paths = patternlab.config.paths;


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
    patternlab.data = fs.readJSONSync(path.resolve(paths.source.data, 'data.json'));
    patternlab.listitems = fs.readJSONSync(path.resolve(paths.source.data, 'listitems.json'));
    patternlab.header = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'pattern-header-footer/header.html'), 'utf8');
    patternlab.footer = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'pattern-header-footer/footer.html'), 'utf8');
    patternlab.patterns = [];
    patternlab.partials = {};
    patternlab.data.link = {};

    var pattern_assembler = new pa(),
    entity_encoder = new he(),
    pattern_exporter = new pe(),
    patterns_dir = paths.source.patterns;

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
        pattern_assembler.process_pattern_iterative(path.resolve(file), patternlab);
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
        pattern_assembler.process_pattern_recursive(path.resolve(file), patternlab);
      });


    //now that all the main patterns are known, look for any links that might be within data and expand them
    //we need to do this before expanding patterns & partials into extendedTemplates, otherwise we could lose the data -> partial reference
    pattern_assembler.parse_data_links(patternlab);

    //delete the contents of config.patterns.public before writing
    if(deletePatternDir){
      fs.emptyDirSync(paths.public.patterns);
    }

    //render all patterns last, so lineageR works
    patternlab.patterns.forEach(function(pattern, index, patterns){

      //render the pattern, but first consolidate any data we may have
      var allData =  JSON.parse(JSON.stringify(patternlab.data));
      allData = pattern_assembler.merge_data(allData, pattern.jsonFileData);

      //render the extendedTemplate with all data
      pattern.patternPartial = pattern_assembler.renderPattern(pattern.extendedTemplate, allData);

      //add footer info before writing
      var patternFooter = pattern_assembler.renderPattern(patternlab.footer, pattern);

      //write the compiled template to the public patterns directory
      fs.outputFileSync(paths.public.patterns + pattern.patternLink, patternlab.header + pattern.patternPartial + patternFooter);

      //write the mustache file too
      fs.outputFileSync(paths.public.patterns + pattern.patternLink.replace('.html', '.mustache'), entity_encoder.encode(pattern.template));

      //write the encoded version too
      fs.outputFileSync(paths.public.patterns + pattern.patternLink.replace('.html', '.escaped.html'), entity_encoder.encode(pattern.patternPartial));
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

    //sort all patterns explicitly.
    patternlab.patterns = patternlab.patterns.sort(function(a,b){
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
    if (styleGuideExcludes && styleGuideExcludes.length) {
        for (i = 0; i < patternlab.patterns.length; i++) {

          // skip underscore-prefixed files
          if(isPatternExcluded(patternlab.patterns[i])){
            if(patternlab.config.debug){
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

    //build the styleguide
    var styleguideTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'styleguide.mustache'), 'utf8'),
    styleguideHtml = pattern_assembler.renderPattern(styleguideTemplate, {partials: styleguidePatterns});
    fs.outputFileSync(path.resolve(paths.public.styleguide, 'html/styleguide.html'), styleguideHtml);

    //build the viewall pages
    var prevSubdir = '',
    i;

    for (i = 0; i < patternlab.patterns.length; i++) {
      // skip underscore-prefixed files
      if(isPatternExcluded(patternlab.patterns[i])){
        if(patternlab.config.debug){
          console.log('Omitting ' + patternlab.patterns[i].key + " from view all rendering.");
        }
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
            //again, skip any sibling patterns to the current one that may have underscores
            if(isPatternExcluded(patternlab.patterns[j])){
              if(patternlab.config.debug){
                console.log('Omitting ' + patternlab.patterns[j].key + " from view all sibling rendering.");
              }
              continue;
            }

            viewAllPatterns.push(patternlab.patterns[j]);
          }
        }

        var viewAllTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'viewall.mustache'), 'utf8');
        var viewAllHtml = pattern_assembler.renderPattern(viewAllTemplate, {partials: viewAllPatterns, patternPartial: patternPartial});
        fs.outputFileSync(paths.public.patterns + pattern.flatPatternPath + '/index.html', viewAllHtml);
      }
    }

    //build the patternlab website
    var patternlabSiteTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'index.mustache'), 'utf8');

    //loop through all patterns.to build the navigation
    //todo: refactor this someday
    for(var i = 0; i < patternlab.patterns.length; i++){

      var pattern = patternlab.patterns[i];
      var bucketName = pattern.name.replace(/\\/g, '-').split('-')[1];

      //check if the bucket already exists
      var bucketIndex = patternlab.bucketIndex.indexOf(bucketName);
      if(bucketIndex === -1){

        // skip underscore-prefixed files. don't create a bucket on account of an underscored pattern
        if(isPatternExcluded(pattern)){
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

          // skip underscore-prefixed files
          if(isPatternExcluded(pattern)){
            continue;
          }

          //add the navItem to patternItems
          bucket.patternItems.push(navSubItem);

          //add to patternPaths
          addToPatternPaths(bucketName, pattern);

        } else{

          // only do this if pattern is included
          if(!isPatternExcluded(pattern)){
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
    var patternNavTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials/patternNav.mustache'), 'utf8');
    var patternNavPartialHtml = pattern_assembler.renderPattern(patternNavTemplate, patternlab);

    //ishControls
    var ishControlsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials/ishControls.mustache'), 'utf8');
    patternlab.config.mqs = patternlab.mediaQueries;
    var ishControlsPartialHtml = pattern_assembler.renderPattern(ishControlsTemplate, patternlab.config);

    //patternPaths
    var patternPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials/patternPaths.mustache'), 'utf8');
    var patternPathsPartialHtml = pattern_assembler.renderPattern(patternPathsTemplate, {'patternPaths': JSON.stringify(patternlab.patternPaths)});

    //viewAllPaths
    var viewAllPathsTemplate = fs.readFileSync(path.resolve(paths.source.patternlabFiles, 'partials/viewAllPaths.mustache'), 'utf8');
    var viewAllPathsPartialHtml = pattern_assembler.renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

    //render the patternlab template, with all partials
    var patternlabSiteHtml = pattern_assembler.renderPattern(patternlabSiteTemplate, {}, {
      'ishControls': ishControlsPartialHtml,
      'patternNav': patternNavPartialHtml,
      'patternPaths': patternPathsPartialHtml,
      'viewAllPaths': viewAllPathsPartialHtml
    });
    fs.outputFileSync(path.resolve(paths.public.root, 'index.html'), patternlabSiteHtml);
  }

  function addToPatternPaths(bucketName, pattern){
    //this is messy, could use a refactor.
    patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.fileName;
  }

  //todo: refactor this as a method on the pattern object itself once we merge dev with pattern-engines branch
  function isPatternExcluded(pattern){
    // returns whether or not the first character of the pattern filename is an underscore, or excluded
    return pattern.fileName.charAt(0) === '_';
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
