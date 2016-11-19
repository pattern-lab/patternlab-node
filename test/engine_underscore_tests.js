"use strict";

var tap = require('tap');
var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var testPatternsPath = path.resolve(__dirname, 'files', '_underscore-test-patterns');
var eol = require('os').EOL;
const util = require('./util/test_utils.js');

// don't run tests unless underscore is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.underscore) {
  tap.test('Underscore engine not installed, skipping tests', function (test) {
    test.end();
  });
  return;
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
  var patternlab = util.fakePatternLab(testPatternsPath);
  var assembler = new pa();

  return util.loadPatterns([patternPath], patternlab).then((patterns) => {
    test.equals(patterns[0].render(), 'Hello world!' + eol);
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
  var patternlab = util.fakePatternLab(testPatternsPath); // environment
  var assembler = new pa();

  // do all the normal processing of the pattern
  return util.loadPatterns([pattern1Path], patternlab).then(patterns => {
    // test
    test.equals(patterns[0].render(), 'Hello world!' + eol + 'Yeah, we got the subtitle from the JSON.' + eol);
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
  //arrange
  const testPatternsPath = path.resolve(__dirname, 'files', '_underscore-test-patterns');
  const pl = util.fakePatternLab(testPatternsPath);
  const pattern_assembler = new pa();

  const hiddenPatternPath = path.join('00-atoms', '00-global', '_00-hidden.html');
  const testPatternPath = path.join('00-molecules', '00-global', '00-hidden-pattern-tester.html');
  const patternPaths = [hiddenPatternPath, testPatternPath];

  return util.loadPatterns(patternPaths, pl).then(patterns => {
    test.equals(util.sanitized(patterns[1].render()), util.sanitized('Here\'s the hidden atom: [I\'m the hidden atom\n]\n'));
  });
});
