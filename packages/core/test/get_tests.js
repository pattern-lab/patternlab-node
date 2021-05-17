'use strict';

const tap = require('tap');

const util = require('./util/test_utils.js');
const getPartial = require('../src/lib/get');

const patterns_dir = './test/files/_patterns';

tap.test(
  'getPartial - returns the fuzzy result when no others found',
  function (test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);
    patternlab.patterns = [];

    patternlab.patterns.push({
      patternPartial: 'character-han-solo',
      subdir: 'character',
      fileName: 'han-solo',
      verbosePartial: 'character/han-solo',
    });

    //act
    var result = getPartial('character-han', patternlab);

    //assert
    test.equal(result, patternlab.patterns[0]);
    test.end();
  }
);

tap.test('getPartial - returns the verbose result if found', function (test) {
  //arrange
  const patternlab = util.fakePatternLab(patterns_dir);
  patternlab.patterns = [];

  patternlab.patterns.push(
    {
      patternPartial: 'molecules-primary-nav-jagged',
      subdir: 'molecules',
      fileName: 'primary-nav-jagged',
      verbosePartial: 'molecules/primary-nav-jagged',
    },
    {
      patternPartial: 'molecules-primary-nav',
      subdir: 'molecules',
      fileName: 'molecules-primary-nav',
      verbosePartial: 'molecules/primary-nav',
    }
  );

  //act
  var result = getPartial('molecules/primary-nav', patternlab);

  //assert
  test.equal(result, patternlab.patterns[1]);
  test.end();
});

tap.test('getPartial - returns the exact key if found', function (test) {
  //arrange
  const patternlab = util.fakePatternLab(patterns_dir);
  patternlab.patterns = [];

  patternlab.patterns.push(
    {
      patternPartial: 'molecules-primary-nav-jagged',
      subdir: 'molecules',
      fileName: 'primary-nav-jagged',
    },
    {
      patternPartial: 'molecules-primary-nav',
      subdir: 'molecules',
      fileName: 'molecules-primary-nav',
    }
  );

  //act
  var result = getPartial('molecules-primary-nav', patternlab);

  //assert
  test.equal(result, patternlab.patterns[1]);
  test.end();
});
