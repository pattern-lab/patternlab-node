"use strict";

var path = require('path');
var fs = require('fs-extra');
var ae = require('./annotation_exporter');
var of = require('./object_factory');
var Pattern = of.Pattern;
var pa = require('./pattern_assembler');
var pattern_assembler = new pa();
var eol = require('os').EOL;

// PRIVATE FUNCTIONS

function addToPatternPaths(patternlab, pattern) {
  if (!patternlab.patternPaths[pattern.patternGroup]) {
    patternlab.patternPaths[pattern.patternGroup] = {};
  }
  patternlab.patternPaths[pattern.patternGroup][pattern.patternBaseName] = pattern.name;
}

//todo: refactor this as a method on the pattern object itself once we merge dev with pattern-engines branch
function isPatternExcluded(pattern) {
  // returns whether or not the first character of the pattern filename is an underscore, or excluded
  return pattern.isPattern && pattern.fileName.charAt(0) === '_';
}

// Returns the array of patterns to be rendered in the styleguide view and
// linked to in the pattern navigation. Checks if patterns are excluded.
function assembleStyleguidePatterns(patternlab) {
  var styleguideExcludes = patternlab.config.styleGuideExcludes;
  var styleguidePatterns = [];

  //todo this loop can be made more efficient
  if (styleguideExcludes && styleguideExcludes.length) {
    for (var i = 0; i < patternlab.patterns.length; i++) {

      var pattern = patternlab.patterns[i];

      // skip underscore-prefixed files
      if (isPatternExcluded(pattern)) {
        if (patternlab.config.debug) {
          console.log('Omitting ' + pattern.patternPartial + " from styleguide pattern exclusion.");
        }
        continue;
      }

      //this is meant to be a homepage that is not present anywhere else
      if (pattern.patternPartial === patternlab.config.defaultPattern) {
        if (patternlab.config.debug) {
          console.log('omitting ' + pattern.patternPartial + ' from styleguide patterns because it is defined as a defaultPattern');
        }
        continue;
      }

      var partial = pattern.patternPartial;
      var partialType = partial.substring(0, partial.indexOf('-'));
      var isExcluded = (styleguideExcludes.indexOf(partialType) > -1);
      if (!isExcluded) {
        styleguidePatterns.push(pattern);
      }
    }
  } else {
    for (i = 0; i < patternlab.patterns.length; i++) {
      var pattern = patternlab.patterns[i];

      // skip underscore-prefixed files
      if (isPatternExcluded(pattern)) {
        if (patternlab.config.debug) {
          console.log('Omitting ' + pattern.patternPartial + " from styleguide pattern exclusion.");
        }
        continue;
      }

      //this is meant to be a homepage that is not present anywhere else
      if (pattern.patternPartial === patternlab.config.defaultPattern) {
        if (patternlab.config.debug) {
          console.log('omitting ' + pattern.patternPartial + ' from styleguide patterns because it is defined as a defaultPattern');
        }
        continue;
      }

      styleguidePatterns.push(pattern);
    }
  }
  return styleguidePatterns;
}

