(function () {
	"use strict";

	var pha = require('../builder/pseudopattern_hunter');
  var pa = require('../builder/pattern_assembler');
	var object_factory = require('../builder/object_factory');

	exports['pseudopattern_hunter'] = {
		'pseudpattern found and added as a pattern' : function(test){
      //arrange
      var fs = require('fs-extra');
      var pattern_assembler = new pa();
      var pseudopattern_hunter = new pha();
      var patterns_dir = './test/files/_patterns/';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};
      pl.config.patternStates = {};

      var atomPattern = new object_factory.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
      atomPattern.template = fs.readFileSync(patterns_dir + '00-test/03-styled-atom.mustache', 'utf8');
      atomPattern.extendedTemplate = atomPattern.template;
      atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

      pattern_assembler.addPattern(atomPattern, pl);

      //act
      var patternCountBefore = pl.patterns.length;
      pseudopattern_hunter.find_pseudopatterns(atomPattern, pl);

      //assert
      test.equals(patternCountBefore + 1, pl.patterns.length);
      test.equals(pl.patterns[1].key, 'test-styled-atom-alt');
      test.equals(pl.patterns[1].extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), '<span class="test_base {{styleModifier}}"> {{message}} </span>');
      test.equals(JSON.stringify(pl.patterns[1].jsonFileData), JSON.stringify({"message": "alternateMessage"}));

      test.done();
    }
  }
}());
