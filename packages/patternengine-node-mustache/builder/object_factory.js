/* 
 * patternlab-node - v0.9.0 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
  "use strict";

  var oPattern = function(subdir, filename, data){
    this.fileName = filename.substring(0, filename.indexOf('.'));
    this.subdir = subdir;
    this.name = subdir.replace(/[\/\\]/g, '-') + '-' + this.fileName; //this is the unique name with the subDir
    this.data =  data || null;
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