function buildNavigation(patternlab) {
  for (var i = 0; i < patternlab.patterns.length; i++) {

    var pattern = patternlab.patterns[i];

    //exclude any named defaultPattern from the navigation.
    //this is meant to be a homepage that is not navigable
    if (pattern.patternPartial === patternlab.config.defaultPattern) {
      if (patternlab.config.debug) {
        console.log('omitting ' + pattern.patternPartial + ' from navigation because it is defined as a defaultPattern');
      }

      //add to patternPaths before continuing
      addToPatternPaths(patternlab, pattern);

      continue;
    }

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
    patternSubTypeName = pattern.subdir.split(path.sep).pop().replace(/^\d*\-/, '');

    //get the patternSubTypeItem
    patternSubTypeItemName = pattern.patternName.replace(/-/g, ' ');

    //assume the patternSubTypeItem does not exist.
    patternSubTypeItem = new of.oPatternSubTypeItem(patternSubTypeItemName);
    patternSubTypeItem.patternPath = pattern.patternLink;
    patternSubTypeItem.patternPartial = pattern.patternPartial;

    //check if the patternType already exists
    var patternTypeIndex = patternlab.patternTypeIndex.indexOf(pattern.patternGroup);
    if (patternTypeIndex === -1) {
      //add the patternType
      var patternType = new of.oPatternType(pattern.patternGroup);

      //add patternPath and viewAllPath
      patternlab.patternPaths[pattern.patternGroup] = patternlab.patternPaths[pattern.patternGroup] || {};
      patternlab.viewAllPaths[pattern.patternGroup] = {};

      //test whether the pattern structure is flat or not - usually due to a template or page
      flatPatternItem = patternSubTypeName === pattern.patternGroup;

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
        addToPatternPaths(patternlab, pattern);

      } else {

        patternType.patternTypeItems.push(patternSubType);
        patternType.patternTypeItemsIndex.push(patternSubTypeName);
        patternSubType.patternSubtypeItems.push(patternSubTypeItem);
        patternSubType.patternSubtypeItemsIndex.push(patternSubTypeItemName);

        //add to patternPaths
        addToPatternPaths(patternlab, pattern);

        //add the view all PatternSubTypeItem
        viewAllPatternSubTypeItem = new of.oPatternSubTypeItem("View All");
        viewAllPatternSubTypeItem.patternPath = pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length) + "/index.html";
        viewAllPatternSubTypeItem.patternPartial = "viewall-" + pattern.patternGroup;

        patternType.patternItems.push(viewAllPatternSubTypeItem);
        patternlab.viewAllPaths[pattern.patternGroup].viewall = pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length);

      }

      //add the patternType.
      patternlab.patternTypes.push(patternType);
      patternlab.patternTypeIndex.push(pattern.patternGroup);

      //done

    } else {
      //find the patternType
      patternType = patternlab.patternTypes[patternTypeIndex];

      //add the patternState if it exists
      if (pattern.patternState) {
        patternSubTypeItem.patternState = pattern.patternState;
      }

      //test whether the pattern structure is flat or not - usually due to a template or page
      flatPatternItem = patternSubTypeName === pattern.patternGroup;

      //if it is flat - we should not add the pattern to patternPaths
      if (flatPatternItem) {
        //add the patternSubType to patternItems
        patternType.patternItems.push(patternSubTypeItem);

        //add to patternPaths
        addToPatternPaths(patternlab, pattern);

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
        addToPatternPaths(patternlab, pattern);
      }
    }

    patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup] = pattern.flatPatternPath;
  }
  return patternTypeIndex;
}

function buildFooterHTML(patternlab, patternPartial) {
  //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
  var footerPartial = pattern_assembler.renderPattern(patternlab.footer, {
    patternData: JSON.stringify({
      patternPartial: patternPartial,
    }),
    cacheBuster: patternlab.cacheBuster
  });
  var footerHTML = pattern_assembler.renderPattern(patternlab.userFoot, {
    patternLabFoot : footerPartial
  });
  return footerHTML;
}

function insertPatternSubtypeDocumentationPattern(patternlab, patterns, patternPartial) {
  //attempt to find a subtype pattern before rendering
  var subtypePattern = patternlab.subtypePatterns[patternPartial];
  if (subtypePattern) {
    patterns.unshift(subtypePattern);
  } else {
    var stubbedSubtypePattern = Pattern.createEmpty({
      patternSectionSubtype: true,
      isPattern: false,
      patternPartial: 'viewall-' + patternPartial,
      patternName: patterns[0].patternSubGroup,
      patternLink:  patterns[0].flatPatternPath + '/index.html'
    });
    patterns.unshift(stubbedSubtypePattern);
  }
  return patterns;
}

