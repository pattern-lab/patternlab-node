"use strict";

var path = require('path');
var fs = require('fs-extra');
var ae = require('./annotation_exporter');
var of = require('./object_factory');
var Pattern = of.Pattern;
var pa = require('./pattern_assembler');
var pattern_assembler = new pa();
var eol = require('os').EOL;
var _ = require('lodash');

var ui_builder = function () {

  function addToPatternPaths(patternlab, pattern) {

    //console.log('adding',pattern.patternPartial, pattern.patternGroup, pattern.patternBaseName, pattern.name, 'to paths');

    if (!patternlab.patternPaths) {
      patternlab.patternPaths = {};
    }

    if (!patternlab.patternPaths[pattern.patternGroup]) {
      patternlab.patternPaths[pattern.patternGroup] = {};
    }

    if (pattern.isPattern && !pattern.isDocPattern){
      patternlab.patternPaths[pattern.patternGroup][pattern.patternBaseName] = pattern.name;
    }
  }

  function addToViewAllPaths(patternlab, pattern) {

    //console.log('6 adding',pattern.patternPartial, pattern.patternGroup, pattern.patternSubGroup, pattern.flatPatternPath, 'to viewallpaths');

    if (!patternlab.viewAllPaths) {
      patternlab.viewAllPaths = {};
    }

    if (!patternlab.viewAllPaths[pattern.patternGroup]) {
      patternlab.viewAllPaths[pattern.patternGroup] = {};
    }

    if (!patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup]) {
      patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup] = {};
    }


    //console.log('0000<><><><>><>>><>', pattern.patternPartial);

    patternlab.viewAllPaths[pattern.patternGroup][pattern.patternSubGroup] = pattern.patternType + '-' + pattern.patternSubType;


    if (!patternlab.viewAllPaths[pattern.patternGroup]['all']) {
      patternlab.viewAllPaths[pattern.patternGroup]['all'] = pattern.flatPatternPath;
    }
  }

  function writeFile(filePath, data, callback) {
    if (callback) {
      fs.outputFile(filePath, data, callback);
    } else {
      fs.outputFile(filePath, data);
    }
  }

  /*
   * isPatternExcluded
   * returns whether or not the pattern should be excluded from direct rendering or navigation on the front end
   */
  function isPatternExcluded(pattern, patternlab) {
    var styleGuideExcludes = patternlab.config.styleGuideExcludes;
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
      return true;
    }

    //this pattern is a member of any excluded pattern groups
    isOmitted = styleGuideExcludes && styleGuideExcludes.length && _.some(styleGuideExcludes, function (exclude) {
      return exclude === pattern.patternGroup; });
    if (isOmitted) {
      if (patternlab.config.debug) {
        console.log('Omitting ' + pattern.patternPartial + ' from styleguide patterns its patternGroup is specified in styleguideExcludes.');
      }
      return true;
    }

    //yay, let's include this on the front end
    return isOmitted;
  }

  /*
   * injectDocumentationBlock
   * take the given pattern, fina and construct the view-all pattern block for the group
   */
  function injectDocumentationBlock(pattern, patternlab, isSubtypePattern) {


    writeFile('./subtypePatternsNow.json', JSON.stringify(patternlab.subtypePatterns));

    var docPattern = patternlab.subtypePatterns[pattern.patternGroup + (isSubtypePattern ? '-' + pattern.patternSubGroup : '')];

    if (docPattern) {
      docPattern.isDocPattern = true;
      console.log(99, 'returning  doc pattern for', pattern.patternGroup + (isSubtypePattern ? '-' + pattern.patternSubGroup : ''));
      console.log(99, docPattern.patternDesc);
      return docPattern;
    }

    console.log(100, 'creating empty doc pattern for', pattern.patternGroup + (isSubtypePattern ? '-' + pattern.patternSubGroup : ''));
    var docPattern = new Pattern.createEmpty(
      {
        name: pattern.flatPatternPath,
        patternName:   isSubtypePattern ?  pattern.patternSubGroup : pattern.patternGroup,
        patternDesc: '',
        patternPartial: 'viewall-' + pattern.patternGroup + (isSubtypePattern ? '-' + pattern.patternSubGroup : ''),
        patternSectionSubtype : isSubtypePattern,
        patternLink: pattern.flatPatternPath + path.sep + 'index.html',
        isPattern: false,
        engine: null,

        //todo this might be broken yet
        flatPatternPath: pattern.flatPatternPath, // + (isSubtypePattern ? '-' + pattern.patternSubGroup : ''),
        isDocPattern: true
      }
    );
    return docPattern;
  }

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

  function getPatternType(patternlab, pattern) {

    var patternType = _.find(patternlab.patternTypes, ['patternType', pattern.patternType]);

    if(!patternType) {
      console.log('something went wrong looking for patternType');
      process.exit(1);
    }
    return patternType;
  }

  function getPatternSubType(patternlab, pattern) {
    var patternType = getPatternType(patternlab, pattern);

    if(!patternType) {
      console.log('something went wrong looking for patternType');
      process.exit(1);
    }

    var patternSubType = _.find(patternType.patternTypeItems, ['patternSubtype', pattern.patternSubType]);

    if(!patternSubType) {
      console.log('something went wrong looking for patternSubType', pattern.patternType, '-', pattern.patternSubType);
      process.exit(1);
    }

    return patternSubType;
  }

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

  function createPatternSubTypeItem(pattern) {
    return {
      patternPartial: pattern.patternPartial,
      patternName: pattern.patternName,
      patternState: pattern.patternState,
      patternSrcPath: encodeURI(pattern.subdir + pattern.filename),
      patternPath: encodeURI(pattern.flatPatternPath + '/' + pattern.flatPatternPath + '.html')
    }
  }

  function addPatternSubTypeItem(patternlab, pattern, createViewAllVariant) {
    var patternSubType = getPatternSubType(patternlab, pattern);

    if(createViewAllVariant) {
      patternSubType.patternSubtypeItems.push(
        {
          patternPartial: 'viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup,
          patternName: 'View All',
          patternPath: encodeURI(pattern.flatPatternPath + '/index.html'),
          patternType: pattern.patternType,
          patternSubtype: pattern.patternSubtype
        }
      );
    } else {

      console.log(111, pattern.patternPartial);

      patternSubType.patternSubtypeItems.push(
        createPatternSubTypeItem(pattern)
      );
    }

  }

  function addPatternItem(patternlab, pattern) {
    var patternType = getPatternType(patternlab, pattern);

    if (!patternType) {
      console.log('something went wrong looking for patternType', pattern.patternType);
      process.exit(1);
    }

    if (!patternType.patternItems) {
      patternType.patternItems = [];
    }

    patternType.patternItems.push(createPatternSubTypeItem(pattern));

  }

  /*
   * groupPatterns
   * returns an object representing how the front end styleguide and navigation is structured
   */
  function groupPatterns(patternlab) {
    var groupedPatterns = {
      patternGroups: {}
    };

    if(!patternlab.patternTypes){
      patternlab.patternTypes = [];
    }

    _.forEach(sortPatterns(patternlab.patterns), function (pattern) {

      pattern.omitFromStyleguide = isPatternExcluded(pattern, patternlab);

      //console.log('sorting', pattern.patternPartial, 'into group', pattern.patternGroup, 'and subtype', pattern.patternSubGroup);

      if (pattern.omitFromStyleguide) { return; }

      if (!groupedPatterns.patternGroups[pattern.patternGroup]) {
        pattern.isSubtypePattern = false;

        groupedPatterns.patternGroups[pattern.patternGroup] = {};

        addPatternType(patternlab, pattern);

        //todo: test this
        //groupedPatterns.patternGroups[pattern.patternGroup]['viewall-' + pattern.patternGroup] = injectDocumentationBlock(pattern, patternlab, false);
      }

      //continue building navigation for nested patterns
      if (pattern.patternGroup !== pattern.patternSubGroup) {

        if (!groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup]) {

          addPatternSubType(patternlab, pattern);

          pattern.isSubtypePattern = !pattern.isPattern;
          groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup] = {};
          groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup]['viewall-' + pattern.patternGroup + '-' + pattern.patternSubGroup] = injectDocumentationBlock(pattern, patternlab, true);

          addToViewAllPaths(patternlab, pattern);

          console.log(77, pattern.patternGroup, pattern.patternSubGroup);

          addPatternSubTypeItem(patternlab, pattern, true);

        }
        groupedPatterns.patternGroups[pattern.patternGroup][pattern.patternSubGroup][pattern.patternBaseName] = pattern;

        addToPatternPaths(patternlab, pattern);
        //console.log(12, 'about to create patternsubtypeitem derived from', pattern.patternPartial, pattern.patternGroup, pattern.patternSubGroup);
        addPatternSubTypeItem(patternlab, pattern);

      } else {

        addPatternItem(patternlab, pattern);
        addToPatternPaths(patternlab, pattern);

      }





    });
    return groupedPatterns;
  }

  function buildNavigation(patternlab, patterns) {

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

  function buildViewAllHTML(patternlab, patterns, patternPartial, isPatternType) {

    console.log(343, 'building viewall HTML for', patternPartial);

    //if (isPatternType) {
    //  patternPartial = patternPartial.substring(patternPartial.indexOf('viewall-'));
    //  console.log(21, patternPartial);
    //}


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

  function buildViewAllPages(mainPageHeadHtml, patternlab, styleguidePatterns) {
    var paths = patternlab.config.paths;
    var patterns = [];
    var writeViewAllFile = true;

    //loop through the grouped styleguide patterns, building at each level
    _.forEach(styleguidePatterns.patternGroups, function (patternTypeObj, patternType) {

      //console.log(1, patternType);

      var p;
      var typePatterns = [];

      _.forOwn(patternTypeObj, function (patternSubtypes, patternSubtype) {

        //console.log(2, patternSubtype);

        var patternPartial = patternType + '-' + patternSubtype;
        console.log(380, patternPartial);

        if(patternType === patternSubtype) {
          writeViewAllFile = false;
          return false;
        }

        //render the footer needed for the viewall template
        var footerHTML = buildFooterHTML(patternlab, 'viewall-' + patternPartial);

        //render the viewall template
        var subtypePatterns = _.values(patternSubtypes);

        //determine if we should write at this time by checking if these are flat patterns or grouped patterns
        p = _.find(subtypePatterns, function (pat) {
          console.log(394, pat.patternPartial, pat.isFlatPattern, pat.patternGroup, pat.patternSubGroup);
          return pat.isDocPattern;
        });

        typePatterns = typePatterns.concat(subtypePatterns);

        console.log(400);

        var viewAllHTML = buildViewAllHTML(patternlab, subtypePatterns, patternPartial);

        console.log(4, 'about to write view all file to patterns/', p.flatPatternPath, p.patternGroup, p.patternSubGroup);
        writeFile(paths.public.patterns + p.flatPatternPath + '/subtypePatterns.json', JSON.stringify(subtypePatterns));

        console.log(5, '------');
        //todo review this conditional
        //if(p.patternGroup && p.patternSubGroup){
          writeFile(paths.public.patterns + p.flatPatternPath + '/index.html', mainPageHeadHtml + viewAllHTML + footerHTML);
        //}
      });


      if (!writeViewAllFile || !p) {
        return false;
      }

      //render the footer needed for the viewall template
      var footerHTML = buildFooterHTML(patternlab, patternType);

      //render the viewall template
      var viewAllHTML = buildViewAllHTML(patternlab, typePatterns, patternType, true);

      //writeFile(paths.public.patterns + p.subdir + '/index.json', JSON.stringify(typePatterns));
      console.log(5, 'trying to write view all file to patterns/', p.subdir);

      writeFile(paths.public.patterns + p.subdir + '/index.html', mainPageHeadHtml + viewAllHTML + footerHTML);

      patterns = patterns.concat(typePatterns);

      console.log(3.57, patterns.length);

    });

    writeFile(paths.public.patterns + '/patterns.json', JSON.stringify(patterns));

    return patterns;
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

    //plugins someday
    output += 'var plugins = [];' + eol;

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

  function buildFrontend(patternlab) {

    var paths = patternlab.config.paths;

    //determine which patterns should be included in the front-end rendering
    var styleguidePatterns = groupPatterns(patternlab);

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

    //build the viewall pages
    var patterns = buildViewAllPages(headerHTML, patternlab, styleguidePatterns);


    writeFile('./all.json', JSON.stringify(patterns));


    //build the main styleguide page
    //todo broken
    var styleguideHtml = pattern_assembler.renderPattern(patternlab.viewAll,
      {
        partials: patterns,
        cacheBuster: patternlab.cacheBuster
      }, {
        patternSection: patternlab.patternSection,
        patternSectionSubType: patternlab.patternSectionSubType
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
      buildFrontend(patternlab)
    },
    isPatternExcluded: function (pattern, patternlab) {
      return isPatternExcluded(pattern, patternlab);
    },
    groupPatterns: function (patternlab) {
      return groupPatterns(patternlab);
    }
  };

};

module.exports = ui_builder;
