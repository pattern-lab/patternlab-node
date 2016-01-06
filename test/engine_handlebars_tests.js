(function () {
  "use strict";

  var path = require('path');
  var pa = require('../builder/pattern_assembler');
  var object_factory = require('../builder/object_factory');
  var testPatternsPath = path.resolve(__dirname, 'files', '_handlebars-test-patterns');

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
      config: require('../config.json'),
      package: {}
    };

    // patch the pattern source so the pattern assembler can correctly determine
    // the "subdir"
    fpl.config.patterns.source = './test/files/_handlebars-test-patterns';

    return fpl;
  }


  // function for testing sets of partials
  function testFindPartials(test, partialTests) {
    test.expect(partialTests.length + 1);

    // setup current pattern from what we would have during execution
    // docs on partial syntax are here:
    // http://patternlab.io/docs/pattern-including.html
    var currentPattern = object_factory.oPattern.create(
      '/home/fakeuser/pl/source/_patterns/01-molecules/00-testing/00-test-mol.hbs', // abspath
      '01-molecules\\00-testing', // subdir
      '00-test-mol.hbs', // filename,
      null, // data
      {
        template: partialTests.join()
      }
    );

    // act
    var results = currentPattern.findPartials();

    // assert
    test.equals(results.length, partialTests.length);
    partialTests.forEach(function(testString, index) {
      test.equals(results[index], testString);
    });

    test.done();
  }

  exports['engine_handlebars'] = {
    'hello world handlebars pattern renders': function (test) {
      test.expect(1);

      var patternPath = path.resolve(
        testPatternsPath,
        '00-atoms',
        '00-global',
        '00-helloworld.hbs'
      );

      // do all the normal processing of the pattern
      var patternlab = new fakePatternLab();
      var assembler = new pa();
      var helloWorldPattern = assembler.process_pattern_iterative(patternPath, patternlab);
      assembler.process_pattern_recursive(patternPath, patternlab);

      test.equals(helloWorldPattern.render(), 'Hello world!\n');
      test.done();
    },
    'hello worlds handlebars pattern can see the atoms-helloworld partial and renders it twice': function (test) {
      test.expect(1);

      // pattern paths
      var pattern1Path = path.resolve(
        testPatternsPath,
        '00-atoms',
        '00-global',
        '00-helloworld.hbs'
      );
      var pattern2Path = path.resolve(
        testPatternsPath,
        '00-molecules',
        '00-global',
        '00-helloworlds.hbs'
      );

      // set up environment
      var patternlab = new fakePatternLab(); // environment
      var assembler = new pa();

      // do all the normal processing of the pattern
      assembler.process_pattern_iterative(pattern1Path, patternlab);
      var helloWorldsPattern = assembler.process_pattern_iterative(pattern2Path, patternlab);
      assembler.process_pattern_recursive(pattern1Path, patternlab);
      assembler.process_pattern_recursive(pattern2Path, patternlab);

      // test
      test.equals(helloWorldsPattern.render(), 'Hello world!\n and Hello world!\n\n');
      test.done();
    },
    'handlebars partials can render JSON values': function (test) {
      test.expect(1);

      // pattern paths
      var pattern1Path = path.resolve(
        testPatternsPath,
        '00-atoms',
        '00-global',
        '00-helloworld-withdata.hbs'
      );

      // set up environment
      var patternlab = new fakePatternLab(); // environment
      var assembler = new pa();

      // do all the normal processing of the pattern
      var helloWorldWithData = assembler.process_pattern_iterative(pattern1Path, patternlab);
      assembler.process_pattern_recursive(pattern1Path, patternlab);

      // test
      test.equals(helloWorldWithData.render(), 'Hello world!\nYeah, we got the subtitle from the JSON.\n');
      test.done();
    },
    'find_pattern_partials finds partials': function(test){
      testFindPartials(test, [
        "{{> molecules-comment-header}}",
        "{{>  molecules-comment-header}}",
        "{{> \n	molecules-comment-header\n}}",
        "{{>  molecules-weird-spacing     }}",
        "{{>  molecules-ba_d-cha*rs     }}"
      ]);
    },
    'find_pattern_partials finds verbose partials': function(test){
      testFindPartials(test, [
        '{{> 01-molecules/06-components/03-comment-header.hbs }}',
        "{{> 01-molecules/06-components/02-single-comment.hbs(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
        '{{> molecules-single-comment:foo }}',
        "{{>atoms-error(message: 'That\'s no moon...')}}",
        "{{> atoms-error(message: 'That\'s no moon...') }}",
        '{{> 00-atoms/00-global/06-test }}'
      ]);
    },
    'find_pattern_partials finds simple partials with parameters': function(test){
      testFindPartials(test, [
        "{{> molecules-single-comment(description: 'A life isn\'t like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
        '{{> molecules-single-comment(description:"A life is like a \"garden\". Perfect moments can be had, but not preserved, except in memory.") }}'
      ]);
    },
    'find_pattern_partials finds simple partials with style modifiers': function(test){
      testFindPartials(test, [
        '{{> molecules-single-comment:foo }}'
      ]);
    },
    'find_pattern_partials finds partials with handlebars parameters': function(test){
      testFindPartials(test, [
        '{{> atoms-title title="bravo" headingLevel="2" headingSize="bravo" position="left"}}',
        '{{> atoms-title title="bravo"\n  headingLevel="2"\n  headingSize="bravo"\n  position="left"}}',
        '{{> atoms-title title="color &nbsp;<span style=\'font-weight:normal\'>midnight blue</span>" headingSize="charlie"}}',
        '{{> atoms-input label="city" required=true}}',
        '{{> organisms-product-filter filterData}}',
        '{{> atoms-input email required=true}}',
        '{{> molecules-storycard variants.flex }}',
        '{{> myPartial name=../name }}'
      ]);
    },

    'find_pattern_partials finds handlebars block partials': function(test){
      testFindPartials(test, [
        '{{#> myPartial }}'
      ]);
    }
  };
})();
