'use strict';

var tap = require('tap');

var patternEngines = require('../core/lib/pattern_engines');
var Pattern = require('../core/lib/object_factory').Pattern;

// the mustache test pattern, stolen from object_factory unit tests
var mustacheTestPattern = new Pattern('', 'source/_patterns/00-atoms/00-global/00-colors-alt.mustache', {d: 123});
var mustacheTestPseudoPatternBasePattern = new Pattern('', 'source/_patterns/04-pages/00-homepage.mustache', {d: 123});
var mustacheTestPseudoPattern = new Pattern('', 'source/_patterns/04-pages/00-homepage~emergency.json', {d: 123});
mustacheTestPseudoPattern.isPseudoPattern = true;
mustacheTestPseudoPattern.basePattern = mustacheTestPseudoPatternBasePattern;
var engineNames = Object.keys(patternEngines);

tap.test('getEngineNameForPattern returns "mustache" from test pattern', function (test) {
  var engineName = patternEngines.getEngineNameForPattern(mustacheTestPattern);
  test.equals(engineName, 'mustache');
  test.end();
});

tap.test('getEngineNameForPattern returns "mustache" for a plain string template as a backwards compatibility measure', function (test) {
  test.plan(1);
  test.equals(patternEngines.getEngineNameForPattern('plain text string'), 'mustache');
  test.end();
});

tap.test('getEngineNameForPattern returns "mustache" for an artificial empty template', function (test) {
  test.plan(1);
  var emptyPattern = Pattern.createEmpty();
  test.equals(patternEngines.getEngineNameForPattern(emptyPattern), 'mustache');
  test.end();
});

tap.test('getEngineForPattern returns a reference to the mustache engine from test pattern', function (test) {
  var engine = patternEngines.getEngineForPattern(mustacheTestPattern);
  test.equals(engine, patternEngines.mustache);
  test.end();
});

tap.test('getEngineForPattern returns a reference to the mustache engine from test pseudo-pattern', function (test) {
  var engine = patternEngines.getEngineForPattern(mustacheTestPseudoPattern);
  test.equals(engine, patternEngines.mustache);
  test.end();
});

tap.test('isPseudoPatternJSON correctly identifies pseudo-pattern JSON filenames', function(test) {
  // each test case
  var filenames = {
    '00-homepage~emergency.json': true,
    '~emergency.json': true,
    '00-homepage~emergency.js': false,
    '00-homepage-emergency.js': false,
    '00-homepage.hbs': false,
    '00-homepage.json': false,
    'greatpic.jpg': false
  };
  // expect one test per test case
  test.plan(Object.keys(filenames).length);

  // loop over each test case and test it
  Object.keys(filenames).forEach(function (filename) {
    var expectedResult = filenames[filename],
        actualResult = patternEngines.isPseudoPatternJSON(filename),
        testMessage = 'isPseudoPatternJSON should return ' + expectedResult + ' for ' + filename;
    test.strictEqual(actualResult, expectedResult, testMessage);
  });

  // done
  test.end();
});

tap.test('isPatternFile correctly identifies pattern files and rejects non-pattern files', function(test){
  // each test case
  var filenames = {
    '00-comment-thread.mustache': true,
    '00-comment-thread.fakeextthatdoesntexist': false,
    '00-comment-thread': false,
    '_00-comment-thread.mustache': true,
    '.00-comment-thread.mustache': false,
    '00-comment-thread.json': false,
    '00-homepage~emergency.json': true
  };
  // expect one test per test case
  test.plan(Object.keys(filenames).length);

  // loop over each test case and test it
  Object.keys(filenames).forEach(function (filename) {
    var expectedResult = filenames[filename],
        actualResult = patternEngines.isPatternFile(filename),
        testMessage = 'isPatternFile should return ' + expectedResult + ' for ' + filename;
    test.strictEqual(actualResult, expectedResult, testMessage);
  });

  // done
  test.end();
});

// testProps() utility function: given an object, and a hash of expected
// 'property name':'property type' pairs, verify that the object contains each
// expected property, and that each property is of the expected type.
function testProps(object, propTests, test) {

  // function to test each expected property is present and the correct type
  function testProp(propName, types) {

    var possibleTypes;

    // handle "types" being a string or an array of strings
    if (types instanceof Array) {
      possibleTypes = types;
    } else {
      // "types" is just a single string, load it into an array; the rest of
      // the code expects it!
      possibleTypes = [types];
    }

    var isOneOfTheseTypes = possibleTypes.map(function (type) {
      return typeof object[propName] === type;
    }).reduce(function(isPrevType, isCurrentType) {
      return isPrevType || isCurrentType;
    });

    test.ok(object.hasOwnProperty(propName), '"' + propName + '" prop should be present');
    test.ok(isOneOfTheseTypes, '"' + propName + '" prop should be one of types ' + possibleTypes);
  }

  // go over each property test and run it
  Object.keys(propTests).forEach(function (propName) {
    var propType = propTests[propName];
    testProp(propName, propType);
  });
}

tap.test('patternEngines object contains at least the default mustache engine', function (test) {
  test.plan(1);
  test.ok(patternEngines.hasOwnProperty('mustache'));
  test.end();
});

tap.test('patternEngines object reports that it supports the .mustache extension', function (test) {
  test.plan(1);
  test.ok(patternEngines.isFileExtensionSupported('.mustache'));
  test.end();
});

// make one big test group for each pattern engine
engineNames.forEach(function (engineName) {
  tap.test('engine ' + engineName + ' contains expected properties and methods', function (test) {

      var propertyTests = {
        'engine': ['object', 'function'],
        'engineName': 'string',
        'engineFileExtension': 'string',
        'renderPattern': 'function',
        'findPartials': 'function'
      };

      test.plan(Object.keys(propertyTests).length * 2);
      testProps(patternEngines[engineName], propertyTests, test);
      test.end();
  });
});

