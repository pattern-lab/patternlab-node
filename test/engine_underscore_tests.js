"use strict";

var test = require('tape');
var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var testPatternsPath = path.resolve(__dirname, 'files', '_underscore-test-patterns');
var eol = require('os').EOL;

// don't run tests unless underscore is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.underscore) {
  test.only('Underscore engine not installed, skipping tests', function (test){
    test.end();
  });
}

// fake pattern lab constructor:
// sets up a fake patternlab object, which is needed by the pattern processing
// apparatus.
function fakePatternLab() {
  var fpl = {
    partials: {},
    patterns: [],
    footer: '',
    header: '',
    listitems: {},
    listItemArray: [],
    data: {
      link: {}
    },
    config: require('../patternlab-config.json'),
    package: {}
  };

  // patch the pattern source so the pattern assembler can correctly determine
  // the "subdir"
  fpl.config.paths.source.patterns = testPatternsPath;

  return fpl;
}

test('hello world underscore pattern renders', function (test) {
  test.plan(1);

  var patternPath = path.resolve(
    testPatternsPath,
    '00-atoms',
    '00-global',
    '00-helloworld.html'
  );

  // do all the normal processing of the pattern
  var patternlab = new fakePatternLab();
  var assembler = new pa();
  var helloWorldPattern = assembler.process_pattern_iterative(patternPath, patternlab);
  //test.comment(helloWorldPattern);
  assembler.process_pattern_recursive(patternPath, patternlab);

  test.equals(helloWorldPattern.render(), 'Hello world!' + eol);
  test.end();

});

test('underscore partials can render JSON values', function (test) {

  test.plan(1);

  // pattern paths
  var pattern1Path = path.resolve(
    testPatternsPath,
    '00-atoms',
    '00-global',
    '00-helloworld-withdata.html'
  );

  // set up environment
  var patternlab = new fakePatternLab(); // environment
  var assembler = new pa();

  // do all the normal processing of the pattern
  var helloWorldWithData = assembler.process_pattern_iterative(pattern1Path, patternlab);
  assembler.process_pattern_recursive(pattern1Path, patternlab);

  // test
  test.equals(helloWorldWithData.render(), 'Hello world!' + eol + 'Yeah, we got the subtitle from the JSON.' + eol);
  test.end();

});

test('findPartial return the ID of the partial, given a whole partial call', function (test) {
  var engineLoader = require('../core/lib/pattern_engines');
  var underscoreEngine = engineLoader.underscore;

  test.plan(1);

  // do all the normal processing of the pattern
  // test
  test.equals(underscoreEngine.findPartial("<%= _.renderNamedPartial('molecules-details', obj) %>"), 'molecules-details');
  test.end();

});