function buildViewAllHTML(patternlab, patterns, patternPartial) {

  var patternsPlusSubtpe = insertPatternSubtypeDocumentationPattern(patternlab, patterns, patternPartial);

  var viewAllHTML = pattern_assembler.renderPattern(patternlab.viewAll,
    {
      partials: patternsPlusSubtpe,
      patternPartial: patternPartial,
      cacheBuster: patternlab.cacheBuster
    }, {
      patternSection: patternlab.patternSection,
      patternSectionSubtype: patternlab.patternSectionSubType
    });
  return viewAllHTML;
}

function buildViewAllPages(mainPageHeadHtml, patternlab, styleguidePatterns) {
  var paths = patternlab.config.paths;
  var prevSubdir = '';
  var prevGroup = '';
  var i;

  for (i = 0; i < styleguidePatterns.length; i++) {

    var pattern = styleguidePatterns[i];

    // skip underscore-prefixed files
    if (isPatternExcluded(pattern)) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + " from view all rendering.");
      }
      continue;
    }

    //this is meant to be a homepage that is not present anywhere else
    if (pattern.patternPartial === patternlab.config.defaultPattern) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from view all rendering because it is defined as a defaultPattern');
      }
      continue;
    }

    //create the view all for the section
    // check if the current section is different from the previous one
    if (pattern.patternGroup !== prevGroup) {
      prevGroup = pattern.patternGroup;


      var viewAllPatterns = [];
      var patternPartial = "viewall-" + pattern.patternGroup;
      var j;


      for (j = 0; j < styleguidePatterns.length; j++) {


        if (styleguidePatterns[j].patternGroup === pattern.patternGroup) {
          //again, skip any sibling patterns to the current one that may have underscores

          if (isPatternExcluded(styleguidePatterns[j])) {
            if (patternlab.config.debug) {
              console.log('Omitting ' + styleguidePatterns[j].patternPartial + " from view all sibling rendering.");
            }
            continue;
          }

          //this is meant to be a homepage that is not present anywhere else
          if (styleguidePatterns[j].patternPartial === patternlab.config.defaultPattern) {
            if (patternlab.config.debug) {
              console.log('Omitting ' + pattern.patternPartial + ' from view all sibling rendering because it is defined as a defaultPattern');
            }
            continue;
          }


          viewAllPatterns.push(styleguidePatterns[j]);
        }
      }

      //render the footer needed for the viewall template
      var footerHTML = buildFooterHTML(patternlab, patternPartial);

      //render the viewall template
      var viewAllHTML = buildViewAllHTML(patternlab, viewAllPatterns, patternPartial);

      fs.outputFileSync(paths.public.patterns + pattern.subdir.slice(0, pattern.subdir.indexOf(pattern.patternGroup) + pattern.patternGroup.length) + '/index.html', mainPageHeadHtml + viewAllHTML + footerHTML);
    }

    //create the view all for the subsection
    // check if the current sub section is different from the previous one
    if (pattern.subdir !== prevSubdir) {
      prevSubdir = pattern.subdir;

      viewAllPatterns = [];
      patternPartial = "viewall-" + pattern.patternGroup + "-" + pattern.patternSubGroup;

      for (j = 0; j < styleguidePatterns.length; j++) {

        if (styleguidePatterns[j].subdir === pattern.subdir) {
          //again, skip any sibling patterns to the current one that may have underscores
          if (isPatternExcluded(styleguidePatterns[j])) {
            if (patternlab.config.debug) {
              console.log('Omitting ' + styleguidePatterns[j].patternPartial + " from view all sibling rendering.");
            }
            continue;
          }

          //this is meant to be a homepage that is not present anywhere else
          if (styleguidePatterns[j].patternPartial === patternlab.config.defaultPattern) {
            if (patternlab.config.debug) {
              console.log('Omitting ' + pattern.patternPartial + ' from view all sibling rendering because it is defined as a defaultPattern');
            }
            continue;
          }

          viewAllPatterns.push(styleguidePatterns[j]);
        }

      }

      //render the footer needed for the viewall template
      var footerHTML = buildFooterHTML(patternlab, patternPartial);

      //render the viewall template
      var viewAllHTML = buildViewAllHTML(patternlab, viewAllPatterns, patternPartial);

      fs.outputFileSync(paths.public.patterns + pattern.flatPatternPath + '/index.html', mainPageHeadHtml + viewAllHTML + footerHTML);
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
  var annotation_exporter = new ae(patternlab);
  var styleguidePatterns = [];
  var paths = patternlab.config.paths;

  patternlab.patternTypes = [];
  patternlab.patternTypeIndex = [];
  patternlab.patternPaths = {};
  patternlab.viewAllPaths = {};

  // check if patterns are excluded, if not add them to styleguidePatterns
  styleguidePatterns = assembleStyleguidePatterns(patternlab);

  //sort all patterns explicitly.
  styleguidePatterns = sortPatterns(styleguidePatterns);

  //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
  var headerPartial = pattern_assembler.renderPattern(patternlab.header, {
    cacheBuster: patternlab.cacheBuster
  });
  var headerHTML = pattern_assembler.renderPattern(patternlab.userHead, {
    patternLabHead : headerPartial,
    cacheBuster: patternlab.cacheBuster
  });

  //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
  var footerPartial = pattern_assembler.renderPattern(patternlab.footer, {
    patternData: '{}',
    cacheBuster: patternlab.cacheBuster
  });
  var footerHTML = pattern_assembler.renderPattern(patternlab.userFoot, {
    patternLabFoot : footerPartial
  });

  //build the styleguide
  var styleguideHtml = pattern_assembler.renderPattern(patternlab.viewAll,
    {
      partials: styleguidePatterns,
      cacheBuster: patternlab.cacheBuster
    }, {
      patternSection: patternlab.patternSection,
      patternSectionSubType: patternlab.patternSectionSubType
    });

  fs.outputFileSync(path.resolve(paths.public.styleguide, 'html/styleguide.html'), headerHTML + styleguideHtml + footerHTML);

  //build the viewall pages
  buildViewAllPages(headerHTML, patternlab, styleguidePatterns);

  //build the patternlab website
  buildNavigation(patternlab);

  //move the index file from its asset location into public root
  var patternlabSiteHtml;
  try {
    patternlabSiteHtml = fs.readFileSync(path.resolve(paths.source.styleguide, 'index.html'), 'utf8');
  } catch (error) {
    console.log(error);
    console.log("\nERROR: Could not load one or more styleguidekit assets from", paths.source.styleguide, '\n');
    process.exit(1);
  }
  fs.outputFileSync(path.resolve(paths.public.root, 'index.html'), patternlabSiteHtml);

  //write out the data
  var output = '';

  //config
  output += 'var config = ' + JSON.stringify(patternlab.config) + ';\n';

  //ishControls
  output += 'var ishControls = {"ishControlsHide":' + JSON.stringify(patternlab.config.ishControlsHide) + '};' + eol;

  //navItems
  output += 'var navItems = {"patternTypes": ' + JSON.stringify(patternlab.patternTypes) + '};' + eol;

  //patternPaths
  output += 'var patternPaths = ' + JSON.stringify(patternlab.patternPaths) + ';' + eol;

  //viewAllPaths
  output += 'var viewAllPaths = ' + JSON.stringify(patternlab.viewAllPaths) + ';' + eol;

  //plugins someday
  output += 'var plugins = [];' + eol;

  //smaller config elements
  output += 'var defaultShowPatternInfo = ' + (patternlab.config.defaultShowPatternInfo ? patternlab.config.defaultShowPatternInfo : 'false') + ';' + eol;
  output += 'var defaultPattern = "' + (patternlab.config.defaultPattern ? patternlab.config.defaultPattern : 'all') + '";' + eol;

  //write all ouytput to patternlab-data
  fs.outputFileSync(path.resolve(paths.public.data, 'patternlab-data.js'), output);

  //annotations
  var annotationsJSON = annotation_exporter.gather();
  var annotations = 'var comments = { "comments" : ' + JSON.stringify(annotationsJSON) + '};';
  fs.outputFileSync(path.resolve(paths.public.annotations, 'annotations.js'), annotations);

}

module.exports = buildFrontEnd;
