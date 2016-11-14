"use strict";

var tap = require('tap');

var eol = require('os').EOL;
var Pattern = require('../core/lib/object_factory').Pattern;
var extend = require('util')._extend;
var patterns_dir = './test/files/_patterns';

function createFakePatternLab(customProps) {
  var pl = {
    config: {
      paths: {
        source: {
          patterns: patterns_dir
        },
        public: {
          patterns: './test/output'
        }
      },
      styleGuideExcludes: [ 'templates' ],
      debug: false,
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };
  return extend(pl, customProps);
}

var ui = require('../core/lib/ui_builder')();

tap.test('isPatternExcluded - returns true when pattern filename starts with underscore', function (test) {
  //arrange
  var patternlab = createFakePatternLab({});
  var pattern = new Pattern(patterns_dir, '00-test/_ignored-pattern.mustache');

  //act
  var result = ui.isPatternExcluded(pattern, patternlab);

  //assert
  test.equals(result, true);
  test.end();
});

tap.test('isPatternExcluded - returns true when pattern is defaultPattern', function (test) {
  //arrange
  var patternlab = createFakePatternLab({});
  var pattern = new Pattern(patterns_dir, '00-test/foo.mustache');
  patternlab.config.defaultPattern = 'test-foo';

  //act
  var result = ui.isPatternExcluded(pattern, patternlab);

  //assert
  test.equals(result, true);
  test.end();
});

tap.test('isPatternExcluded - returns true when pattern within underscored directory - top level', function (test) {
  //arrange
  var patternlab = createFakePatternLab({});
  var pattern = Pattern.createEmpty({
    relPath: '_hidden/patternsubtype/foo.mustache',
    isPattern: true,
    fileName : 'foo.mustache',
    patternPartial: 'hidden-foo'
  });

  //act
  var result = ui.isPatternExcluded(pattern, patternlab);

  //assert
  test.equals(result, true);
  test.end();
});

tap.test('isPatternExcluded - returns true when pattern within underscored directory - subtype level', function (test) {
  //arrange
  var patternlab = createFakePatternLab({});
  var pattern = Pattern.createEmpty({
    relPath: 'shown/_patternsubtype/foo.mustache',
    isPattern: true,
    fileName : 'foo.mustache',
    patternPartial: 'shown-foo'
  });

  //act
  var result = ui.isPatternExcluded(pattern, patternlab);

  //assert
  test.equals(result, true);
  test.end();
});

tap.test('groupPatterns - creates pattern groups correctly', function (test) {
  //arrange
  var patternlab = createFakePatternLab({
    patterns: [],
    patternGroups: {},
    subtypePatterns: {}
  });

  patternlab.patterns.push(
    new Pattern(patterns_dir, '00-test/foo.mustache'),
    new Pattern(patterns_dir, '00-test/bar.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/blue.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/red.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/yellow.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/black.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/grey.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/white.mustache')
  );
  ui.resetUIBuilderState(patternlab);

  //act
  var result = ui.groupPatterns(patternlab);

  //assert
  test.equals(result.patternGroups.patternType1.patternSubType1.blue.patternPartial, 'patternType1-blue');
  test.equals(result.patternGroups.patternType1.patternSubType1.red.patternPartial, 'patternType1-red');
  test.equals(result.patternGroups.patternType1.patternSubType1.yellow.patternPartial, 'patternType1-yellow');
  test.equals(result.patternGroups.patternType1.patternSubType2.black.patternPartial, 'patternType1-black');
  test.equals(result.patternGroups.patternType1.patternSubType2.grey.patternPartial, 'patternType1-grey');
  test.equals(result.patternGroups.patternType1.patternSubType2.white.patternPartial, 'patternType1-white');

  test.equals(patternlab.patternTypes[0].patternItems[0].patternPartial, 'test-bar');
  test.equals(patternlab.patternTypes[0].patternItems[1].patternPartial, 'test-foo');

  //todo: patternlab.patternTypes[0].patternItems[1] looks malformed

  test.end();
});

tap.test('groupPatterns - creates documentation patterns for each type and subtype if not exists', function (test) {
  //arrange
  var patternlab = createFakePatternLab({
    patterns: [],
    patternGroups: {},
    subtypePatterns: {}
  });

  patternlab.patterns.push(
    new Pattern(patterns_dir, '00-test/foo.mustache'),
    new Pattern(patterns_dir, '00-test/bar.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/blue.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/red.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/yellow.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/black.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/grey.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/white.mustache')
  );
  ui.resetUIBuilderState(patternlab);

  //act
  var result = ui.groupPatterns(patternlab);

  //assert
  test.equals(result.patternGroups.patternType1.patternSubType1['viewall-patternType1-patternSubType1'].patternPartial, 'viewall-patternType1-patternSubType1');
  test.equals(result.patternGroups.patternType1.patternSubType2['viewall-patternType1-patternSubType2'].patternPartial, 'viewall-patternType1-patternSubType2');

  test.end();
});

tap.test('groupPatterns - adds each pattern to the patternPaths object', function (test) {
  //arrange
  var patternlab = createFakePatternLab({
    patterns: [],
    patternGroups: {},
    subtypePatterns: {}
  });

  patternlab.patterns.push(
    new Pattern(patterns_dir, '00-test/foo.mustache'),
    new Pattern(patterns_dir, '00-test/bar.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/blue.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/red.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/yellow.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/black.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/grey.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/white.mustache')
  );
  ui.resetUIBuilderState(patternlab);

  //act
  var result = ui.groupPatterns(patternlab);

  //assert
  test.equals(patternlab.patternPaths['test']['foo'], '00-test-foo');
  test.equals(patternlab.patternPaths['test']['bar'], '00-test-bar');
  test.equals(patternlab.patternPaths['patternType1']['blue'], 'patternType1-patternSubType1-blue');
  test.equals(patternlab.patternPaths['patternType1']['red'], 'patternType1-patternSubType1-red');
  test.equals(patternlab.patternPaths['patternType1']['yellow'], 'patternType1-patternSubType1-yellow');
  test.equals(patternlab.patternPaths['patternType1']['black'], 'patternType1-patternSubType2-black');
  test.equals(patternlab.patternPaths['patternType1']['grey'], 'patternType1-patternSubType2-grey');
  test.equals(patternlab.patternPaths['patternType1']['white'], 'patternType1-patternSubType2-white');

  test.end();
});

tap.test('groupPatterns - adds each pattern to the view all paths object', function (test) {
  //arrange
  var patternlab = createFakePatternLab({
    patterns: [],
    patternGroups: {},
    subtypePatterns: {}
  });

  patternlab.patterns.push(
    new Pattern(patterns_dir, '00-test/foo.mustache'),
    new Pattern(patterns_dir, '00-test/bar.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/blue.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/red.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType1/yellow.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/black.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/grey.mustache'),
    new Pattern(patterns_dir, 'patternType1/patternSubType2/white.mustache')
  );
  ui.resetUIBuilderState(patternlab);

  //act
  var result = ui.groupPatterns(patternlab);

  //assert
  test.equals('todo', 'todo');

  test.end();
});

tap.test('resetUIBuilderState - reset global objects', function (test) {
  //arrange
  var patternlab = createFakePatternLab({
    patternPaths: { foo: 1},
    viewAllPaths: { bar: 2},
    patternTypes: ['baz']
  });

  //act
  ui.resetUIBuilderState(patternlab);

  //assert
  test.equals(patternlab.patternPaths.foo, undefined);
  test.equals(patternlab.viewAllPaths.bar, undefined);
  test.equals(patternlab.patternTypes.length, 0);

  test.end();
});
