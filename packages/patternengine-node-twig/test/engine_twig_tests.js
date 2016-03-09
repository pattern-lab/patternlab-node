"use strict";
/*eslint-disable dot-notation*/

// don't run these tests unless twig is installed
try { var twig = require('twig'); }
catch (err) { return; }

var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var object_factory = require('../core/lib/object_factory');
var testPatternsPath = path.resolve(__dirname, 'files', '_twig-test-patterns');

try {
  require('twig');
} catch (err) {
  console.log('twig renderer not installed; skipping tests');
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
  fpl.config.paths.source.patterns = './test/files/_twig-test-patterns';

  return fpl;
}


// function for testing sets of partials
function testFindPartials(test, partialTests) {
  test.expect(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // http://patternlab.io/docs/pattern-including.html
  var currentPattern = object_factory.oPattern.create(
    '/home/fakeuser/pl/source/_patterns/01-molecules/00-testing/00-test-mol.twig', // abspath
    '01-molecules\\00-testing', // subdir
    '00-test-mol.twig', // filename,
    null, // data
    {
      template: partialTests.join()
    }
  );

  // act
  var results = currentPattern.findPartials();

  // assert
  debugger;
  test.equals(results.length, partialTests.length);
  partialTests.forEach(function (testString, index) {
    test.equals(results[index], testString);
  });

  test.done();
}

exports['engine_twig'] = {
  'button twig pattern renders': function (test) {
    test.expect(1);

    var patternPath = path.resolve(
      testPatternsPath,
      '00-atoms',
      '00-general',
      '08-button.twig'
    );

    var expectedValue = '<style>\n  .btn {\n    padding: 10px;\n    border-radius: 10px;\n    display: inline-block;\n    text-align: center;\n  }\n</style>\n\n<a href="#" class="btn">Button</a>\n';

    // do all the normal processing of the pattern
    var patternlab = new fakePatternLab();
    var assembler = new pa();
    var helloWorldPattern = assembler.process_pattern_iterative(patternPath, patternlab);
    assembler.process_pattern_recursive(patternPath, patternlab);

    test.equals(helloWorldPattern.render(), expectedValue);
    test.done();
  },
  'media object twig pattern can see the atoms-button and atoms-image partials and renders them': function (test) {
    test.expect(1);

    // pattern paths
    var buttonPatternPath = path.resolve(
      testPatternsPath,
      '00-atoms',
      '00-general',
      '08-button.twig'
    );
    var imagePatternPath = path.resolve(
      testPatternsPath,
      '00-atoms',
      '00-general',
      '09-image.twig'
    );
    var mediaObjectPatternPath = path.resolve(
      testPatternsPath,
      '00-molecules',
      '00-general',
      '00-media-object.twig'
    );

    var expectedValue = '<style>\n  .Media {\n    display: flex;\n    align-items: flex-start;\n  }\n\n  .Media > img {\n    margin-right: 1em;\n    max-width: 200px;\n  }\n\n  .Media-body {\n    flex: 1;\n  }\n</style>\n\n\n\n\n<div class="Media">\n  <img src="http://placeholdit.imgix.net/~text?txtsize=33&txt=280%C3%97220&w=280&h=220&fm=pjpg"\n  srcset="http://placeholdit.imgix.net/~text?txtsize=33&txt=280%C3%97220&w=280&h=220&fm=pjpg 280w,\n          http://placeholdit.imgix.net/~text?txtsize=33&txt=560%C3%97440&w=560&h=440&fm=pjpg 560w,\n          http://placeholdit.imgix.net/~text?txtsize=33&txt=840%C3%97660&w=840&h=660&fm=pjpg 840w"\n  sizes="100vw">\n\n  <style>\n  .btn {\n    padding: 10px;\n    border-radius: 10px;\n    display: inline-block;\n    text-align: center;\n  }\n</style>\n\n<a href="#" class="btn">Button</a>\n\n\n  <div class="Media-body">\n\n    \n    \n\n    <p>Oh, hello world!</p>\n  </div>\n</div>\n';

    // set up environment
    var patternlab = new fakePatternLab(); // environment
    var assembler = new pa();

    // do all the normal processing of the pattern
    assembler.process_pattern_iterative(buttonPatternPath, patternlab);
    assembler.process_pattern_iterative(imagePatternPath, patternlab);
    var mediaObjectPattern = assembler.process_pattern_iterative(mediaObjectPatternPath, patternlab);
    assembler.process_pattern_recursive(buttonPatternPath, patternlab);
    assembler.process_pattern_recursive(imagePatternPath, patternlab);
    assembler.process_pattern_recursive(mediaObjectPatternPath, patternlab);

    // test
    test.equals(mediaObjectPattern.render(), expectedValue);
    test.done();
  },
  // 'twig partials can render JSON values': function (test) {
  //   test.expect(1);

  //   // pattern paths
  //   var pattern1Path = path.resolve(
  //     testPatternsPath,
  //     '00-atoms',
  //     '00-global',
  //     '00-helloworld-withdata.hbs'
  //   );

  //   // set up environment
  //   var patternlab = new fakePatternLab(); // environment
  //   var assembler = new pa();

  //   // do all the normal processing of the pattern
  //   var helloWorldWithData = assembler.process_pattern_iterative(pattern1Path, patternlab);
  //   assembler.process_pattern_recursive(pattern1Path, patternlab);

  //   // test
  //   test.equals(helloWorldWithData.render(), 'Hello world!\nYeah, we got the subtitle from the JSON.\n');
  //   test.done();
  // },
  // 'twig partials use the JSON environment from the calling pattern and can accept passed parameters': function (test) {
  //   test.expect(1);

  //   // pattern paths
  //   var atomPath = path.resolve(
  //     testPatternsPath,
  //     '00-atoms',
  //     '00-global',
  //     '00-helloworld-withdata.hbs'
  //   );
  //   var molPath = path.resolve(
  //     testPatternsPath,
  //     '00-molecules',
  //     '00-global',
  //     '00-call-atom-with-molecule-data.hbs'
  //   );

  //   // set up environment
  //   var patternlab = new fakePatternLab(); // environment
  //   var assembler = new pa();

  //   // do all the normal processing of the pattern
  //   var atom = assembler.process_pattern_iterative(atomPath, patternlab);
  //   var mol = assembler.process_pattern_iterative(molPath, patternlab);
  //   assembler.process_pattern_recursive(atomPath, patternlab);
  //   assembler.process_pattern_recursive(molPath, patternlab);

  //   // test
  //   test.equals(mol.render(), '<h2>Call with default JSON environment:</h2>\nThis is Hello world!\nfrom the default JSON.\n\n\n<h2>Call with passed parameter:</h2>\nHowever, this is Hello world!\nfrom a totally different blob.\n\n');
  //   test.done();
  // },
  'find_pattern_partials finds partials': function (test) {
    testFindPartials(test, [
      '{% include "atoms-image" %}',
      "{% include 'atoms-image' %}",
      "{%include 'atoms-image'%}",
      "{% include 'molecules-template' only %}",
      "{% include 'organisms-sidebar' ignore missing %}",
      "{% include 'organisms-sidebar' ignore missing only %}"
    ]);
  },
  'find_pattern_partials finds verbose partials': function (test) {
    testFindPartials(test, [
      "{% include '01-molecules/06-components/03-comment-header.twig' %}",
      "{% include '00-atoms/00-global/06-test' %}"
    ]);
  },
  'find_pattern_partials finds partials with twig parameters': function (test) {
    testFindPartials(test, [
      "{% include 'molecules-template' with {'foo': 'bar'} %}",
      "{% include 'molecules-template' with vars %}",
      "{% include 'molecules-template.twig' with {'foo': 'bar'} only %}",
      "{% include 'organisms-sidebar' ignore missing with {'foo': 'bar'} %}"
    ]);
  }
};
