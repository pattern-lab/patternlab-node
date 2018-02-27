'use strict';

const tap = require('tap');
const path = require('path');

const util = require('./util/test_utils.js');
const buildListItems = require('../src/lib/buildListItems');
const loadPattern = require('../src/lib/loadPattern');
const engineLoader = require('../src/lib/pattern_engines');
const processRecursive = require('../src/lib/processRecursive');
const processIterative = require('../src/lib/processIterative');

var config = require('./util/patternlab-config.json');

engineLoader.loadAllEngines(config);

const patterns_dir = `${__dirname}/files/_patterns`;

tap.test('processRecursive recursively includes partials', function(test) {
  //assert
  const patternlab = util.fakePatternLab(patterns_dir);

  var fooPatternPath = path.join('00-test', '00-foo.mustache');
  var fooPattern = loadPattern(fooPatternPath, patternlab);

  var barPatternPath = path.join('00-test', '01-bar.mustache');
  var barPattern = loadPattern(barPatternPath, patternlab);

  var p1 = processIterative(fooPattern, patternlab);
  var p2 = processIterative(barPattern, patternlab);

  Promise.all([p1, p2])
    .then(() => {
      //act
      processRecursive(fooPatternPath, patternlab)
        .then(() => {
          //assert
          const expectedValue = 'bar';
          test.equals(
            util.sanitized(fooPattern.extendedTemplate),
            util.sanitized(expectedValue)
          );
          test.end();
        })
        .catch(test.threw);
    })
    .catch(test.threw);
});

