(function () {
  'use strict';

  var patternEngines = require('../builder/pattern_engines/pattern_engines');
  var of = require('../builder/object_factory');

  // the mustache test pattern, stolen from object_factory unit tests
  var mustacheTestPattern = new of.oPattern('source/_patterns/00-atoms/00-global/00-colors-alt.mustache', '00-atoms/00-global', '00-colors-alt.mustache', {d: 123});
  var mustacheTestPseudoPatternBasePattern = new of.oPattern('source/_patterns/04-pages/00-homepage.mustache', '04-pages', '00-homepage.mustache', {d: 123});
  var mustacheTestPseudoPattern = new of.oPattern('source/_patterns/04-pages/00-homepage~emergency.json', '04-pages', '00-homepage-emergency.', {d: 123});
  mustacheTestPseudoPattern.isPseudoPattern = true;
  mustacheTestPseudoPattern.basePattern = mustacheTestPseudoPatternBasePattern;
  var engineNames = Object.keys(patternEngines);


  exports['patternEngines support functions'] = {
    'getEngineNameForPattern returns "mustache" from test pattern': function (test) {
      var engineName = patternEngines.getEngineNameForPattern(mustacheTestPattern);
      test.equals(engineName, 'mustache');
      test.done();
    },
    'getEngineNameForPattern returns "mustache" for a plain string template as a backwards compatibility measure': function (test) {
      test.expect(1);
      test.equals(patternEngines.getEngineNameForPattern('plain text string'), 'mustache');
      test.done();
    },
    'getEngineNameForPattern returns "mustache" for an artificial empty template': function (test) {
      test.expect(1);
      var emptyPattern = of.oPattern.createEmpty();
      console.log(emptyPattern);
      test.equals(patternEngines.getEngineNameForPattern(emptyPattern), 'mustache');
      test.done();
    },
    'getEngineForPattern returns a reference to the mustache engine from test pattern': function (test) {
      var engine = patternEngines.getEngineForPattern(mustacheTestPattern);
      test.equals(engine, patternEngines.mustache);
      test.done();
    },
    'getEngineForPattern returns a reference to the mustache engine from test pseudo-pattern': function (test) {
      var engine = patternEngines.getEngineForPattern(mustacheTestPseudoPattern);
      test.equals(engine, patternEngines.mustache);
      test.done();
    }
  };

  // testProps() utility function: given an object, and a hash of expected
  // 'property name':'property type' pairs, verify that the object contains each
  // expected property, and that each property is of the expected type.
  function testProps(object, propTests, test) {

    // function to test each expected property is present and the correct type
    function testProp(propName, typeString) {
      test.ok(object.hasOwnProperty(propName), '"' + propName + '" prop should be present');
      test.ok(typeof object[propName] === typeString, '"' + propName + '" prop should be of type ' + typeString);
    }

    // go over each property test and run it
    Object.keys(propTests).forEach(function (propName) {
      var propType = propTests[propName];
      testProp(propName, propType);
    });
  }

  exports['patternEngines initialization'] = {
    'patternEngines object contains at least the default mustache engine': function (test) {
      test.expect(1);
      test.ok(patternEngines.hasOwnProperty('mustache'));
      test.done();
    },
    'patternEngines object reports that it supports the .mustache extension': function (test) {
      test.expect(1);
      test.ok(patternEngines.isFileExtensionSupported('.mustache'));
      test.done();
    }
  };

  // make one big test group for each pattern engine
  engineNames.forEach(function (engineName) {
    exports[engineName + ' patternEngine'] = {
      'engine contains expected properties and methods': function (test) {

        var propertyTests = {
          'engine': 'object',
          'engineName': 'string',
          'engineFileExtension': 'string',
          'renderPattern': 'function',
          'findPartials': 'function'
        };

        test.expect(Object.keys(propertyTests).length * 2);
        testProps(patternEngines[engineName], propertyTests, test);
        test.done();
      }
    };
  });

})();
