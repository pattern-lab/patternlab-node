'use strict';

var tap = require('tap');

var patternEngines = require('../src/lib/pattern_engines');
var Pattern = require('../src/lib/object_factory').Pattern;
var config = require('./util/patternlab-config.json');

patternEngines.loadAllEngines(config);

// the handlebars test pattern, stolen from object_factory unit tests
var handlebarsTestPattern = new Pattern(
  'source/_patterns/atoms/global/colors-alt.hbs',
  { d: 123 }
);
var handlebarsTestPseudoPatternBasePattern = new Pattern(
  'source/_patterns/pages/homepage.hbs',
  { d: 123 }
);
var handlebarsTestPseudoPattern = new Pattern(
  'source/_patterns/pages/homepage~emergency.json',
  { d: 123 }
);
handlebarsTestPseudoPattern.isPseudoPattern = true;
handlebarsTestPseudoPattern.basePattern =
  handlebarsTestPseudoPatternBasePattern;
var engineNames = Object.keys(patternEngines);

tap.test(
  'getEngineNameForPattern returns "handlebars" from test pattern',
  function (test) {
    var engineName = patternEngines.getEngineNameForPattern(
      handlebarsTestPattern
    );
    test.equal(engineName, 'handlebars');
    test.end();
  }
);

tap.test(
  'getEngineNameForPattern returns "handlebars" for a plain string template as a backwards compatibility measure',
  function (test) {
    test.plan(1);
    test.equal(
      patternEngines.getEngineNameForPattern('plain text string'),
      'handlebars'
    );
    test.end();
  }
);

tap.test(
  'getEngineNameForPattern returns "handlebars" for an artificial empty template',
  function (test) {
    test.plan(1);
    var emptyPattern = Pattern.createEmpty();
    test.equal(
      patternEngines.getEngineNameForPattern(emptyPattern),
      'handlebars'
    );
    test.end();
  }
);

tap.test(
  'getEngineForPattern returns a reference to the handlebars engine from test pattern',
  function (test) {
    var engine = patternEngines.getEngineForPattern(handlebarsTestPattern);
    test.equal(engine, patternEngines.hbs);
    test.end();
  }
);

tap.test(
  'getEngineForPattern returns a reference to the handlebars engine from test pseudo-pattern',
  function (test) {
    var engine = patternEngines.getEngineForPattern(
      handlebarsTestPseudoPattern
    );
    test.equal(engine, patternEngines.hbs);
    test.end();
  }
);

tap.test(
  'isPseudoPatternJSON correctly identifies pseudo-pattern JSON filenames',
  function (test) {
    // each test case
    var filenames = {
      'homepage~emergency.json': true,
      '~emergency.json': true,
      'homepage~emergency.js': false,
      'homepage-emergency.js': false,
      'homepage.hbs': false,
      'homepage.json': false,
      'greatpic.jpg': false,
    };
    // expect one test per test case
    test.plan(Object.keys(filenames).length);

    // loop over each test case and test it
    Object.keys(filenames).forEach(function (filename) {
      var expectedResult = filenames[filename],
        actualResult = patternEngines.isPseudoPatternJSON(filename),
        testMessage =
          'isPseudoPatternJSON should return ' +
          expectedResult +
          ' for ' +
          filename;
      test.strictEqual(actualResult, expectedResult, testMessage);
    });

    // done
    test.end();
  }
);

tap.test(
  'isPatternFile correctly identifies pattern files and rejects non-pattern files',
  function (test) {
    // each test case
    var filenames = {
      'comment-thread.hbs': true,
      'comment-thread.fakeextthatdoesntexist': false,
      'comment-thread': false,
      '_comment-thread.hbs': true,
      '.comment-thread.hbs': false,
      'comment-thread.json': false,
      'homepage~emergency.json': true,
    };
    // expect one test per test case
    test.plan(Object.keys(filenames).length);

    // loop over each test case and test it
    Object.keys(filenames).forEach(function (filename) {
      var expectedResult = filenames[filename],
        actualResult = patternEngines.isPatternFile(filename),
        testMessage =
          'isPatternFile should return ' + expectedResult + ' for ' + filename;
      test.strictEqual(actualResult, expectedResult, testMessage);
    });

    // done
    test.end();
  }
);

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

    var isOneOfTheseTypes = possibleTypes
      .map(function (type) {
        return typeof object[propName] === type;
      })
      .reduce(function (isPrevType, isCurrentType) {
        return isPrevType || isCurrentType;
      });

    test.ok(
      object.hasOwnProperty(propName),
      '"' + propName + '" prop should be present'
    );
    test.ok(
      isOneOfTheseTypes,
      '"' +
        propName +
        '" prop should be one of types ' +
        possibleTypes +
        ' but was instead ' +
        typeof propName
    );
  }

  // go over each property test and run it
  Object.keys(propTests).forEach(function (propName) {
    var propType = propTests[propName];
    testProp(propName, propType);
  });
}

tap.test(
  'patternEngines object contains at least the default handlebars engine',
  function (test) {
    test.plan(1);
    test.ok(patternEngines.hasOwnProperty('handlebars'));
    test.end();
  }
);

tap.test(
  'patternEngines object reports that it supports the .hbs extension',
  function (test) {
    test.plan(1);
    test.ok(patternEngines.isFileExtensionSupported('.hbs'));
    test.end();
  }
);

// make one big test group for each pattern engine
engineNames.forEach(function (engineName) {
  tap.test(
    'engine ' + engineName + ' contains expected properties and methods',
    function (test) {
      var propertyTests = {
        engine: ['object', 'function'],
        engineName: 'string',
        engineFileExtension: ['string', 'object'],
        renderPattern: 'function',
        findPartials: 'function',
      };

      test.plan(Object.keys(propertyTests).length * 2);
      testProps(patternEngines[engineName], propertyTests, test);
      test.end();
    }
  );
});

tap.test(
  'patternEngines getSupportedFileExtensions flattens known engine extensions into a single array',
  function (test) {
    //arrange
    patternEngines.fooEngine = {
      engineFileExtension: ['.foo1', '.foo2'],
    };
    patternEngines.barEngine = {
      engineFileExtension: '.bar',
    };

    const exts = patternEngines.getSupportedFileExtensions();
    test.ok(exts.includes('.foo1'));
    test.ok(exts.includes('.foo2'));
    test.ok(exts.includes('.bar'));

    delete patternEngines.fooEngine;
    delete patternEngines.barEngine;

    test.end();
  }
);
