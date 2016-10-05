"use strict";

var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var Pattern = require('../core/lib/object_factory').Pattern;
var testPatternsPath = path.resolve(__dirname, 'files', '_handlebars-test-patterns');
var eol = require('os').EOL;

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


// function for testing sets of partials
function testFindPartials(test, partialTests) {
  test.expect(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // http://patternlab.io/docs/pattern-including.html
  var currentPattern = Pattern.create(
    '01-molecules/00-testing/00-test-mol.hbs', // relative path now
    null, // data
    {
      template: partialTests.join()
    }
  );

  // act
  var results = currentPattern.findPartials();

  // assert
  test.equals(results.length, partialTests.length);
  partialTests.forEach(function (testString, index) {
    test.equals(results[index], testString);
  });

  test.done();
}

exports['engine_handlebars'] = {
  'hello world handlebars pattern renders': function (test) {
    test.expect(1);

    var patternPath = path.join('00-atoms', '00-global', '00-helloworld.hbs');

    // do all the normal processing of the pattern
    var patternlab = new fakePatternLab();
    var assembler = new pa();
    var helloWorldPattern = assembler.process_pattern_iterative(patternPath, patternlab);
    assembler.process_pattern_recursive(patternPath, patternlab);

    test.equals(helloWorldPattern.render(), 'Hello world!' + eol);
    test.done();
  },
  'hello worlds handlebars pattern can see the atoms-helloworld partial and renders it twice': function (test) {
    test.expect(1);

    // pattern paths
    var pattern1Path = path.join('00-atoms', '00-global', '00-helloworld.hbs');
    var pattern2Path = path.join('00-molecules', '00-global', '00-helloworlds.hbs');

    // set up environment
    var patternlab = new fakePatternLab(); // environment
    var assembler = new pa();

    // do all the normal processing of the pattern
    assembler.process_pattern_iterative(pattern1Path, patternlab);
    var helloWorldsPattern = assembler.process_pattern_iterative(pattern2Path, patternlab);
    assembler.process_pattern_recursive(pattern1Path, patternlab);
    assembler.process_pattern_recursive(pattern2Path, patternlab);

    // test
    test.equals(helloWorldsPattern.render(), 'Hello world!' + eol + ' and Hello world!' + eol + eol);
    test.done();
  },
  'handlebars partials can render JSON values': function (test) {
    test.expect(1);

    // pattern paths
    var pattern1Path = path.join('00-atoms', '00-global', '00-helloworld-withdata.hbs');

    // set up environment
    var patternlab = new fakePatternLab(); // environment
    var assembler = new pa();

    // do all the normal processing of the pattern
    var helloWorldWithData = assembler.process_pattern_iterative(pattern1Path, patternlab);
    assembler.process_pattern_recursive(pattern1Path, patternlab);

    // test
    test.equals(helloWorldWithData.render(), 'Hello world!' + eol + 'Yeah, we got the subtitle from the JSON.' + eol);
    test.done();
  },
  'handlebars partials use the JSON environment from the calling pattern and can accept passed parameters': function (test) {
    test.expect(1);

    // pattern paths
    var atomPath = path.join('00-atoms', '00-global', '00-helloworld-withdata.hbs');
    var molPath = path.join('00-molecules', '00-global', '00-call-atom-with-molecule-data.hbs');

    // set up environment
    var patternlab = new fakePatternLab(); // environment
    var assembler = new pa();

    // do all the normal processing of the pattern
    assembler.process_pattern_iterative(atomPath, patternlab);
    var mol = assembler.process_pattern_iterative(molPath, patternlab);
    assembler.process_pattern_recursive(atomPath, patternlab);
    assembler.process_pattern_recursive(molPath, patternlab);

    // test
    test.equals(mol.render(), '<h2>Call with default JSON environment:</h2>' + eol + 'This is Hello world!' + eol + 'from the default JSON.' + eol + eol + eol +'<h2>Call with passed parameter:</h2>' + eol + 'However, this is Hello world!' + eol + 'from a totally different blob.' + eol + eol);
    test.done();
  },
  'find_pattern_partials finds partials': function (test) {
    testFindPartials(test, [
      "{{> molecules-comment-header}}",
      "{{>  molecules-comment-header}}",
      "{{> " + eol + "	molecules-comment-header" + eol + "}}",
      "{{>  molecules-weird-spacing     }}",
      "{{>  molecules-ba_d-cha*rs     }}"
    ]);
  },
  'find_pattern_partials finds verbose partials': function (test) {
    testFindPartials(test, [
      '{{> 01-molecules/06-components/03-comment-header.hbs }}',
      "{{> 01-molecules/06-components/02-single-comment.hbs(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
      '{{> molecules-single-comment:foo }}',
      "{{>atoms-error(message: 'That\'s no moon...')}}",
      "{{> atoms-error(message: 'That\'s no moon...') }}",
      '{{> 00-atoms/00-global/06-test }}'
    ]);
  },
  'find_pattern_partials finds simple partials with parameters': function (test) {
    testFindPartials(test, [
      "{{> molecules-single-comment(description: 'A life isn\'t like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
      '{{> molecules-single-comment(description:"A life is like a \"garden\". Perfect moments can be had, but not preserved, except in memory.") }}'
    ]);
  },
  'find_pattern_partials finds simple partials with style modifiers': function (test) {
    testFindPartials(test, [
      '{{> molecules-single-comment:foo }}'
    ]);
  },
  'find_pattern_partials finds partials with handlebars parameters': function (test) {
    testFindPartials(test, [
      '{{> atoms-title title="bravo" headingLevel="2" headingSize="bravo" position="left"}}',
      '{{> atoms-title title="bravo"' + eol + '  headingLevel="2"' + eol + '  headingSize="bravo"' + eol + '  position="left"}}',
      '{{> atoms-title title="color &nbsp;<span style=\'font-weight:normal\'>midnight blue</span>" headingSize="charlie"}}',
      '{{> atoms-input label="city" required=true}}',
      '{{> organisms-product-filter filterData}}',
      '{{> atoms-input email required=true}}',
      '{{> molecules-storycard variants.flex }}',
      '{{> myPartial name=../name }}'
    ]);
  },

  'find_pattern_partials finds handlebars block partials': function (test) {
    testFindPartials(test, [
      '{{#> myPartial }}'
    ]);
  },
  'hidden handlebars patterns can be called by their nice names' : function(test){
    const util = require('./util/test_utils.js');

    //arrange
    const testPatternsPath = path.resolve(__dirname, 'files', '_handlebars-test-patterns');
    const pl = util.fakePatternLab(testPatternsPath);
    var pattern_assembler = new pa();

    var hiddenPatternPath = path.join('00-atoms', '00-global', '_00-hidden.hbs');
    var hiddenPattern = pattern_assembler.process_pattern_iterative(hiddenPatternPath, pl);
    pattern_assembler.process_pattern_recursive(hiddenPatternPath, pl);

    var testPatternPath = path.join('00-molecules', '00-global', '00-hidden-pattern-tester.hbs');
    var testPattern = pattern_assembler.process_pattern_iterative(testPatternPath, pl);
    pattern_assembler.process_pattern_recursive(testPatternPath, pl);

    //act
    test.equals(testPattern.render(), 'Hello there!\nHere\'s the hidden atom: [This is the hidden atom]\n');

    //assert
    // test.equals(patternlab.patterns.length, 1);
    // test.equals(patternlab.partials['test-bar'] != undefined, true);
    // test.equals(patternlab.partials['test-bar'], 'bar');
    test.done();
  }
};


// don't run these tests unless handlebars is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.handlebars) {
  console.log("Handlebars engine not installed, skipping tests.");
  delete exports.engine_handlebars;
}
