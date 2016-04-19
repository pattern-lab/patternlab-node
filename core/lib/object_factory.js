/*
 * patternlab-node - v1.3.0 - 2016
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

"use strict";

var patternEngines = require('./pattern_engines/pattern_engines');
var path = require('path');
var extend = require('util')._extend;

// oPattern properties

var oPattern = function (abspath, subdir, filename, data) {
  this.fileName = filename.substring(0, filename.indexOf('.'));
  this.fileExtension = path.extname(abspath);
  this.abspath = abspath;
  this.subdir = subdir;
  this.name = subdir.replace(/[\/\\]/g, '-') + '-' + this.fileName; //this is the unique name with the subDir
  this.jsonFileData = data || {};
  this.patternName = this.fileName.replace(/^\d*\-/, '');
  this.patternDisplayName = this.patternName.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim(); //this is the display name for the ui. strip numeric + hyphen prefixes
  this.patternLink = this.name + '/' + this.name + '.html';
  this.patternGroup = this.name.substring(this.name.indexOf('-') + 1, this.name.indexOf('-', 4) + 1 - this.name.indexOf('-') + 1);
  this.patternSubGroup = subdir.substring(subdir.indexOf('/') + 4);
  this.flatPatternPath = subdir.replace(/[\/\\]/g, '-');
  this.patternPartial = this.patternGroup + '-' + this.patternName;
  this.template = '';
  this.patternPartialCode = '';
  this.lineage = [];
  this.lineageIndex = [];
  this.lineageR = [];
  this.lineageRIndex = [];
  this.isPseudoPattern = false;
  this.engine = patternEngines.getEngineForPattern(this);
};

// oPattern methods

oPattern.prototype = {

  // render method on oPatterns; this acts as a proxy for the PatternEngine's
  // render function
  render: function (data, partials) {
    return this.engine.renderPattern(this, data || this.jsonFileData, partials);
  },

  registerPartial: function () {
    if (typeof this.engine.registerPartial === 'function') {
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

// oPattern static methods

// factory: creates an empty oPattern for miscellaneous internal use, such as
// by list_item_hunter
oPattern.createEmpty = function (customProps) {
  var pattern = new oPattern('', '', '', null);
  return extend(pattern, customProps);
};

// factory: creates an oPattern object on-demand from a hash; the hash accepts
// parameters that replace the positional parameters that the oPattern
// constructor takes.
oPattern.create = function (abspath, subdir, filename, data, customProps) {
  var newPattern = new oPattern(abspath || '', subdir || '', filename || '', data || null);
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
  oPattern: oPattern,
  oPatternType: oPatternType,
  oPatternSubType: oPatternSubType,
  oPatternSubTypeItem: oPatternSubTypeItem
};
