"use strict";

var tap = require('tap');
var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var PatternGraph = require('../core/lib/pattern_graph').PatternGraph;
var testPatternsPath = path.resolve(__dirname, 'files', '_underscore-test-patterns');
var eol = require('os').EOL;

// don't run tests unless underscore is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.underscore) {
  tap.test('Underscore engine not installed, skipping tests', function (test) {
    test.end();
  });
  return;
}

// fake pattern lab constructor:
// sets up a fake patternlab object, which is needed by the pattern processing
// apparatus.
function fakePatternLab() {
  var fpl = {
    graph: PatternGraph.empty(),
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

tap.test('hello world underscore pattern renders', function (test) {
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
  const helloWorldPattern = assembler.load_pattern_iterative(patternPath, patternlab);

  return assembler.process_pattern_iterative(helloWorldPattern, patternlab).then(() => {
    assembler.process_pattern_recursive(patternPath, patternlab);

    test.equals(helloWorldPattern.render(), 'Hello world!' + eol);
  });
});

tap.test('underscore partials can render JSON values', function (test) {

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
  const helloWorldWithData = assembler.load_pattern_iterative(pattern1Path, patternlab);
  return assembler.process_pattern_iterative(helloWorldWithData, patternlab).then(() => {
    assembler.process_pattern_recursive(pattern1Path, patternlab);

    // test
    test.equals(helloWorldWithData.render(), 'Hello world!' + eol + 'Yeah, we got the subtitle from the JSON.' + eol);
  });
});

tap.test('findPartial return the ID of the partial, given a whole partial call', function (test) {
  var engineLoader = require('../core/lib/pattern_engines');
  var underscoreEngine = engineLoader.underscore;

  test.plan(1);

  // do all the normal processing of the pattern
  // test
  test.equals(underscoreEngine.findPartial("<%= _.renderNamedPartial('molecules-details', obj) %>"), 'molecules-details');
  test.end();

});

tap.test('hidden underscore patterns can be called by their nice names', function(test){
  const util = require('./util/test_utils.js');

  //arrange
  const testPatternsPath = path.resolve(__dirname, 'files', '_underscore-test-patterns');
  const pl = util.fakePatternLab(testPatternsPath);
  var pattern_assembler = new pa();

  var hiddenPatternPath = path.join('00-atoms', '00-global', '_00-hidden.html');
  var testPatternPath = path.join('00-molecules', '00-global', '00-hidden-pattern-tester.html');

  var hiddenPattern = pattern_assembler.load_pattern_iterative(hiddenPatternPath, pl);
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  return Promise.all([
    pattern_assembler.process_pattern_iterative(hiddenPattern, pl),
    pattern_assembler.process_pattern_iterative(testPattern, pl)
  ]).then(() => {
    pattern_assembler.process_pattern_recursive(hiddenPatternPath, pl);
    pattern_assembler.process_pattern_recursive(testPatternPath, pl);

    //act
    test.equals(util.sanitized(testPattern.render()), util.sanitized('Here\'s the hidden atom: [I\'m the hidden atom\n]\n'));
    test.end();
  });
});
