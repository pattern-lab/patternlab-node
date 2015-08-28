/*
 * patternlab-node - v0.10.1 - 2015
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

(function () {
  "use strict";

  var PatternEngines = require('pattern_engines/pattern_engines');

  var oPattern = function(subdir, filename, data){
    this.fileName = filename.substring(0, filename.indexOf('.'));
    this.subdir = subdir;
    this.name = subdir.replace(/[\/\\]/g, '-') + '-' + this.fileName; //this is the unique name with the subDir
    this.data =  data || null;
    this.jsonFileData = {};
    this.patternName = this.fileName.substring(this.fileName.indexOf('-') + 1); //this is the display name for the ui
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
    this.engine = PatternEngines.getEngineForPattern(this);
  };
  // render method on oPatterns; this acts as a proxy for the
  oPattern.prototype.render = function (data, partials) {
    return this.engine.render(this.template, data, partials);
  };

  var oBucket = function(name){
    this.bucketNameLC = name;
    this.bucketNameUC = name.charAt(0).toUpperCase() + name.slice(1);
    this.navItems = [];
    this.navItemsIndex = [];
    this.patternItems = [];
    this.patternItemsIndex = [];
  };

  var oNavItem = function(name){
    this.sectionNameLC = name;
    this.sectionNameUC = name.charAt(0).toUpperCase() + name.slice(1);
    this.navSubItems = [];
    this.navSubItemsIndex = [];
  };

  var oNavSubItem = function(name){
    this.patternPath = '';
    this.patternPartial = '';
    this.patternName = name.charAt(0).toUpperCase() + name.slice(1);
  };

  module.exports = {
    oPattern: oPattern,
    oBucket: oBucket,
    oNavItem: oNavItem,
    oNavSubItem: oNavSubItem
  };

}());
