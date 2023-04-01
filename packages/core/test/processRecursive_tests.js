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

tap.test('processRecursive recursively includes partials', function (test) {
  //assert
  const patternlab = util.fakePatternLab(patterns_dir);

  var fooPatternPath = path.join('test', 'foo.hbs');
  var fooPattern = loadPattern(fooPatternPath, patternlab);

  var barPatternPath = path.join('test', 'bar.hbs');
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
          test.equal(
            util.sanitized(fooPattern.extendedTemplate),
            util.sanitized(expectedValue)
          );
          test.end();
        })
        .catch(test.threw);
    })
    .catch(test.threw);
});

tap
  .test('processRecursive - ensure deep-nesting works', function (test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var atomPath = path.join('test', 'bar.hbs');
    var atomPattern = loadPattern(atomPath, patternlab);

    var templatePath = path.join('test', 'foo.hbs');
    var templatePattern = loadPattern(templatePath, patternlab);

    var pagesPath = path.join('test', 'inception.hbs');
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
        function (tt) {
          //assert
          const expectedCleanValue = 'bar';
          const expectedSetValue = 'bar';

          //this is the "atom" - it should remain unchanged
          tt.equal(util.sanitized(atomPattern.template), expectedCleanValue);
          tt.equal(
            util.sanitized(atomPattern.extendedTemplate),
            expectedCleanValue
          );

          //this is the "template pattern" - it should have an updated extendedTemplate but an unchanged template
          tt.equal(util.sanitized(templatePattern.template), '{{> test-bar }}');
          tt.equal(
            util.sanitized(templatePattern.extendedTemplate),
            expectedSetValue
          );

          //this is the "pages pattern" - it should have an updated extendedTemplate equal to the template pattern but an unchanged template
          tt.equal(util.sanitized(pagesPattern.template), '{{> test-foo }}');
          tt.equal(
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

tap.test('hidden patterns can be called by their nice names', function (test) {
  //arrange
  const patternlab = util.fakePatternLab(patterns_dir);

  //act
  var hiddenPatternPath = path.join('test', '_hidden-pattern.hbs');
  var hiddenPattern = loadPattern(hiddenPatternPath, patternlab);

  var testPatternPath = path.join('test', 'hidden-pattern-tester.hbs');
  var testPattern = loadPattern(testPatternPath, patternlab);

  var p1 = processIterative(hiddenPattern, patternlab);
  var p2 = processIterative(testPattern, patternlab);

  Promise.all([p1, p2]).then(() => {
    //act
    processRecursive(hiddenPatternPath, patternlab).then(() => {
      processRecursive(testPatternPath, patternlab).then(() => {
        testPattern.render().then((results) => {
          //assert
          test.equal(
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

tap.test(
  'parses pattern title correctly when frontmatter present',
  function (test) {
    //arrange
    var pl = util.fakePatternLab(patterns_dir);

    var testPatternPath = path.join('test', 'bar.hbs');
    var testPattern = loadPattern(testPatternPath, pl);

    //act
    Promise.all([
      processIterative(testPattern, pl),
      processRecursive(testPatternPath, pl),
    ])
      .then((results) => {
        //assert
        test.equal(
          results[0].patternName,
          'An Atom Walks Into a Bar',
          'patternName not overridden'
        );
        test.end();
      })
      .catch(test.threw);
  }
);

tap.test(
  'parses pattern extra frontmatter correctly when frontmatter present',
  function (test) {
    //arrange
    var pl = util.fakePatternLab(patterns_dir);

    var testPatternPath = path.join('test', 'bar.hbs');
    var testPattern = loadPattern(testPatternPath, pl);

    //act
    Promise.all([
      processIterative(testPattern, pl),
      processRecursive(testPatternPath, pl),
    ])
      .then((results) => {
        //assert
        test.equal(results[0].allMarkdown.joke, 'bad', 'extra key not added');
        test.end();
      })
      .catch(test.threw);
  }
);
