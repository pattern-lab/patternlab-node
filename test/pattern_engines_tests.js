(function () {
  'use strict';

  var patternEngines = require('../builder/pattern_engines/pattern_engines');
  var of = require('../builder/object_factory');

  // the mustache test pattern, stolen from object_factory unit tests
  var mustacheTestPattern = new of.oPattern('source/_patterns/00-atoms/00-global/00-colors-alt.mustache', '00-atoms/00-global', '00-colors-alt.mustache', {d: 123});
  var engineNames = Object.keys(patternEngines);


  exports['patternEngines support functions'] = {
    'getEngineNameForPattern returns "mustache" from test pattern': function (test) {
      var engineName = patternEngines.getEngineNameForPattern(mustacheTestPattern);
      test.equals(engineName, 'mustache');
      test.done();
    },
    'getEngineForPattern returns a reference to the mustache engine from test pattern': function (test) {
      var engine = patternEngines.getEngineForPattern(mustacheTestPattern);
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
    }
  };

  // make one big test group for each pattern engine
  engineNames.forEach(function (engineName) {
    exports[engineName + ' patternEngine'] = {
      'engine contains expected properties and methods': function (test) {

        var propertyTests = {
          'engine': 'object',
          'name': 'string',
          'fileExtension': 'string',
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