tap.test(
  'processRecursive - correctly replaces all stylemodifiers when multiple duplicate patterns with different stylemodifiers found',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var groupPath = path.join('00-test', '04-group.mustache');
    var groupPattern = loadPattern(groupPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(groupPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(groupPath, patternlab)
          .then(() => {
            //assert
            const expectedValue =
              '<div class="test_group"> <span class="test_base test_1"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
            test.equals(
              util.sanitized(groupPattern.extendedTemplate),
              util.sanitized(expectedValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap.only(
  'processRecursive - correctly replaces multiple stylemodifier classes on same partial',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var groupPath = path.join(
      '00-test',
      '10-multiple-classes-numeric.mustache'
    );
    var groupPattern = loadPattern(groupPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(groupPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(groupPath, patternlab)
          .then(() => {
            //assert
            const expectedValue =
              '<div class="test_group"> <span class="test_base foo1"> {{message}} </span> <span class="test_base foo1 foo2"> {{message}} </span> <span class="test_base foo1 foo2"> bar </span> </div>';
            test.equals(
              util.sanitized(groupPattern.extendedTemplate),
              util.sanitized(expectedValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap.test(
  'processRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var mixedPath = path.join('00-test', '06-mixed.mustache');
    var mixedPattern = loadPattern(mixedPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(mixedPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(mixedPath, patternlab)
          .then(() => {
            //assert. here we expect {{styleModifier}} to be in the first group, since it was not replaced by anything. rendering with data will then remove this (correctly)
            const expectedValue =
              '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
            test.equals(
              util.sanitized(mixedPattern.extendedTemplate),
              util.sanitized(expectedValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap.test(
  'processRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier  between',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var bookendPath = path.join('00-test', '09-bookend.mustache');
    var bookendPattern = loadPattern(bookendPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(bookendPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(bookendPath, patternlab)
          .then(() => {
            //assert. here we expect {{styleModifier}} to be in the first and last group, since it was not replaced by anything. rendering with data will then remove this (correctly)
            const expectedValue =
              '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
            test.equals(
              util.sanitized(bookendPattern.extendedTemplate),
              util.sanitized(expectedValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap.test(
  'processRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier and pattern parameters',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var mixedPath = path.join('00-test', '07-mixed-params.mustache');
    var mixedPattern = loadPattern(mixedPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(mixedPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(mixedPath, patternlab)
          .then(() => {
            //assert. here we expect {{styleModifier}} to be in the first span, since it was not replaced by anything. rendering with data will then remove this (correctly)
            const expectedValue =
              '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base test_4"> 4 </span> </div>';
            test.equals(
              util.sanitized(mixedPattern.extendedTemplate),
              util.sanitized(expectedValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap.test(
  'processRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier and pattern parameters between',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var bookendPath = path.join('00-test', '08-bookend-params.mustache');
    var bookendPattern = loadPattern(bookendPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(bookendPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(bookendPath, patternlab)
          .then(() => {
            //assert. here we expect {{styleModifier}} to be in the first and last span, since it was not replaced by anything. rendering with data will then remove this (correctly)
            const expectedValue =
              '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
            test.equals(
              util.sanitized(bookendPattern.extendedTemplate),
              util.sanitized(expectedValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap.test(
  'processRecursive - does not pollute previous patterns when a later one is found with a styleModifier',
  function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '03-styled-atom.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var anotherPath = path.join('00-test', '12-another-styled-atom.mustache');
    var anotherPattern = loadPattern(anotherPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(anotherPattern, patternlab);

    Promise.all([p1, p2])
      .then(() => {
        //act
        processRecursive(anotherPath, patternlab)
          .then(() => {
            //assert
            const expectedCleanValue =
              '<span class="test_base {{styleModifier}}"> {{message}} </span>';
            const expectedSetValue =
              '<span class="test_base test_1"> {{message}} </span>';

            //this is the "atom" - it should remain unchanged
            test.equals(
              util.sanitized(atomPattern.template),
              util.sanitized(expectedCleanValue)
            );
            test.equals(
              util.sanitized(atomPattern.extendedTemplate),
              util.sanitized(expectedCleanValue)
            );

            // this is the style modifier pattern, which should resolve correctly
            test.equals(
              util.sanitized(anotherPattern.template),
              '{{> test-styled-atom:test_1 }}'
            );
            test.equals(
              util.sanitized(anotherPattern.extendedTemplate),
              util.sanitized(expectedSetValue)
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

tap
  .test('processRecursive - ensure deep-nesting works', function(test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('00-test', '01-bar.mustache');
    var atomPattern = loadPattern(atomPath, patternlab);

    var templatePath = path.join('00-test', '00-foo.mustache');
    var templatePattern = loadPattern(templatePath, patternlab);

    var pagesPath = path.join('00-test', '14-inception.mustache');
    var pagesPattern = loadPattern(pagesPath, patternlab);

    var p1 = processIterative(atomPattern, patternlab);
    var p2 = processIterative(templatePattern, patternlab);
    var p3 = processIterative(pagesPattern, patternlab);

    return Promise.all([
      p1,
      p2,
      p3,
      processRecursive(atomPath, patternlab),
      processRecursive(templatePath, patternlab),
      processRecursive(pagesPath, patternlab),
    ]).then(() => {
      //act
      return test.test(
        'processRecursive - ensure deep-nesting works2',
        function(tt) {
          //assert
          const expectedCleanValue = 'bar';
          const expectedSetValue = 'bar';

          //this is the "atom" - it should remain unchanged
          tt.equals(util.sanitized(atomPattern.template), expectedCleanValue);
          tt.equals(
            util.sanitized(atomPattern.extendedTemplate),
            expectedCleanValue
          );

          //this is the "template pattern" - it should have an updated extendedTemplate but an unchanged template
          tt.equals(
            util.sanitized(templatePattern.template),
            '{{> test-bar }}'
          );
          tt.equals(
            util.sanitized(templatePattern.extendedTemplate),
            expectedSetValue
          );

          //this is the "pages pattern" - it should have an updated extendedTemplate equal to the template pattern but an unchanged template
          tt.equals(util.sanitized(pagesPattern.template), '{{> test-foo }}');
          tt.equals(
            util.sanitized(pagesPattern.extendedTemplate),
            expectedSetValue
          );
          tt.end();
          test.end();
        }
      );
    });
  })
  .catch(tap.threw);

tap.test('hidden patterns can be called by their nice names', function(test) {
  //arrange
  const patternlab = util.fakePatternLab(patterns_dir);

  //act
  var hiddenPatternPath = path.join('00-test', '_00-hidden-pattern.mustache');
  var hiddenPattern = loadPattern(hiddenPatternPath, patternlab);

  var testPatternPath = path.join(
    '00-test',
    '15-hidden-pattern-tester.mustache'
  );
  var testPattern = loadPattern(testPatternPath, patternlab);

  var p1 = processIterative(hiddenPattern, patternlab);
  var p2 = processIterative(testPattern, patternlab);

  Promise.all([p1, p2]).then(() => {
    //act
    processRecursive(hiddenPatternPath, patternlab).then(() => {
      processRecursive(testPatternPath, patternlab).then(() => {
        testPattern.render().then(results => {
          //assert
          test.equals(
            util.sanitized(results),
            util.sanitized(
              "Hello there! Here's the hidden atom: [This is the hidden atom]"
            ),
            'hidden pattern rendered output not as expected'
          );
          test.end();
        });
      });
    });
  });
});

tap.test('parses pattern title correctly when frontmatter present', function(
  test
) {
  //arrange
  var pl = util.fakePatternLab(patterns_dir);

  var testPatternPath = path.join('00-test', '01-bar.mustache');
  var testPattern = loadPattern(testPatternPath, pl);

  //act
  Promise.all([
    processIterative(testPattern, pl),
    processRecursive(testPatternPath, pl),
  ])
    .then(results => {
      //assert
      test.equals(
        results[0].patternName,
        'An Atom Walks Into a Bar',
        'patternName not overridden'
      );
      test.end();
    })
    .catch(test.threw);
});

tap.test(
  'parses pattern extra frontmatter correctly when frontmatter present',
  function(test) {
    //arrange
    var pl = util.fakePatternLab(patterns_dir);

    var testPatternPath = path.join('00-test', '01-bar.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //act
    Promise.all([
      processIterative(testPattern, pl),
      processRecursive(testPatternPath, pl),
    ])
      .then(results => {
        //assert
        test.equals(results[0].allMarkdown.joke, 'bad', 'extra key not added');
        test.end();
      })
      .catch(test.threw);
  }
);
