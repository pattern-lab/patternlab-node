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
    // GTP warning: unchanged copypasta from mustache engine
    'find_pattern_partials finds partials': function(test){
      // NOTES from GTP:
      // it's nice to have so much test coverage, but it retrospect, I'm not
      // happy with the structure I wound up with in this test; it's too
      // difficult to add test cases and test failure reporting is not very
      // granular.

      test.expect(16);

      // setup current pattern from what we would have during execution
      // docs on partial syntax are here:
      // http://patternlab.io/docs/pattern-including.html
      var currentPattern = object_factory.oPattern.create(
        '/home/fakeuser/pl/source/_patterns/01-molecules/00-testing/00-test-mol.hbs', // abspath
        '01-molecules\\00-testing', // subdir
        '00-test-mol.hbs', // filename,
        null, // data
        {
          template: "{{> molecules-comment-header}}asdfasdf" +
            "{{>  molecules-comment-header}}" +
            "{{> \n   molecules-comment-header\n}}" +
            "{{> }}" +
            "{{>  molecules-weird-spacing     }}" +
            "{{>  molecules-ba_d-cha*rs     }}" +
            "{{> molecules-single-comment(description: 'A life isn\\'t like a garden. Perfect moments can be had, but not preserved, except in memory.') }}" +
            '{{> molecules-single-comment(description: "A life is like a \\"garden\\". Perfect moments can be had, but not preserved, except in memory.") }}' +
            "{{> molecules-single-comment:foo }}" +
            // verbose partial syntax, introduced in v0.12.0, with file extension
            "{{> 01-molecules/06-components/03-comment-header.hbs }}" +
            "{{> 01-molecules/06-components/02-single-comment.hbs(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}" +
            "{{> molecules-single-comment:foo }}" +
            "{{>atoms-error(message: 'That\\'s no moon...')}}" +
            '{{>atoms-error(message: \'That\\\'s no moon...\')}}' +
            "{{> 00-atoms/00-global/ }}" +
            // verbose partial syntax, introduced in v0.12.0, no file extension
            "{{> 00-atoms/00-global/06-test }}" +
            "{{> molecules-single-comment:foo_1 }}" +
            "{{> molecules-single-comment:foo-1 }}"
        }
      );

      var results = currentPattern.findPartials();
      console.log(results);
      test.equals(results.length, 15);
      test.equals(results[0], "{{> molecules-comment-header}}");
      test.equals(results[1], "{{>  molecules-comment-header}}");
      test.equals(results[2], "{{> \n   molecules-comment-header\n}}");
      test.equals(results[3], "{{>  molecules-weird-spacing     }}");
      test.equals(results[4], "{{> molecules-single-comment(description: 'A life isn\\'t like a garden. Perfect moments can be had, but not preserved, except in memory.') }}");
      test.equals(results[5], '{{> molecules-single-comment(description: "A life is like a \\"garden\\". Perfect moments can be had, but not preserved, except in memory.") }}');
      test.equals(results[6], "{{> molecules-single-comment:foo }}");
      test.equals(results[7], "{{> 01-molecules/06-components/03-comment-header.hbs }}");
      test.equals(results[8], "{{> 01-molecules/06-components/02-single-comment.hbs(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}");
      test.equals(results[9], "{{> molecules-single-comment:foo }}");
      test.equals(results[10], "{{>atoms-error(message: 'That\\'s no moon...')}}");
      test.equals(results[11], "{{>atoms-error(message: 'That\\'s no moon...')}}");
      test.equals(results[12], "{{> 00-atoms/00-global/06-test }}");
      test.equals(results[13], '{{> molecules-single-comment:foo_1 }}');
      test.equals(results[14], '{{> molecules-single-comment:foo-1 }}');
      test.done();
    },
    // GTP warning: unchanged copypasta from mustache engine
    'find_pattern_partials finds verbose partials': function(test){
      test.expect(3);

      //setup current pattern from what we would have during execution
      var currentPattern = new object_factory.oPattern(
        '/home/fakeuser/pl/source/_patterns/01-molecules/00-testing/00-test-mol.hbs', // abspath
        '01-molecules\\00-testing', // subdir
        '00-test-mol.hbs', // filename,
        null // data
      );
      currentPattern.template = "<h1>{{> 01-molecules/06-components/03-comment-header.hbs }}</h1><div>{{> 01-molecules/06-components/02-single-comment.hbs(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}</div>";

      var results = currentPattern.findPartials();
      test.equals(results.length, 2);
      test.equals(results[0], '{{> 01-molecules/06-components/03-comment-header.hbs }}');
      test.equals(results[1], '{{> 01-molecules/06-components/02-single-comment.hbs(description: \'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.\') }}');
      test.done();
    },
    // GTP warning: unchanged copypasta from mustache engine
    'find_pattern_partials_with_parameters finds parameters with verbose partials': function(test){
      test.expect(2);

      //setup current pattern from what we would have during execution
      var currentPattern = new object_factory.oPattern(
        '/home/fakeuser/pl/source/_patterns/01-molecules/00-testing/00-test-mol.hbs', // abspath
        '01-molecules\\00-testing', // subdir
        '00-test-mol.hbs', // filename,
        null // data
      );
      currentPattern.template = "<h1>{{> 01-molecules/06-components/molecules-comment-header}}</h1><div>{{> 01-molecules/06-components/molecules-single-comment(bar:'baz') }}</div>";

      var results = currentPattern.findPartialsWithPatternParameters();
      test.equals(results.length, 1);
      test.equals(results[0], "{{> 01-molecules/06-components/molecules-single-comment(bar:'baz') }}");

      test.done();
    },
    // GTP warning: unchanged copypasta from mustache engine
    'find_pattern_partials_with_parameters finds no style modifiers when only partials present': function(test){
      test.expect(1);

      //setup current pattern from what we would have during execution
      var currentPattern = new object_factory.oPattern(
        '/home/fakeuser/pl/source/_patterns/01-molecules/00-testing/00-test-mol.hbs', // abspath
        '01-molecules\\00-testing', // subdir
        '00-test-mol.hbs', // filename,
        null // data
      );
      currentPattern.template = "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment }}</div>";

      var results = currentPattern.findPartialsWithPatternParameters();
      test.equals(results, null);

      test.done();
    }
  };
})();
