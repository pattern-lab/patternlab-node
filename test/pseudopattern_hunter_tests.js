(function () {
  "use strict";

  var path = require('path');
  var pha = require('../core/lib/pseudopattern_hunter');
  var pa = require('../core/lib/pattern_assembler');
  var object_factory = require('../core/lib/object_factory');

  exports['pseudopattern_hunter'] = {
    'pseudopattern found and added as a pattern' : function(test){
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
      pl.dataKeys = [];
      pl.config.debug = false;
      pl.patterns = [];
      pl.config.patternStates = {};

      var atomFile = path.resolve('test/files/_patterns/00-test/03-styled-atom.mustache');
      var atomVariantFile = path.resolve('test/files/_patterns/00-test/03-styled-atom~alt.json');

      pattern_assembler.process_pattern_iterative(atomFile, pl);
      pattern_assembler.process_pattern_iterative(atomVariantFile, pl);

      //act
      pattern_assembler.process_pattern_recursive(atomFile, pl, 0, null, true);
      var atomPattern = pattern_assembler.get_pattern_by_key(atomFile, pl);
      var atomVariantPattern = pattern_assembler.get_pattern_by_key(atomVariantFile, pl);

      //assert
      test.equals(pl.patterns[1].key, 'test-styled-atom~alt');
      test.equals(pl.patterns[1].extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), '<span class="test_base {{styleModifier}}"> {{message}} </span>');
      test.equals(JSON.stringify(pl.patterns[1].jsonFileData), JSON.stringify({"message":"alternateMessage","link":{"test-styled-atom":"/patterns/00-test-03-styled-atom/00-test-03-styled-atom.html","test-styled-atom-alt":"/patterns/00-test-03-styled-atom~alt/00-test-03-styled-atom~alt.html"}}));

      test.done();
    }
  }
}());
