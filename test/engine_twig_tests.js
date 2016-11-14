"use strict";
/*eslint-disable dot-notation*/
/*eslint-disable no-shadow*/

var tap = require('tap');
var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var Pattern = require('../core/lib/object_factory').Pattern;
var eol = require('os').EOL;
var testPatternsPath;

// don't run these tests unless twig is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.twig) {
  tap.test('Twig engine not installed, skipping tests.', function (test) {
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
  testPatternsPath = fpl.config.paths.source.patterns = './test/files/_twig-test-patterns';

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
    '01-molecules/00-testing/00-test-mol.twig', // relative path now
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

  test.end();
}

tap.test('button twig pattern renders', function (test) {
  test.plan(1);

  var patternPath = path.join('00-atoms', '00-general', '08-button.twig');
  var expectedValue = '<style>' + eol + '  .btn {' + eol + '    padding: 10px;' + eol + '    border-radius: 10px;' + eol + '    display: inline-block;' + eol + '    text-align: center;' + eol + '  }' + eol + '</style>' + eol + eol + '<a href="#" class="btn">Button</a>' + eol;

  // do all the normal processing of the pattern
  var patternlab = new fakePatternLab();
  var assembler = new pa();
  var helloWorldPattern = assembler.process_pattern_iterative(testPatternsPath, patternPath, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, patternPath, patternlab);

  test.equals(helloWorldPattern.render(), expectedValue);
  test.end();
});

tap.test('media object twig pattern can see the atoms-button and atoms-image partials and renders them', function (test) {
  test.plan(1);

  // pattern paths
  var buttonPatternPath = path.join('00-atoms', '00-general', '08-button.twig');
  var imagePatternPath = path.join('00-atoms', '00-general', '09-image.twig');
  var mediaObjectPatternPath = path.join('00-molecules', '00-general', '00-media-object.twig');

  var expectedValue = '<style>\n  .Media {\n    display: flex;\n    align-items: flex-start;\n  }\n\n  .Media > img {\n    margin-right: 1em;\n    max-width: 200px;\n  }\n\n  .Media-body {\n    flex: 1;\n  }\n</style>\n\n\n\n\n<div class="Media">\n  <img src="http://placeholdit.imgix.net/~text?txtsize=33&txt=280%C3%97220&w=280&h=220&fm=pjpg"\n  srcset="http://placeholdit.imgix.net/~text?txtsize=33&txt=280%C3%97220&w=280&h=220&fm=pjpg 280w,\n          http://placeholdit.imgix.net/~text?txtsize=33&txt=560%C3%97440&w=560&h=440&fm=pjpg 560w,\n          http://placeholdit.imgix.net/~text?txtsize=33&txt=840%C3%97660&w=840&h=660&fm=pjpg 840w"\n  sizes="100vw">\n\n  <style>\n  .btn {\n    padding: 10px;\n    border-radius: 10px;\n    display: inline-block;\n    text-align: center;\n  }\n</style>\n\n<a href="#" class="btn">Button</a>\n\n\n  <div class="Media-body">\n\n    \n    \n\n    <p>Oh, hello world!</p>\n  </div>\n</div>\n';

  // set up environment
  var patternlab = new fakePatternLab(); // environment
  var assembler = new pa();

  // do all the normal processing of the pattern
  assembler.process_pattern_iterative(testPatternsPath, buttonPatternPath, patternlab);
  assembler.process_pattern_iterative(testPatternsPath, imagePatternPath, patternlab);
  var mediaObjectPattern = assembler.process_pattern_iterative(testPatternsPath, mediaObjectPatternPath, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, buttonPatternPath, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, imagePatternPath, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, mediaObjectPatternPath, patternlab);

  // test
  // this pattern is too long - so just remove line endings on both sides and compare output
  test.equals(mediaObjectPattern.render().replace(/\r?\n|\r/gm, ""), expectedValue.replace(/\r?\n|\r/gm, ""));
  test.end();
});

tap.test('twig partials can render JSON values', {skip: true}, function (test) {
  test.plan(1);

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
  var helloWorldWithData = assembler.process_pattern_iterative(testPatternsPath, pattern1Path, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, pattern1Path, patternlab);

  // test
  test.equals(helloWorldWithData.render(), 'Hello world!\nYeah, we got the subtitle from the JSON.\n');
  test.end();
});

tap.test('twig partials use the JSON environment from the calling pattern and can accept passed parameters', {skip: true}, function (test) {
  test.plan(1);

  // pattern paths
  var atomPath = path.resolve(
    testPatternsPath,
    '00-atoms',
    '00-global',
    '00-helloworld-withdata.hbs'
  );
  var molPath = path.resolve(
    testPatternsPath,
    '00-molecules',
    '00-global',
    '00-call-atom-with-molecule-data.hbs'
  );

  // set up environment
  var patternlab = new fakePatternLab(); // environment
  var assembler = new pa();

  // do all the normal processing of the pattern
  var atom = assembler.process_pattern_iterative(testPatternsPath, atomPath, patternlab);
  var mol = assembler.process_pattern_iterative(testPatternsPath, molPath, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, atomPath, patternlab);
  assembler.process_pattern_recursive(testPatternsPath, molPath, patternlab);

  // test
  test.equals(mol.render(), '<h2>Call with default JSON environment:</h2>\nThis is Hello world!\nfrom the default JSON.\n\n\n<h2>Call with passed parameter:</h2>\nHowever, this is Hello world!\nfrom a totally different blob.\n\n');
  test.end();
});

tap.test('find_pattern_partials finds partials', function (test) {
  testFindPartials(test, [
    '{% include "atoms-image" %}',
    "{% include 'atoms-image' %}",
    "{%include 'atoms-image'%}",
    "{% include 'molecules-template' only %}",
    "{% include 'organisms-sidebar' ignore missing %}",
    "{% include 'organisms-sidebar' ignore missing only %}"
  ]);
});

tap.test('find_pattern_partials finds verbose partials', function (test) {
  testFindPartials(test, [
    "{% include '01-molecules/06-components/03-comment-header.twig' %}",
    "{% include '00-atoms/00-global/06-test' %}"
  ]);
});

tap.test('find_pattern_partials finds partials with twig parameters', function (test) {
  testFindPartials(test, [
    "{% include 'molecules-template' with {'foo': 'bar'} %}",
    "{% include 'molecules-template' with vars %}",
    "{% include 'molecules-template.twig' with {'foo': 'bar'} only %}",
    "{% include 'organisms-sidebar' ignore missing with {'foo': 'bar'} %}"
  ]);
});

