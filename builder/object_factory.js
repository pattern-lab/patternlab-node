/* 
 * patternlab-node - v0.1.2 - 2014-07-15 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
	"use strict";

	var oPattern = function(name, subdir, filename, data){
		this.name = name; //this is the unique name with the subDir
		this.subdir = subdir;
		this.filename = filename;
		this.data =  data;
		this.template = '';
		this.patternPartial = '';
		this.patternName = ''; //this is the display name for the ui
		this.patternLink = '';
		this.patternGroup = name.substring(name.indexOf('-') + 1, name.indexOf('-', 4) + 1 - name.indexOf('-') + 1);
		this.patternSubGroup = subdir.substring(subdir.indexOf('/') + 4);
		this.flatPatternPath = subdir.replace(/\//g, '-');
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

	var oPatternItem = function(){
		this.patternPath = '';
		this.patternPartial = '';
		this.patternName = '';
	};

	module.exports = {
		oPattern: oPattern,
		oBucket: oBucket,
		oNavItem: oNavItem,
		oNavSubItem: oNavSubItem,
		oPatternItem: oPatternItem
	};

}());