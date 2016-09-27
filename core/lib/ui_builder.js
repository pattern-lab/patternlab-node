"use strict";

var path = require('path');
var JSON5 = require('json5');
var fs = require('fs-extra');
var ae = require('./annotation_exporter');
var of = require('./object_factory');
var Pattern = of.Pattern;
var pa = require('./pattern_assembler');
var pattern_assembler = new pa();
var plutils = require('./utilities');
var eol = require('os').EOL;
var _ = require('lodash');

var ui_builder = function () {

  /**
   * Registers the pattern to the patternPaths object for the appropriate patternGroup and basename
   * patternGroup + patternBaseName are what comprise the patternPartial (atoms-colors)
   * @param patternlab - global data store
   * @param pattern - the pattern to add
     */
  function addToPatternPaths(patternlab, pattern) {
    if (!patternlab.patternPaths[pattern.patternGroup]) {
      patternlab.patternPaths[pattern.patternGroup] = {};
    }

    //only add real patterns
    if (pattern.isPattern && !pattern.isDocPattern) {
      patternlab.patternPaths[pattern.patternGroup][pattern.patternBaseName] = pattern.name;
    }
  }

  /**
   * Registers the pattern with the viewAllPaths object for the appropriate patternGroup and patternSubGroup
   * @param patternlab - global data store
   * @param pattern -  the pattern to add
     */
  function addToViewAllPaths(patternlab, pattern) {
    if (!patternlab.viewAllPaths[pattern.patternGroup]) {
      patternlab.viewAllPaths[pattern.patternGroup] = {};
    }

    if (!patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup]) {
      patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup] = {};
    }

    //note these retain any number prefixes if present, because these paths match the filesystem
    patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup] = pattern.patternType + '-' + pattern.patternSubType;

    //add all if it does not exist yet
    if (!patternlab.viewAllPaths[pattern.patternGroup].all) {
      patternlab.viewAllPaths[pattern.patternGroup].all = pattern.patternType;
    }
  }

  /**
   * Writes a file to disk, with an optional callback
   * @param filePath - the path to write to with filename
   * @param data - the file contents
   * @param callback - an optional callback
     */
  function writeFile(filePath, data, callback) {
    if (callback) {
      fs.outputFileSync(filePath, data, callback);
    } else {
      fs.outputFileSync(filePath, data);
    }
  }

  /**
   * Returns whether or not the pattern should be excluded from direct rendering or navigation on the front end
   * @param pattern - the pattern to test for inclusion/exclusion
   * @param patternlab - global data store
   * @returns boolean - whether or not the pattern is excluded
     */
  function isPatternExcluded(pattern, patternlab) {
    var isOmitted;

    // skip underscore-prefixed files
    isOmitted = pattern.isPattern && pattern.fileName.charAt(0) === '_';
    if (isOmitted) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + " from styleguide patterns because it has an underscore suffix.");
      }
      return true;
    }

    //this is meant to be a homepage that is not present anywhere else
    isOmitted = pattern.patternPartial === patternlab.config.defaultPattern;
    if (isOmitted) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from styleguide patterns because it is defined as a defaultPattern.');
      }
      patternlab.defaultPattern = pattern;
      return true;
    }

    //this pattern is contained with a directory prefixed with an underscore (a handy way to hide whole directories from the nav
    isOmitted = pattern.relPath.charAt(0) === '_' || pattern.relPath.indexOf('/_') > -1;
    if (isOmitted) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from styleguide patterns because its contained within an underscored directory.');
      }
      return true;
    }

    //this pattern is a head or foot pattern
    isOmitted = pattern.isMetaPattern;
    if (isOmitted) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from styleguide patterns because its a meta pattern.');
      }
      return true;
    }

    //yay, let's include this on the front end
    return isOmitted;
  }

  /**
   * For the given pattern, find or construct the view-all pattern block for the group
   * @param pattern - the pattern to derive our documentation pattern from
   * @param patternlab - global data store
   * @param isSubtypePattern - whether or not this is a subtypePattern or a typePattern (typePatterns not supported yet)
   * @returns the found or created pattern object
     */
  function injectDocumentationBlock(pattern, patternlab, isSubtypePattern) {
    //first see if pattern_assembler processed one already
    var docPattern = patternlab.subtypePatterns[pattern.patternGroup + (isSubtypePattern ? '-' + pattern.patternSubGroup : '')];
    if (docPattern) {
      docPattern.isDocPattern = true;
      return docPattern;
    }

    //if not, create one now
    docPattern = new Pattern.createEmpty(
      {
        name: pattern.flatPatternPath,
        patternName:   isSubtypePattern ? pattern.patternSubGroup : pattern.patternGroup,
        patternDesc: '',
        patternPartial: 'viewall-' + pattern.patternGroup + (isSubtypePattern ? '-' + pattern.patternSubGroup : ''),
        patternSectionSubtype : isSubtypePattern,
        patternLink: pattern.flatPatternPath + path.sep + 'index.html',
        isPattern: false,
        engine: null,
        flatPatternPath: pattern.flatPatternPath,
        isDocPattern: true
      },
      patternlab
    );
    return docPattern;
  }

  /**
   * Registers flat patterns with the patternTypes object
   * This is a new menu group like atoms
   * @param patternlab - global data store
   * @param pattern - the pattern to register
     */
  function addPatternType(patternlab, pattern) {
    patternlab.patternTypes.push(
      {
        patternTypeLC: pattern.patternGroup.toLowerCase(),
        patternTypeUC: pattern.patternGroup.charAt(0).toUpperCase() + pattern.patternGroup.slice(1),
        patternType: pattern.patternType,
        patternTypeDash: pattern.patternGroup, //todo verify
        patternTypeItems: []
      }
    );
  }

  /**
   * Return the patternType object for the given pattern. Exits application if not found.
   * @param patternlab - global data store
   * @param pattern - the pattern to derive the pattern Type from
   * @returns the found pattern type object
     */
  function getPatternType(patternlab, pattern) {
    var patternType = _.find(patternlab.patternTypes, ['patternType', pattern.patternType]);

    if (!patternType) {
      plutils.logRed('Could not find patternType' + pattern.patternType + '. This is a critical error.');
      console.trace();
      process.exit(1);
    }

    return patternType;
  }

  /**
   * Return the patternSubType object for the given pattern. Exits application if not found.
   * @param patternlab - global data store
   * @param pattern - the pattern to derive the pattern subType from
   * @returns the found patternSubType object
   */
  function getPatternSubType(patternlab, pattern) {
    var patternType = getPatternType(patternlab, pattern);
    var patternSubType = _.find(patternType.patternTypeItems, ['patternSubtype', pattern.patternSubType]);

    if (!patternSubType) {
      plutils.logRed('Could not find patternType ' + pattern.patternType + '-' + pattern.patternType + '. This is a critical error.');
      console.trace();
      process.exit(1);
    }

    return patternSubType;
  }

  /**
   * Registers the pattern with the appropriate patternType.patternTypeItems object
   * This is a new menu group like atoms/global
   * @param patternlab - global data store
   * @param pattern - the pattern to register
     */
  function addPatternSubType(patternlab, pattern) {
    var patternType = getPatternType(patternlab, pattern);
    patternType.patternTypeItems.push(
      {
        patternSubtypeLC: pattern.patternSubGroup.toLowerCase(),
        patternSubtypeUC: pattern.patternSubGroup.charAt(0).toUpperCase() + pattern.patternSubGroup.slice(1),
        patternSubtype: pattern.patternSubType,
        patternSubtypeDash: pattern.patternSubGroup, //todo verify
        patternSubtypeItems: []
      }
    );
  }

  /**
   * Creates a patternSubTypeItem object from a pattern
   * This is a menu item you click on
   * @param pattern - the pattern to derive the subtypeitem from
   * @returns {{patternPartial: string, patternName: (*|string), patternState: string, patternSrcPath: string, patternPath: string}}
     */
  function createPatternSubTypeItem(pattern) {
    var patternPath = '';
    if (pattern.isFlatPattern) {
      patternPath = pattern.flatPatternPath + '-' + pattern.fileName + '/' + pattern.flatPatternPath + '-' + pattern.fileName + '.html';
    } else {
      patternPath = pattern.flatPatternPath + '/' + pattern.flatPatternPath + '.html';
    }

    return {
      patternPartial: pattern.patternPartial,
      patternName: pattern.patternName,
      patternState: pattern.patternState,
      patternSrcPath: encodeURI(pattern.subdir + '/' + pattern.fileName),
      patternPath: patternPath
    };
  }

  /**
   * Registers the pattern with the appropriate patternType.patternSubType.patternSubtypeItems array
   * These are the actual menu items you click on
   * @param patternlab - global data store
   * @param pattern - the pattern to derive the subtypeitem from
   * @param createViewAllVariant - whether or not to create the special view all item
     */
  function addPatternSubTypeItem(patternlab, pattern, createSubtypeViewAllVarient) {
    var patternSubType = getPatternSubType(patternlab, pattern);
    if (createSubtypeViewAllVarient) {
      patternSubType.patternSubtypeItems.push(
        {
          patternPartial: 'viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup,
          patternName: 'View All',
          patternPath: encodeURI(pattern.flatPatternPath + '/index.html'),
          patternType: pattern.patternType,
          patternSubtype: pattern.patternSubtype
        }
      );
    }
    else {
      patternSubType.patternSubtypeItems.push(
        createPatternSubTypeItem(pattern)
      );
    }
  }

  /**
   * Registers flat patterns to the appropriate type
   * @param patternlab - global data store
   * @param pattern - the pattern to add
     */
  function addPatternItem(patternlab, pattern, isViewAllVariant) {
    var patternType = getPatternType(patternlab, pattern);
    if (!patternType) {
      plutils.logRed('Could not find patternType' + pattern.patternType + '. This is a critical error.');
      console.trace();
      process.exit(1);
    }

    if (!patternType.patternItems) {
      patternType.patternItems = [];
    }

    if (isViewAllVariant) {
      if (!pattern.isFlatPattern) {
        //todo: it'd be nice if we could get this into createPatternSubTypeItem someday
        patternType.patternItems.push({
          patternPartial: 'viewall-' + pattern.patternGroup + '-all',
          patternName: 'View All',
          patternPath: encodeURI(pattern.patternType + '/index.html')
        });
      }

    } else {
      patternType.patternItems.push(createPatternSubTypeItem(pattern));
    }
  }

  // function getPatternItems(patternlab, patternType) {
  //   var patternType = _.find(patternlab.patternTypes, ['patternTypeLC', patternType]);
  //   if (patternType) {
  //     return patternType.patternItems;
  //   }
  //   return [];
  // }

  /**
   * Sorts patterns based on name.
   * Will be expanded to use explicit order in the near future
   * @param patternsArray - patterns to sort
   * @returns sorted patterns
     */
  function sortPatterns(patternsArray) {
    return patternsArray.sort(function (a, b) {

      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
  }

  /**
   * Returns an object representing how the front end styleguide and navigation is structured
   * @param patternlab - global data store
   * @returns ptterns grouped by type -> subtype like atoms -> global -> pattern, pattern, pattern
     */
  function groupPatterns(patternlab) {
    var groupedPatterns = {
      patternGroups: {}
    };

    _.forEach(sortPatterns(patternlab.patterns), function (pattern) {

      //ignore patterns we can omit from rendering directly
      pattern.omitFromStyleguide = isPatternExcluded(pattern, patternlab);
      if (pattern.omitFromStyleguide) { return; }

      if (!groupedPatterns.patternGroups[pattern.patternGroup]) {

        groupedPatterns.patternGroups[pattern.patternGroup] = {};
        pattern.isSubtypePattern = false;
        addPatternType(patternlab, pattern);

        //todo: Pattern Type View All and Documentation
        //groupedPatterns.patternGroups[pattern.patternGroup]['viewall-' + pattern.patternGroup] = injectDocumentationBlock(pattern, patternlab, false);
        addPatternItem(patternlab, pattern, true);
      }

      //continue building navigation for nested patterns
      if (pattern.patternGroup !== pattern.patternSubGroup) {

        if (!groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup]) {

          addPatternSubType(patternlab, pattern);

          pattern.isSubtypePattern = !pattern.isPattern;
          groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup] = {};
          groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup]['viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup] = injectDocumentationBlock(pattern, patternlab, true);

          addToViewAllPaths(patternlab, pattern);
          addPatternSubTypeItem(patternlab, pattern, true);

        }

        groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup][pattern.patternBaseName] = pattern;

        addToPatternPaths(patternlab, pattern);
        addPatternSubTypeItem(patternlab, pattern);
      } else {
        addPatternItem(patternlab, pattern);
        addToPatternPaths(patternlab, pattern);
      }

    });

    return groupedPatterns;
  }

  /**
   * Builds footer HTML from the general footer and user-defined footer
   * @param patternlab - global data store
   * @param patternPartial - the partial key to build this for, either viewall-patternPartial or a viewall-patternType-all
   * @returns HTML
     */
  function buildFooterHTML(patternlab, patternPartial) {
    //first render the general footer
    var footerPartial = pattern_assembler.renderPattern(patternlab.footer, {
      patternData: JSON.stringify({
        patternPartial: patternPartial,
      }),
      cacheBuster: patternlab.cacheBuster
    });

    var allFooterData;
    try {
      allFooterData = JSON5.parse(JSON5.stringify(patternlab.data));
    } catch (err) {
      console.log('There was an error parsing JSON for patternlab.data');
      console.log(err);
    }
    allFooterData.patternLabFoot = footerPartial;

    //then add it to the user footer
    var footerHTML = pattern_assembler.renderPattern(patternlab.userFoot, allFooterData);
    return footerHTML;
  }

  /**
   * Takes a set of patterns and builds a viewall HTML page for them
   * Used by the type and subtype viewall sets
   * @param patternlab - global data store
   * @param patterns - the set of patterns to build the viewall page for
   * @param patternPartial - a key used to identify the viewall page
   * @returns HTML
     */
  function buildViewAllHTML(patternlab, patterns, patternPartial) {
    var viewAllHTML = pattern_assembler.renderPattern(patternlab.viewAll,
      {
        partials: patterns,
        patternPartial: 'viewall-' + patternPartial,
        cacheBuster: patternlab.cacheBuster
      }, {
        patternSection: patternlab.patternSection,
        patternSectionSubtype: patternlab.patternSectionSubType
      });
    return viewAllHTML;
  }

  /**
   * Constructs viewall pages for each set of grouped patterns
   * @param mainPageHeadHtml - the already built main page HTML
   * @param patternlab - global data store
   * @param styleguidePatterns - the grouped set of patterns
   * @returns every built pattern and set of viewall patterns, so the styleguide can use it
     */
  function buildViewAllPages(mainPageHeadHtml, patternlab, styleguidePatterns) {
    var paths = patternlab.config.paths;
    var patterns = [];
    var writeViewAllFile = true;

    //loop through the grouped styleguide patterns, building at each level
    _.forEach(styleguidePatterns.patternGroups, function (patternTypeObj, patternType) {

      var p;
      var typePatterns = [];
      var styleGuideExcludes = patternlab.config.styleGuideExcludes;

      _.forOwn(patternTypeObj, function (patternSubtypes, patternSubtype) {

        var patternPartial = patternType + '-' + patternSubtype;

        //do not create a viewall page for flat patterns
        if (patternType === patternSubtype) {
          writeViewAllFile = false;
          return false;
        }

        //render the footer needed for the viewall template
        var footerHTML = buildFooterHTML(patternlab, 'viewall-' + patternPartial);

        //render the viewall template
        var subtypePatterns = _.values(patternSubtypes);

        //determine if we should write at this time by checking if these are flat patterns or grouped patterns
        p = _.find(subtypePatterns, function (pat) {
          return pat.isDocPattern;
        });

        typePatterns = typePatterns.concat(subtypePatterns);

        var viewAllHTML = buildViewAllHTML(patternlab, subtypePatterns, patternPartial);
        writeFile(paths.public.patterns + p.flatPatternPath + '/index.html', mainPageHeadHtml + viewAllHTML + footerHTML);
        return true; //stop yelling at us eslint we know we know
      });

      //do not create a viewall page for flat patterns
      if (!writeViewAllFile || !p) {
        return false;
      }

      //render the footer needed for the viewall template
      var footerHTML = buildFooterHTML(patternlab, 'viewall-' + patternType + '-all');

      //add any flat patterns
      //todo this isn't quite working yet
      //typePatterns = typePatterns.concat(getPatternItems(patternlab, patternType));

      //get the appropriate patternType
      var anyPatternOfType = _.find(typePatterns, function (pat) {
        return pat.patternType && pat.patternType !== '';});

      //render the viewall template for the type
      var viewAllHTML = buildViewAllHTML(patternlab, typePatterns, patternType);
      writeFile(paths.public.patterns + anyPatternOfType.patternType + '/index.html', mainPageHeadHtml + viewAllHTML + footerHTML);

      //determine if we should omit this patterntype completely from the viewall page
      var omitPatternType = styleGuideExcludes && styleGuideExcludes.length
        && _.some(styleGuideExcludes, function (exclude) {
          return exclude === patternType;
        });
      if (omitPatternType) {
        if (patternlab.config.debug) {
          console.log('Omitting ' + patternType + ' from  building a viewall page because its patternGroup is specified in styleguideExcludes.');
        }
      } else {
        patterns = patterns.concat(typePatterns);
      }

      return true; //stop yelling at us eslint we know we know
    });
    return patterns;
  }

  /**
   * Write out our pattern information for use by the front end
   * @param patternlab - global data store
     */
  function exportData(patternlab) {
    var annotation_exporter = new ae(patternlab);
    var paths = patternlab.config.paths;

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

    //plugins
    output += 'var plugins = ' + JSON.stringify(patternlab.plugins) + ';' + eol;

    //smaller config elements
    output += 'var defaultShowPatternInfo = ' + (patternlab.config.defaultShowPatternInfo ? patternlab.config.defaultShowPatternInfo : 'false') + ';' + eol;
    output += 'var defaultPattern = "' + (patternlab.config.defaultPattern ? patternlab.config.defaultPattern : 'all') + '";' + eol;

    //write all output to patternlab-data
    writeFile(path.resolve(paths.public.data, 'patternlab-data.js'), output);

    //annotations
    var annotationsJSON = annotation_exporter.gather();
    var annotations = 'var comments = { "comments" : ' + JSON.stringify(annotationsJSON) + '};';
    writeFile(path.resolve(paths.public.annotations, 'annotations.js'), annotations);
  }

  /**
   * Reset any global data we use between builds to guard against double adding things
   */
  function resetUIBuilderState(patternlab) {
    patternlab.patternPaths = {};
    patternlab.viewAllPaths = {};
    patternlab.patternTypes = [];
  }

  /**
   * The main entry point for ui_builder
   * @param patternlab - global data store
     */
  function buildFrontend(patternlab) {

    resetUIBuilderState(patternlab);

    var paths = patternlab.config.paths;

    //determine which patterns should be included in the front-end rendering
    var styleguidePatterns = groupPatterns(patternlab);

    //set the pattern-specific header by compiling the general-header with data, and then adding it to the meta header
    var headerPartial = pattern_assembler.renderPattern(patternlab.header, {
      cacheBuster: patternlab.cacheBuster
    });

    var headFootData = patternlab.data;
    headFootData.patternLabHead = headerPartial;
    headFootData.cacheBuster = patternlab.cacheBuster;
    var headerHTML = pattern_assembler.renderPattern(patternlab.userHead, headFootData);

    //set the pattern-specific footer by compiling the general-footer with data, and then adding it to the meta footer
    var footerPartial = pattern_assembler.renderPattern(patternlab.footer, {
      patternData: '{}',
      cacheBuster: patternlab.cacheBuster
    });
    headFootData.patternLabFoot = footerPartial;
    var footerHTML = pattern_assembler.renderPattern(patternlab.userFoot, headFootData);

    //build the viewall pages
    var allPatterns = buildViewAllPages(headerHTML, patternlab, styleguidePatterns);

    //add the defaultPattern if we found one
    if (patternlab.defaultPattern) {
      allPatterns.push(patternlab.defaultPattern);
      addToPatternPaths(patternlab, patternlab.defaultPattern);
    }

    //build the main styleguide page
    var styleguideHtml = pattern_assembler.renderPattern(patternlab.viewAll,
      {
        partials: allPatterns
      }, {
        patternSection: patternlab.patternSection,
        patternSectionSubtype: patternlab.patternSectionSubType
      });
    writeFile(path.resolve(paths.public.styleguide, 'html/styleguide.html'), headerHTML + styleguideHtml + footerHTML);

    //move the index file from its asset location into public root
    var patternlabSiteHtml;
    try {
      patternlabSiteHtml = fs.readFileSync(path.resolve(paths.source.styleguide, 'index.html'), 'utf8');
    } catch (error) {
      console.log(error);
      console.log("\nERROR: Could not load one or more styleguidekit assets from", paths.source.styleguide, '\n');
      process.exit(1);
    }
    writeFile(path.resolve(paths.public.root, 'index.html'), patternlabSiteHtml);

    //write out patternlab.data object to be read by the client
    exportData(patternlab);
  }

  return {
    buildFrontend: function (patternlab) {
      buildFrontend(patternlab);
    },
    isPatternExcluded: function (pattern, patternlab) {
      return isPatternExcluded(pattern, patternlab);
    },
    groupPatterns: function (patternlab) {
      return groupPatterns(patternlab);
    },
    resetUIBuilderState: function (patternlab) {
      resetUIBuilderState(patternlab);
    }
  };

};

module.exports = ui_builder;
