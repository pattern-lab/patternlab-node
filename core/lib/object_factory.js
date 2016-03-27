/* 
 * patternlab-node - v1.2.1 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

"use strict";

var oPattern = function (abspath, subdir, filename, data) {
  this.fileName = filename.substring(0, filename.indexOf('.'));
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
  this.key = this.patternGroup + '-' + this.patternName;
  this.template = '';
  this.patternPartial = '';
  this.lineage = [];
  this.lineageIndex = [];
  this.lineageR = [];
  this.lineageRIndex = [];
};

var oBucket = function (name) {
  this.bucketNameLC = name;
  this.bucketNameUC = name.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim();
  this.navItems = [];
  this.navItemsIndex = [];
  this.patternItems = [];
  this.patternItemsIndex = [];
};

var oNavItem = function (name) {
  this.sectionNameLC = name;
  this.sectionNameUC = name.split('-').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim();
  this.navSubItems = [];
  this.navSubItemsIndex = [];
};

var oNavSubItem = function (name) {
  this.patternPath = '';
  this.patternPartial = '';
  this.patternName = name.split(' ').reduce(function (val, working) {
    return val.charAt(0).toUpperCase() + val.slice(1) + ' ' + working.charAt(0).toUpperCase() + working.slice(1);
  }, '').trim();
};

module.exports = {
  oPattern: oPattern,
  oBucket: oBucket,
  oNavItem: oNavItem,
  oNavSubItem: oNavSubItem
};

