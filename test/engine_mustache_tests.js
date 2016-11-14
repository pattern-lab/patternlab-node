"use strict";
/*eslint-disable no-shadow*/

var tap  = require('tap');
var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var Pattern = require('../core/lib/object_factory').Pattern;
var testPatternsPath = path.resolve(__dirname, 'files', '_patterns');
var eol = require('os').EOL;

// don't run these tests unless mustache is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.mustache) {
  tap.test('Mustache engine not installed, skipping tests.', function (test) {
    test.end();
  });
  return;
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

// function for testing sets of partials
function testFindPartials(test, partialTests) {
  test.plan(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // http://patternlab.io/docs/pattern-including.html
  var currentPattern = Pattern.create(
    testPatternsPath,
    '01-molecules/00-testing/00-test-mol.mustache', // relative path now
    null, // data
    {
      template: partialTests.join(eol)
    }
  );

  // act
  var results = currentPattern.findPartials();

  // assert
  test.equals(results.length, partialTests.length);
  partialTests.forEach(function (testString, index) {
    test.equals(results[index], testString);
  });

  test.end();
}

function testFindPartialsWithStyleModifiers(test, partialTests) {
  test.plan(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // http://patternlab.io/docs/pattern-including.html
  var currentPattern = Pattern.create(
    testPatternsPath,
    '01-molecules/00-testing/00-test-mol.mustache', // relative path now
    null, // data
    {
      template: partialTests.join(eol)
    }
  );

  // act
  var results = currentPattern.findPartialsWithStyleModifiers();

  // assert
  test.equals(results.length, partialTests.length);
  partialTests.forEach(function (testString, index) {
    test.equals(results[index], testString);
  });

  test.end();
}

function testFindPartialsWithPatternParameters(test, partialTests) {
  test.plan(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // http://patternlab.io/docs/pattern-including.html
  var currentPattern = Pattern.create(
    testPatternsPath,
    '01-molecules/00-testing/00-test-mol.mustache', // relative path now
    null, // data
    {
      template: partialTests.join(eol)
    }
  );

  // act
  var results = currentPattern.findPartialsWithPatternParameters();

  // assert
  test.equals(results.length, partialTests.length);
  partialTests.forEach(function (testString, index) {
    test.equals(results[index], testString);
  });

  test.end();
}


tap.test('find_pattern_partials finds one simple partial', function (test) {
  testFindPartials(test, [
    "{{> molecules-comment-header}}"
  ]);
});

tap.test('find_pattern_partials finds simple partials under stressed circumstances', function (test) {
  testFindPartials(test, [
    "{{>molecules-comment-header}}",
    "{{> " + eol + " molecules-comment-header" + eol + "}}",
    "{{>      molecules-weird-spacing      }}"
  ]);
});

tap.test('find_pattern_partials finds one simple verbose partial', function (test) {
  testFindPartials(test, [
    '{{> 00-atoms/00-global/06-test }}'
  ]);
});

tap.test('find_pattern_partials finds partials with parameters', function (test) {
  testFindPartials(test, [
    "{{> molecules-single-comment(description: true) }}",
    "{{> molecules-single-comment(description: 42) }}",
    "{{> molecules-single-comment(description: '42') }}",
    "{{> molecules-single-comment(description: \"42\") }}",
    "{{> molecules-single-comment(description: 'test', anotherThing: 'retest') }}",
    "{{> molecules-single-comment(description: false, anotherThing: \"retest\") }}",
    '{{> molecules-single-comment(description:"A life is like a \"garden\". Perfect moments can be had, but not preserved, except in memory.") }}'
  ]);
});

tap.test('find_pattern_partials finds simple partials with style modifiers', function (test) {
  testFindPartials(test, [
    '{{> molecules-single-comment:foo }}',
    '{{> molecules-single-comment:foo|bar }}'
  ]);
});

tap.test('find_pattern_partials finds mixed partials', function (test) {
  testFindPartials(test, [
    '{{> molecules-single-comment:foo(description: "test", anotherThing: true) }}',
    '{{> molecules-single-comment:foo|bar(description: true) }}'
  ]);
});

tap.test('find_pattern_partials finds one simple partial with styleModifier', function (test) {
  testFindPartialsWithStyleModifiers(test, [
    "{{> molecules-comment-header:test}}"
  ]);
});

tap.test('find_pattern_partials finds partial with many styleModifiers', function (test) {
  testFindPartialsWithStyleModifiers(test, [
    "{{> molecules-comment-header:test|test2|test3}}"
  ]);
});

tap.test('find_pattern_partials finds partials with differing styleModifiers', function (test) {
  testFindPartialsWithStyleModifiers(test, [
    "{{> molecules-comment-header:test|test2|test3}}",
    "{{> molecules-comment-header:foo-1}}",
    "{{> molecules-comment-header:bar_1}}"
  ]);
});

tap.test('find_pattern_partials finds partials with styleModifiers when parameters present', function (test) {
  testFindPartialsWithStyleModifiers(test, [
    "{{> molecules-comment-header:test|test2|test3(description: true)}}",
    "{{> molecules-comment-header:foo-1(description: 'foo')}}",
    "{{> molecules-comment-header:bar_1(descrition: 'bar', anotherThing: 10102010) }}"
  ]);
});

tap.test('find_pattern_partials_with_parameters finds one simple partial with parameters', function (test) {
  testFindPartialsWithPatternParameters(test, [
    "{{> molecules-comment-header(description: 'test')}}"
  ]);
});

tap.test('find_pattern_partials_with_parameters finds partials with parameters', function (test) {
  testFindPartialsWithPatternParameters(test, [
    "{{> molecules-single-comment(description: true) }}",
    "{{> molecules-single-comment(description: 42) }}",
    "{{> molecules-single-comment(description: '42') }}",
    "{{> molecules-single-comment(description: \"42\") }}",
    "{{> molecules-single-comment(description: 'test', anotherThing: 'retest') }}",
    "{{> molecules-single-comment(description: false, anotherThing: \"retest\") }}",
    '{{> molecules-single-comment(description:"A life is like a \"garden\". Perfect moments can be had, but not preserved, except in memory.") }}'
  ]);
});

tap.test('find_pattern_partials finds partials with parameters when styleModifiers present', function (test) {
  testFindPartialsWithPatternParameters(test, [
    "{{> molecules-comment-header:test|test2|test3(description: true)}}",
    "{{> molecules-comment-header:foo-1(description: 'foo')}}",
    "{{> molecules-comment-header:bar_1(descrition: 'bar', anotherThing: 10102010) }}"
  ]);
});
