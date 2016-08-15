(function () {
"use strict";

  var of = require('../core/lib/object_factory');
  var Pattern = require('../core/lib/object_factory').Pattern;
  var path = require('path');

	exports['Pattern initialization'] = {
		'test Pattern initializes correctly' : function (test) {
			var p = new Pattern('00-atoms/00-global/00-colors.mustache', { d: 123});
      test.equals(p.relPath, '00-atoms' + path.sep + '00-global' + path.sep + '00-colors.mustache');
			test.equals(p.name, '00-atoms-00-global-00-colors');
			test.equals(p.subdir, '00-atoms' + path.sep + '00-global');
			test.equals(p.fileName, '00-colors');
			test.equals(p.fileExtension, '.mustache');
			test.equals(p.jsonFileData.d, 123);
			test.equals(p.patternBaseName, 'colors');
			test.equals(p.patternName, 'Colors');
			test.equals(p.patternLink, '00-atoms-00-global-00-colors' + path.sep + '00-atoms-00-global-00-colors.html');
			test.equals(p.patternGroup, 'atoms');
			test.equals(p.patternSubGroup, 'global');
			test.equals(p.flatPatternPath, '00-atoms-00-global');
			test.equals(p.patternPartial, 'atoms-colors');
			test.equals(p.template, '');
			test.equals(p.patternPartialCode, '');
			test.equals(p.lineage.length, 0);
			test.equals(p.lineageIndex.length, 0);
			test.equals(p.lineageR.length, 0);
			test.equals(p.lineageRIndex.length, 0);
      test.equals(p.patternState, '');
			test.done();
		},
    'test Pattern with one-directory subdir works as expected' : function (test) {
		  var p = new Pattern('00-atoms/00-colors.mustache', { d: 123});
          test.equals(p.relPath, '00-atoms' + path.sep + '00-colors.mustache');
		  test.equals(p.name, '00-atoms-00-colors');
		  test.equals(p.subdir, '00-atoms');
		  test.equals(p.fileName, '00-colors');
		  test.equals(p.fileExtension, '.mustache');
		  test.equals(p.jsonFileData.d, 123);
		  test.equals(p.patternBaseName, 'colors');
		  test.equals(p.patternName, 'Colors');
		  test.equals(p.patternLink, '00-atoms-00-colors' + path.sep + '00-atoms-00-colors.html');
		  test.equals(p.patternGroup, 'atoms');
		  test.equals(p.flatPatternPath, '00-atoms');
		  test.equals(p.patternPartial, 'atoms-colors');
		  test.equals(p.template, '');
		  test.equals(p.lineage.length, 0);
		  test.equals(p.lineageIndex.length, 0);
		  test.equals(p.lineageR.length, 0);
		  test.equals(p.lineageRIndex.length, 0);
		  test.done();
	    },
    'test Pattern with no numbers in pattern group works as expected' : function (test) {
      var p = new Pattern('atoms/colors.mustache', { d: 123});
      test.equals(p.relPath, 'atoms' + path.sep + 'colors.mustache');
      test.equals(p.name, 'atoms-colors');
      test.equals(p.subdir, 'atoms');
      test.equals(p.fileName, 'colors');
      test.equals(p.patternLink, 'atoms-colors' + path.sep + 'atoms-colors.html');
      test.equals(p.patternGroup, 'atoms');
      test.equals(p.flatPatternPath, 'atoms');
      test.equals(p.patternPartial, 'atoms-colors');
      test.done();
    },
		'test Pattern capitalizes patternDisplayName correctly' : function(test){
			var p = new Pattern('00-atoms/00-global/00-colors-alt.mustache', { d: 123});
			test.equals(p.patternBaseName, 'colors-alt');
			test.equals(p.patternName, 'Colors Alt');
			test.done();
		}
	};

}());
