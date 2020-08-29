'use strict';
/*eslint-disable dot-notation*/
/*eslint-disable no-shadow*/

var tap = require('tap');
var path = require('path');
var loadPattern = require('../src/lib/loadPattern');
var Pattern = require('../src/lib/object_factory').Pattern;
var PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
var eol = require('os').EOL;

// don't run these tests unless liquid is installed
var engineLoader = require('../src/lib/pattern_engines');
if (!engineLoader.liquid) {
  tap.test('Liquid engine not installed, skipping tests.', function(test) {
    test.end();
  });
  return;
}

// fake pattern lab constructor:
// sets up a fake patternlab object, which is needed by the pattern processing
// apparatus.
function fakePatternLab() {
  var fpl = {
    graph: PatternGraph.empty(),
    partials: {},
    patterns: [],
    footer: '',
    header: '',
    listitems: {},
    data: {
      link: {},
    },
    config: require('../patternlab-config.json'),
    package: {},
  };

  // patch the pattern source so the pattern assembler can correctly determine
  // the "subdir"
  fpl.config.paths.source.patterns = './test/files/_liquid-test-patterns';

  return fpl;
}

// function for testing sets of partials
function testFindPartials(test, partialTests) {
  test.plan(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // https://patternlab.io/docs/including-patterns/
  var currentPattern = Pattern.create(
    'molecules/testing/test-mol.liquid', // relative path now
    null, // data
    {
      template: partialTests.join(),
    }
  );

  // act
  var results = currentPattern.findPartials();

  // assert
  test.equals(results.length, partialTests.length);
  partialTests.forEach(function(testString, index) {
    test.equals(results[index], testString);
  });

  test.end();
}

tap.test('button liquid pattern renders', function(test) {
  test.plan(1);

  var patternPath = path.join('atoms', 'general', 'button.liquid');
  var expectedValue =
    '<style>' +
    eol +
    '  .btn {' +
    eol +
    '    padding: 10px;' +
    eol +
    '    border-radius: 10px;' +
    eol +
    '    display: inline-block;' +
    eol +
    '    text-align: center;' +
    eol +
    '  }' +
    eol +
    '</style>' +
    eol +
    eol +
    '<a href="#" class="btn">Button</a>' +
    eol;

  // do all the normal processing of the pattern
  var patternlab = new fakePatternLab();

  var helloWorldPattern = loadPattern(patternPath, patternlab);

  return assembler
    .process_pattern_iterative(helloWorldPattern, patternlab)
    .then(() => {
      assembler.process_pattern_recursive(patternPath, patternlab);

      test.equals(helloWorldPattern.render(), expectedValue);
    });
});

tap.test(
  'media object liquid pattern can see the atoms-button and atoms-image partials and renders them',
  function(test) {
    test.plan(1);

    // pattern paths
    var buttonPatternPath = path.join('atoms', 'general', 'button.liquid');
    var imagePatternPath = path.join('atoms', 'general', 'image.liquid');
    var mediaObjectPatternPath = path.join(
      'molecules',
      'general',
      'media-object.liquid'
    );

    var expectedValue =
      '<style>\n  .Media {\n    display: flex;\n    align-items: flex-start;\n  }\n\n  .Media > img {\n    margin-right: 1em;\n    max-width: 200px;\n  }\n\n  .Media-body {\n    flex: 1;\n  }\n</style>\n\n\n\n\n<div class="Media">\n  <img src="http://placeholdit.imgix.net/~text?txtsize=33&txt=280%C3%97220&w=280&h=220&fm=pjpg"\n  srcset="http://placeholdit.imgix.net/~text?txtsize=33&txt=280%C3%97220&w=280&h=220&fm=pjpg 280w,\n          http://placeholdit.imgix.net/~text?txtsize=33&txt=560%C3%97440&w=560&h=440&fm=pjpg 560w,\n          http://placeholdit.imgix.net/~text?txtsize=33&txt=840%C3%97660&w=840&h=660&fm=pjpg 840w"\n  sizes="100vw">\n\n  <style>\n  .btn {\n    padding: 10px;\n    border-radius: 10px;\n    display: inline-block;\n    text-align: center;\n  }\n</style>\n\n<a href="#" class="btn">Button</a>\n\n\n  <div class="Media-body">\n\n    \n    \n\n    <p>Oh, hello world!</p>\n  </div>\n</div>\n';

    // set up environment
    var patternlab = new fakePatternLab(); // environment

    // do all the normal processing of the pattern
    const buttonPattern = loadPattern(buttonPatternPath, patternlab);
    const imagePattern = loadPattern(imagePatternPath, patternlab);
    const mediaObjectPattern = loadPattern(mediaObjectPatternPath, patternlab);

    return Promise.all([
      assembler.process_pattern_iterative(buttonPattern, patternlab),
      assembler.process_pattern_iterative(imagePattern, patternlab),
      assembler.process_pattern_iterative(mediaObjectPattern, patternlab),
    ]).then(() => {
      assembler.process_pattern_recursive(buttonPatternPath, patternlab);
      assembler.process_pattern_recursive(imagePatternPath, patternlab);
      assembler.process_pattern_recursive(mediaObjectPatternPath, patternlab);

      // test
      // this pattern is too long - so just remove line endings on both sides and compare output
      test.equals(
        mediaObjectPattern.render().replace(/\r?\n|\r/gm, ''),
        expectedValue.replace(/\r?\n|\r/gm, '')
      );
    });
  }
);

tap.test('liquid partials can render JSON values', { skip: true }, function(
  test
) {
  test.plan(1);

  // pattern paths
  var pattern1Path = path.resolve(
    testPatternsPath,
    'atoms',
    'global',
    'helloworld-withdata.hbs'
  );

  // set up environment
  var patternlab = new fakePatternLab(); // environment

  // do all the normal processing of the pattern
  var helloWorldWithData = assembler.process_pattern_iterative(
    pattern1Path,
    patternlab
  );
  assembler.process_pattern_recursive(pattern1Path, patternlab);

  // test
  test.equals(
    helloWorldWithData.render(),
    'Hello world!\nYeah, we got the subtitle from the JSON.\n'
  );
  test.end();
});

tap.test(
  'liquid partials use the JSON environment from the calling pattern and can accept passed parameters',
  { skip: true },
  function(test) {
    test.plan(1);

    // pattern paths
    var atomPath = path.resolve(
      testPatternsPath,
      'atoms',
      'global',
      'helloworld-withdata.hbs'
    );
    var molPath = path.resolve(
      testPatternsPath,
      'molecules',
      'global',
      'call-atom-with-molecule-data.hbs'
    );

    // set up environment
    var patternlab = new fakePatternLab(); // environment

    // do all the normal processing of the pattern
    var atom = assembler.process_pattern_iterative(atomPath, patternlab);
    var mol = assembler.process_pattern_iterative(molPath, patternlab);
    assembler.process_pattern_recursive(atomPath, patternlab);
    assembler.process_pattern_recursive(molPath, patternlab);

    // test
    test.equals(
      mol.render(),
      '<h2>Call with default JSON environment:</h2>\nThis is Hello world!\nfrom the default JSON.\n\n\n<h2>Call with passed parameter:</h2>\nHowever, this is Hello world!\nfrom a totally different blob.\n\n'
    );
    test.end();
  }
);

tap.test('find_pattern_partials finds partials', function(test) {
  testFindPartials(test, [
    '{% include "atoms-image" %}',
    "{% include 'atoms-image' %}",
    "{%include 'atoms-image'%}",
    "{% include 'molecules-template' only %}",
    "{% include 'organisms-sidebar' ignore missing %}",
    "{% include 'organisms-sidebar' ignore missing only %}",
  ]);
});

tap.test('find_pattern_partials finds verbose partials', function(test) {
  testFindPartials(test, [
    "{% include 'molecules/components/comment-header.liquid' %}",
    "{% include 'atoms/global/test' %}",
  ]);
});

tap.test(
  'find_pattern_partials finds partials with liquid parameters',
  function(test) {
    testFindPartials(test, [
      "{% include 'molecules-template' with {'foo': 'bar'} %}",
      "{% include 'molecules-template' with vars %}",
      "{% include 'molecules-template.liquid' with {'foo': 'bar'} only %}",
      "{% include 'organisms-sidebar' ignore missing with {'foo': 'bar'} %}",
    ]);
  }
);
