"use strict";

var eol = require('os').EOL;
var Pattern = require('../core/lib/object_factory').Pattern;
var extend = require('util')._extend;

function createFakePatternLab(customProps) {
  var pl = {
  };
  return extend(pl, customProps);
}

var patternlab = createFakePatternLab({
  config: {
    paths: {
      source: {
        patterns: './test/files/_patterns'
      }
    },
    styleGuideExcludes: [ 'templates' ],
    debug: true
  }
});
var ui = require('../core/lib/ui_builder')(patternlab);

exports['ui_builder'] = {

  'isPatternExcluded - returns true when pattern filename starts with underscore': function (test) {
    //arrange
    var pattern = new Pattern('00-test/_ignored-pattern.mustache');

    //act
    var result = ui.isPatternExcluded(pattern, patternlab);

    //assert
    test.equals(result, true);
    test.done();
  },

  'isPatternExcluded - returns true when pattern is defaultPattern': function (test) {
    //arrange
    var pattern = new Pattern('00-test/foo.mustache');
    patternlab.config.defaultPattern = 'test-foo';

    //act
    var result = ui.isPatternExcluded(pattern, patternlab);

    //assert
    test.equals(result, true);
    test.done();
  },

  'isPatternExcluded - returns true when patterngroup is specified in styleguideExcludes': function (test) {
    //arrange
    var pattern = new Pattern('00-test/foo.mustache');
    patternlab.config.defaultPattern = 'test-boaz';
    patternlab.config.styleGuideExcludes.push('test');

    //act
    var result = ui.isPatternExcluded(pattern, patternlab);

    //assert
    test.equals(result, true);
    test.done();
  },

};
