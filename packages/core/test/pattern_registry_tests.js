'use strict';

var PatternRegistry = require('./../src/lib/pattern_registry');

var tap = require('tap');

// #540 Copied from pattern_assembler_tests
tap.test(
  'get_pattern_by_key - returns the fuzzy result when no others found',
  function (test) {
    var pattern_registry = new PatternRegistry();

    var pattern = {
      key: 'character-han-solo',
      patternPartial: 'character-han-solo',
      subdir: 'character',
      fileName: 'han-solo',
    };
    pattern_registry.put(pattern);

    //act
    var result = pattern_registry.getPartial('character-han');
    //assert
    test.equal(result, pattern);
    test.end();
  }
);

// #540 Copied from pattern_assembler_tests
tap.test('remove - remove an existing pattern', function (test) {
  var pattern_registry = new PatternRegistry();

  var pattern = {
    key: 'character-han-solo',
    patternPartial: 'character-han-solo',
    subdir: 'character',
    fileName: 'han-solo',
  };
  pattern_registry.put(pattern);

  //act
  pattern_registry.remove('character-han-solo');
  test.same(null, pattern_registry.get('character-han-solo'));
  test.end();
});

// #540 Copied from pattern_assembler_tests
tap.test('getPartial - returns the exact key if found', function (test) {
  //arrange
  var pattern_registry = new PatternRegistry();
  let patterns = [
    {
      key: 'molecules-primary-nav-jagged',
      patternPartial: 'molecules-primary-nav-jagged',
      subdir: 'molecules',
      fileName: 'primary-nav-jagged',
    },
    {
      key: 'molecules-primary-nav',
      patternPartial: 'molecules-primary-nav',
      subdir: 'molecules',
      fileName: 'molecules-primary-nav',
    },
  ];
  patterns.forEach((p) => pattern_registry.put(p));

  //act
  var result = pattern_registry.getPartial('molecules-primary-nav');
  //assert
  test.equal(result, patterns[1]);
  test.end();
});
