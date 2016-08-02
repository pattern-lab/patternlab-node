"use strict";

var patternEngines = require('./pattern_engines');
var path = require('path');
var extend = require('util')._extend;

// Pattern properties

var Pattern = function (relPath, data) {
  // We expect relPath to be the path of the pattern template, relative to the
  // root of the pattern tree. Parse out the path parts and save the useful ones.
  var pathObj = path.parse(path.normalize(relPath));
  this.relPath = path.normalize(relPath); // '00-atoms/00-global/00-colors.mustache'
  this.fileName = pathObj.name;     // '00-colors'
  this.subdir = pathObj.dir;        // '00-atoms/00-global'
  this.fileExtension = pathObj.ext; // '.mustache'

  // this is the unique name, subDir + fileName (sans extension)
  this.name = this.subdir.replace(/[\/\\]/g, '-') + '-' + this.fileName.replace(/~/g, '-'); // '00-atoms-00-global-00-colors'

  // the JSON used to render values in the pattern
  this.jsonFileData = data || {};

  // strip leading "00-" from the file name and underscores from ui-hidden patterns
  this.patternBaseName = this.fileName.replace(/^\d*\-/, '').replace(/^_/, ''); // 'colors'

  // Fancy name. No idea how this works. 'Colors'
  this.patternName = this.patternBaseName.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim(); //this is the display name for the ui. strip numeric + hyphen prefixes

  // calculated path from the root of the public directory to the generated html
  // file for this pattern
  this.patternLink = this.name + path.sep + this.name + '.html'; // '00-atoms-00-global-00-colors/00-atoms-00-global-00-colors.html'

  // the top-level pattern group this pattern belongs to. 'atoms'
  this.patternGroup = this.subdir.split(path.sep)[0].replace(/^\d*-/, '');

  // the sub-group this pattern belongs to.
  this.patternSubGroup = path.basename(this.subdir).replace(/^\d*-/, ''); // 'global'

  // Not sure what this is used for.
  this.flatPatternPath = this.subdir.replace(/[\/\\]/g, '-'); // '00-atoms-00-global'

  // The canonical "key" by which this pattern is known. This is the callable
  // name of the pattern. UPDATE: this.key is now known as this.patternPartial
  this.patternPartial = this.patternGroup + '-' + this.patternBaseName;

  this.isPattern = true;
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
Pattern.createEmpty = function (customProps) {
  var pattern = new Pattern('', null);
  return extend(pattern, customProps);
};

// factory: creates an Pattern object on-demand from a hash; the hash accepts
// parameters that replace the positional parameters that the Pattern
// constructor takes.
Pattern.create = function (relPath, data, customProps) {
  var newPattern = new Pattern(relPath || '', data || null);
  return extend(newPattern, customProps);
};


var oPatternType = function (name) {
  this.patternTypeLC = name;
  this.patternTypeUC = name.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim();
  this.patternTypeItems = [];
  this.patternTypeItemsIndex = [];
  this.patternItems = [];
  this.patternItemsIndex = [];
};


var oPatternSubType = function (name) {
  this.patternSubtypeLC = name;
  this.patternSubtypeUC = name.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim();
  this.patternSubtypeItems = [];
  this.patternSubtypeItemsIndex = [];
};


var oPatternSubTypeItem = function (name) {
  this.patternPath = '';
  this.patternPartialCode = '';
  this.patternName = name.split(' ').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim();
};


module.exports = {
  Pattern: Pattern,
  oPatternType: oPatternType,
  oPatternSubType: oPatternSubType,
  oPatternSubTypeItem: oPatternSubTypeItem
};
