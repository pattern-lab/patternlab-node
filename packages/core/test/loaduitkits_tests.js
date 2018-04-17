'use strict';

const tap = require('tap');
const rewire = require('rewire');

const loaduikits = require('../src/lib/loaduikits');

const findModulesMock = function() {
  return [
    {
      name: 'uikit-foo',
      modulePath: 'node_modules/@pattern-lab/uikit-foo',
    },
    {
      name: 'uikit-bar',
      modulePath: 'node_modules/@pattern-lab/uikit-bar',
    },
    {
      name: 'uikit-baz',
      modulePath: 'node_modules/@pattern-lab/uikit-baz',
    },
  ];
};

const fsMock = function() {
  readFileSync: () => {};
};

tap.test('loaduikits', function(test) {
  //arrange
  const patternlab = {
    uikits: [
      {
        name: 'uikit-foo',
        enabled: true,
        outputDir: 'foo',
        excludedPatternStates: ['legacy'],
        excludedTags: ['baz'],
      },
      {
        name: 'uikit-bar',
        enabled: true,
        outputDir: 'bar',
        excludedPatternStates: ['development'],
        excludedTags: ['baz', 'foo'],
      },
      {
        name: 'uikit-baz',
        enabled: false,
        outputDir: 'baz',
        excludedPatternStates: [''],
        excludedTags: [],
      },
    ],
  };

  //act
  loaduikits(patternlab).then(() => {
    //assert
    test.equals(patternlab.uikits);
    test.end();
  });
});
