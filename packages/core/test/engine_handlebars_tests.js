'use strict';
/*eslint-disable no-shadow*/

const tap = require('tap');
const path = require('path');
const eol = require('os').EOL;

const util = require('./util/test_utils.js');
const loadPattern = require('../src/lib/loadPattern');
const Pattern = require('../src/lib/object_factory').Pattern;
const PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
const processIterative = require('../src/lib/processIterative');
const processRecursive = require('../src/lib/processRecursive');

const testPatternsPath = path.resolve(
  __dirname,
  'files',
  '_handlebars-test-patterns'
);

const config = require('./util/patternlab-config.json');
const engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

// don't run these tests unless handlebars is installed
if (!engineLoader.handlebars) {
  tap.test('Handlebars engine not installed, skipping tests.', function(test) {
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
  fpl.config.paths.source.patterns = testPatternsPath;

  return fpl;
}

// function for testing sets of partials
function testFindPartials(test, partialTests) {
  test.plan(partialTests.length + 1);

  // setup current pattern from what we would have during execution
  // docs on partial syntax are here:
  // https://patternlab.io/docs/including-patterns/
  var currentPattern = Pattern.create(
    '01-molecules/00-testing/00-test-mol.hbs', // relative path now
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

tap.test('hello world handlebars pattern renders', function(test) {
  test.plan(1);

  var patternPath = path.join('00-atoms', '00-global', '00-helloworld.hbs');

  // do all the normal processing of the pattern
  var patternlab = new fakePatternLab();
  var helloWorldPattern = loadPattern(patternPath, patternlab);

  processIterative(helloWorldPattern, patternlab).then(helloWorldPattern => {
    processRecursive(patternPath, patternlab).then(() => {
      helloWorldPattern.render().then(results => {
        test.equals(results, 'Hello world!' + eol);
        test.end();
      });
    });
  });
});

tap.test(
  'hello worlds handlebars pattern can see the atoms-helloworld partial and renders it twice',
  function(test) {
    test.plan(1);

    // pattern paths
    var pattern1Path = path.join('00-atoms', '00-global', '00-helloworld.hbs');
    var pattern2Path = path.join(
      '00-molecules',
      '00-global',
      '00-helloworlds.hbs'
    );

    // set up environment
    var patternlab = new fakePatternLab(); // environment

    // do all the normal loading and processing of the pattern
    const pattern1 = loadPattern(pattern1Path, patternlab);
    const pattern2 = loadPattern(pattern2Path, patternlab);

    Promise.all([
      processIterative(pattern1, patternlab),
      processIterative(pattern2, patternlab),
    ]).then(() => {
      processRecursive(pattern1Path, patternlab).then(() => {
        processRecursive(pattern2Path, patternlab).then(() => {
          // test
          pattern2.render().then(results => {
            test.equals(
              results,
              'Hello world!' + eol + ' and Hello world!' + eol + eol
            );
            test.end();
          });
        });
      });
    });
  }
);

tap.test('handlebars partials can render JSON values', function(test) {
  test.plan(1);

  // pattern paths
  var pattern1Path = path.join(
    '00-atoms',
    '00-global',
    '00-helloworld-withdata.hbs'
  );

  // set up environment
  var patternlab = new fakePatternLab(); // environment

  // do all the normal processing of the pattern
  var helloWorldWithData = loadPattern(pattern1Path, patternlab);

  processIterative(helloWorldWithData, patternlab).then(() => {
    processRecursive(pattern1Path, patternlab).then(() => {
      // test
      helloWorldWithData.render().then(results => {
        test.equals(
          results,
          'Hello world!' +
            eol +
            'Yeah, we got the subtitle from the JSON.' +
            eol
        );
        test.end();
      });
    });
  });
});

tap.test(
  'handlebars partials use the JSON environment from the calling pattern and can accept passed parameters',
  function(test) {
    test.plan(1);

    // pattern paths
    var atomPath = path.join(
      '00-atoms',
      '00-global',
      '00-helloworld-withdata.hbs'
    );
    var molPath = path.join(
      '00-molecules',
      '00-global',
      '00-call-atom-with-molecule-data.hbs'
    );

    // set up environment
    var patternlab = new fakePatternLab(); // environment

    // do all the normal processing of the pattern
    const atom = loadPattern(atomPath, patternlab);
    const mol = loadPattern(molPath, patternlab);

    Promise.all([
      processIterative(atom, patternlab),
      processIterative(mol, patternlab),
      processRecursive(atomPath, patternlab),
      processRecursive(molPath, patternlab),
    ]).then(() => {
      mol.render().then(results => {
        // test
        test.equals(
          results,
          '<h2>Call with default JSON environment:</h2>' +
            eol +
            'This is Hello world!' +
            eol +
            'from the default JSON.' +
            eol +
            eol +
            eol +
            '<h2>Call with passed parameter:</h2>' +
            eol +
            'However, this is Hello world!' +
            eol +
            'from a totally different blob.' +
            eol +
            eol
        );
      });
    });
  }
);

tap.only('find_pattern_partials finds partials', function(test) {
  testFindPartials(test, [
    '{{> molecules-comment-header}}',
    '{{>  molecules-comment-header}}',
    '{{> ' + eol + '	molecules-comment-header' + eol + '}}',
    '{{>  molecules-weird-spacing     }}',
    '{{>  molecules-ba_d-cha*rs     }}',
  ]);
});

tap.test('find_pattern_partials finds verbose partials', function(test) {
  testFindPartials(test, [
    '{{> 01-molecules/06-components/03-comment-header.hbs }}',
    "{{> 01-molecules/06-components/02-single-comment.hbs(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
    '{{> molecules-single-comment:foo }}',
    "{{>atoms-error(message: 'That's no moon...')}}",
    "{{> atoms-error(message: 'That's no moon...') }}",
    '{{> 00-atoms/00-global/06-test }}',
  ]);
});

tap.test(
  'find_pattern_partials finds simple partials with parameters',
  function(test) {
    testFindPartials(test, [
      "{{> molecules-single-comment(description: 'A life isn't like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
      '{{> molecules-single-comment(description:"A life is like a "garden". Perfect moments can be had, but not preserved, except in memory.") }}',
    ]);
  }
);

tap.test(
  'find_pattern_partials finds simple partials with style modifiers',
  function(test) {
    testFindPartials(test, ['{{> molecules-single-comment:foo }}']);
  }
);

tap.test(
  'find_pattern_partials finds partials with handlebars parameters',
  function(test) {
    testFindPartials(test, [
      '{{> atoms-title title="bravo" headingLevel="2" headingSize="bravo" position="left"}}',
      '{{> atoms-title title="bravo"' +
        eol +
        '  headingLevel="2"' +
        eol +
        '  headingSize="bravo"' +
        eol +
        '  position="left"}}',
      '{{> atoms-title title="color &nbsp;<span style=\'font-weight:normal\'>midnight blue</span>" headingSize="charlie"}}',
      '{{> atoms-input label="city" required=true}}',
      '{{> organisms-product-filter filterData}}',
      '{{> atoms-input email required=true}}',
      '{{> molecules-storycard variants.flex }}',
      '{{> myPartial name=../name }}',
    ]);
  }
);

tap.test('find_pattern_partials finds handlebars block partials', function(
  test
) {
  testFindPartials(test, ['{{#> myPartial }}']);
});

tap.only(
  'hidden handlebars patterns can be called by their nice names',
  function(test) {
    //arrange
    const testPatternsPath = path.resolve(
      __dirname,
      'files',
      '_handlebars-test-patterns'
    );
    const pl = util.fakePatternLab(testPatternsPath);

    var hiddenPatternPath = path.join(
      '00-atoms',
      '00-global',
      '_00-hidden.hbs'
    );
    var testPatternPath = path.join(
      '00-molecules',
      '00-global',
      '00-hidden-pattern-tester.hbs'
    );

    var hiddenPattern = loadPattern(hiddenPatternPath, pl);
    var testPattern = loadPattern(testPatternPath, pl);

    Promise.all([
      processIterative(hiddenPattern, pl),
      processIterative(testPattern, pl),
      processRecursive(hiddenPatternPath, pl),
      processRecursive(testPatternPath, pl),
    ]).then(() => {
      testPattern.render().then(results => {
        //act
        test.equals(
          util.sanitized(results),
          util.sanitized("Here's the hidden atom: [I'm the hidden atom\n]\n")
        );
        test.end();
      });
    });
  }
);

tap.test(
  '@partial-block template should render without throwing (@geoffp repo issue #3)',
  function(test) {
    test.plan(1);

    var patternPath = path.join(
      '00-atoms',
      '00-global',
      '10-at-partial-block.hbs'
    );

    // do all the normal processing of the pattern
    var patternlab = new fakePatternLab();
    var atPartialBlockPattern = loadPattern(patternPath, patternlab);

    processIterative(atPartialBlockPattern, patternlab).then(() => {
      processRecursive(patternPath, patternlab).then(() => {
        atPartialBlockPattern.render().then(results => {
          var expectedResults =
            '&#123;{> @partial-block }&#125;' + eol + 'It worked!' + eol;
          test.equal(results, expectedResults);
        });
      });
    });
  }
);

tap.test(
  'A template calling a @partial-block template should render correctly',
  function(test) {
    test.plan(1);

    // pattern paths
    var pattern1Path = path.join(
      '00-atoms',
      '00-global',
      '10-at-partial-block.hbs'
    );
    var pattern2Path = path.join(
      '00-molecules',
      '00-global',
      '10-call-at-partial-block.hbs'
    );

    // set up environment
    var patternlab = new fakePatternLab(); // environment

    // do all the normal processing of the pattern
    const pattern1 = loadPattern(pattern1Path, patternlab);
    const callAtPartialBlockPattern = loadPattern(pattern2Path, patternlab);

    Promise.all([
      processIterative(pattern1, patternlab),
      processIterative(callAtPartialBlockPattern, patternlab),
      processRecursive(pattern1Path, patternlab),
      processRecursive(pattern2Path, patternlab),
    ]).then(() => {
      callAtPartialBlockPattern.render().then(results => {
        // test
        var expectedResults = 'Hello World!' + eol + 'It worked!' + eol;
        test.equals(results, expectedResults);
      });
    });
  }
);
