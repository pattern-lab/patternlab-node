"use strict";

var patternEngines = require('./pattern_engines');
var path = require('path');
var extend = require('util')._extend;

// patternPrefixMatcher is intended to match the leading maybe-underscore,
// zero or more digits, and maybe-dash at the beginning of a pattern file name we can hack them
// off and get at the good part.
var patternPrefixMatcher = /^_?(\d+-)?/;

// Pattern properties

var Pattern = function (sourcePath, relPath, data, patternlab) {
  // We expect relPath to be the path of the pattern template, relative to the
  // root of the pattern tree. Parse out the path parts and save the useful ones.
  var pathObj = path.parse(path.normalize(relPath));
  this.relPath = path.normalize(relPath); // '00-atoms/00-global/00-colors.mustache'
  this.fileName = pathObj.name;     // '00-colors'
  this.subdir = pathObj.dir;        // '00-atoms/00-global'
  this.sourcePath = sourcePath;        // 'source/_patterns/'
  this.fileExtension = pathObj.ext; // '.mustache'

  // this is the unique name, subDir + fileName (sans extension)
  this.name = this.subdir.replace(path.sep, '-') + '-' + this.fileName.replace('~', '-'); // '00-atoms-00-global-00-colors'

  // the JSON used to render values in the pattern
  this.jsonFileData = data || {};

  // strip leading "00-" from the file name and flip tildes to dashes
  this.patternBaseName = this.fileName.replace(patternPrefixMatcher, '').replace('~', '-'); // 'colors'

  // Fancy name. No idea how this works. 'Colors'
  this.patternName = this.patternBaseName.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim(); //this is the display name for the ui. strip numeric + hyphen prefixes

  // the top-level pattern group this pattern belongs to. 'atoms'
  this.patternGroup = this.subdir.split(path.sep)[0].replace(patternPrefixMatcher, '');

  //00-atoms if needed
  this.patternType = this.subdir.split(path.sep)[0];

  // the sub-group this pattern belongs to.
  this.patternSubGroup = path.basename(this.subdir).replace(patternPrefixMatcher, ''); // 'global'

  //00-colors if needed
  this.patternSubType = path.basename(this.subdir);

  // the joined pattern group and subgroup directory
  this.flatPatternPath = this.subdir.replace(/[\/\\]/g, '-'); // '00-atoms-00-global'

  // calculated path from the root of the public directory to the generated
  // (rendered!) html file for this pattern, to be shown in the iframe
  this.patternLink = patternlab ? this.getPatternLink(patternlab, 'rendered') : null;

  // The canonical "key" by which this pattern is known. This is the callable
  // name of the pattern. UPDATE: this.key is now known as this.patternPartial
  this.patternPartial = this.patternGroup + '-' + this.patternBaseName;

  // Let's calculate the verbose name ahead of time! We don't use path.sep here
  // on purpose. This isn't a file name!
  this.verbosePartial = this.subdir + '/' + this.fileName;

  this.isPattern = true;
  this.isFlatPattern = this.patternGroup === this.patternSubGroup;
  this.patternState = '';
  this.template = '';
  this.patternPartialCode = '';
  this.lineage = [];
  this.lineageIndex = [];
  this.lineageR = [];
  this.lineageRIndex = [];
  this.isPseudoPattern = false;
  this.engine = patternEngines.getEngineForPattern(this);
};

// Pattern methods

Pattern.prototype = {

  // render method on oPatterns; this acts as a proxy for the PatternEngine's
  // render function
  render: function (data, partials) {
    if (this.engine) {
      return this.engine.renderPattern(this, data || this.jsonFileData, partials);
    }
    return null;
  },

  registerPartial: function () {
    if (this.engine && typeof this.engine.registerPartial === 'function') {
      this.engine.registerPartial(this);
    }
  },

  // calculated path from the root of the public directory to the generated html
  // file for this pattern.
  // Should look something like '00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html'
  getPatternLink: function (patternlab, suffixType, customfileExtension) {
    // if no suffixType is provided, we default to rendered
    var suffixConfig = patternlab.config.outputFileSuffixes;
    var suffix = suffixType ? suffixConfig[suffixType] : suffixConfig.rendered;

    if (suffixType === 'rawTemplate') {
      return this.name + path.sep + this.name + suffix + this.fileExtension;
    }

    if (suffixType === 'custom') {
      return this.name + path.sep + this.name + customfileExtension;
    }

    return this.name + path.sep + this.name + suffix + '.html';
  },

  // the finders all delegate to the PatternEngine, which also encapsulates all
  // appropriate regexes
  findPartials: function () {
    return this.engine.findPartials(this);
  },

  findPartialsWithStyleModifiers: function () {
    return this.engine.findPartialsWithStyleModifiers(this);
  },

  findPartialsWithPatternParameters: function () {
    return this.engine.findPartialsWithPatternParameters(this);
  },

  findListItems: function () {
    return this.engine.findListItems(this);
  },

  findPartial: function (partialString) {
    return this.engine.findPartial(partialString);
  }
};

// Pattern static methods

// factory: creates an empty Pattern for miscellaneous internal use, such as
// by list_item_hunter
Pattern.createEmpty = function (customProps, patternlab) {
  var pattern = new Pattern('', '', null, patternlab);
  return extend(pattern, customProps);
};

// factory: creates an Pattern object on-demand from a hash; the hash accepts
// parameters that replace the positional parameters that the Pattern
// constructor takes.
Pattern.create = function (sourcePath, relPath, data, customProps, patternlab) {
  var newPattern = new Pattern(sourcePath || '', relPath || '', data || null, patternlab);
  return extend(newPattern, customProps);
};

module.exports = {
  Pattern: Pattern
};
