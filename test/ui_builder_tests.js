"use strict";

var eol = require('os').EOL;
var Pattern = require('../core/lib/object_factory').Pattern;
var extend = require('util')._extend;

function createFakePatternLab(customProps) {
  var pl = {
    config: {
      paths: {
        source: {
          patterns: './test/files/_patterns'
        },
        public: {
          patterns: './test/output'
        }
      },
      styleGuideExcludes: [ 'templates' ],
      debug: false
    }
  };
  return extend(pl, customProps);
}

var ui = require('../core/lib/ui_builder')();

exports['ui_builder'] = {

  'isPatternExcluded - returns true when pattern filename starts with underscore': function (test) {
    //arrange
    var patternlab = createFakePatternLab({});
    var pattern = new Pattern('00-test/_ignored-pattern.mustache');

    //act
    var result = ui.isPatternExcluded(pattern, patternlab);

    //assert
    test.equals(result, true);
    test.done();
  },

  'isPatternExcluded - returns true when pattern is defaultPattern': function (test) {
    //arrange
    var patternlab = createFakePatternLab({});
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
    var patternlab = createFakePatternLab({});
    var pattern = new Pattern('00-test/foo.mustache');
    patternlab.config.defaultPattern = 'test-boaz';
    patternlab.config.styleGuideExcludes.push('test');

    //act
    var result = ui.isPatternExcluded(pattern, patternlab);

    //assert
    test.equals(result, true);
    test.done();
  },

  'groupPatterns - creates pattern groups correctly': function (test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subtypePatterns: {}
    });

    patternlab.patterns.push(
      new Pattern('00-test/foo.mustache'),
      new Pattern('00-test/bar.mustache'),
      new Pattern('patternType1/patternSubType1/blue.mustache'),
      new Pattern('patternType1/patternSubType1/red.mustache'),
      new Pattern('patternType1/patternSubType1/yellow.mustache'),
      new Pattern('patternType1/patternSubType2/black.mustache'),
      new Pattern('patternType1/patternSubType2/grey.mustache'),
      new Pattern('patternType1/patternSubType2/white.mustache')
    );

    //act
    var result = ui.groupPatterns(patternlab);

    //assert
    test.equals(result.patternGroups.test.test.foo.patternPartial, 'test-foo');
    test.equals(result.patternGroups.test.test.bar.patternPartial, 'test-bar');
    test.equals(result.patternGroups.patternType1.patternSubType1.blue.patternPartial, 'patternType1-blue');
    test.equals(result.patternGroups.patternType1.patternSubType1.red.patternPartial, 'patternType1-red');
    test.equals(result.patternGroups.patternType1.patternSubType1.yellow.patternPartial, 'patternType1-yellow');
    test.equals(result.patternGroups.patternType1.patternSubType2.black.patternPartial, 'patternType1-black');
    test.equals(result.patternGroups.patternType1.patternSubType2.grey.patternPartial, 'patternType1-grey');
    test.equals(result.patternGroups.patternType1.patternSubType2.white.patternPartial, 'patternType1-white');

    test.done();
  },

  'groupPatterns - creates documentation patterns for each type and subtype if not exists': function (test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subtypePatterns: {}
    });

    patternlab.patterns.push(
      new Pattern('00-test/foo.mustache'),
      new Pattern('00-test/bar.mustache'),
      new Pattern('patternType1/patternSubType1/blue.mustache'),
      new Pattern('patternType1/patternSubType1/red.mustache'),
      new Pattern('patternType1/patternSubType1/yellow.mustache'),
      new Pattern('patternType1/patternSubType2/black.mustache'),
      new Pattern('patternType1/patternSubType2/grey.mustache'),
      new Pattern('patternType1/patternSubType2/white.mustache')
    );

    //act
    var result = ui.groupPatterns(patternlab);

    //assert
    test.equals(result.patternGroups.patternType1.patternSubType1['viewall-patternType1-patternSubType1'].patternPartial, 'viewall-patternType1-patternSubType1');
    test.equals(result.patternGroups.patternType1.patternSubType2['viewall-patternType1-patternSubType2'].patternPartial, 'viewall-patternType1-patternSubType2');

    test.done();
  },

  'buildViewAllPages2 - does something': function (test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subtypePatterns: {},
      header: 'Header',
      userHead: 'Head',
      footer: 'Footer',
      userFoot: 'Foot'
    });

    patternlab.patterns.push(
      //new Pattern('00-test/foo.mustache'),
      //new Pattern('00-test/bar.mustache'),
      new Pattern('patternType1/patternSubType1/blue.mustache'),
      new Pattern('patternType1/patternSubType1/red.mustache'),
      new Pattern('patternType1/patternSubType1/yellow.mustache'),
      new Pattern('patternType1/patternSubType2/black.mustache'),
      new Pattern('patternType1/patternSubType2/grey.mustache'),
      new Pattern('patternType1/patternSubType2/white.mustache')
    );

    //act
    ui.buildFrontend2(patternlab);

    //assert

    test.done();
  }

};
