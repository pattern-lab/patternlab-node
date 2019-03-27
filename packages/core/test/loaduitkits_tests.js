'use strict';

const tap = require('tap');
const rewire = require('rewire');

const loaduikits = rewire('../src/lib/loaduikits');

const testConfig = require('./util/patternlab-config.json');

const findModulesMock = function() {
  return [
    {
      name: 'foo',
      modulePath: 'node_modules/@pattern-lab/uikit-foo',
    },
    {
      name: 'bar',
      modulePath: 'node_modules/@pattern-lab/uikit-bar',
    },
    {
      name: 'baz',
      modulePath: 'node_modules/@pattern-lab/uikit-baz',
    },
  ];
};

const fsMock = {
  readFileSync: function(path, encoding) {
    return 'file';
  },
};

loaduikits.__set__({
  findModules: findModulesMock,
  fs: fsMock,
});

tap.test('loaduikits - maps fields correctly', function(test) {
  //arrange
  const patternlab = {
    config: testConfig,
    uikits: [],
  };

  const uikitFoo = {
    name: 'uikit-foo',
    enabled: true,
    outputDir: 'foo',
    excludedPatternStates: ['legacy'],
    excludedTags: ['baz'],
  };

  patternlab.config.uikits = [uikitFoo];

  //act
  loaduikits(patternlab).then(() => {
    //assert
    test.equals(patternlab.uikits['uikit-foo'].name, uikitFoo.name);
    test.equals(
      patternlab.uikits['uikit-foo'].modulePath,
      'node_modules/@pattern-lab/uikit-foo'
    );
    test.ok(patternlab.uikits['uikit-foo'].enabled);
    test.equals(patternlab.uikits['uikit-foo'].outputDir, uikitFoo.outputDir);
    test.equals(
      patternlab.uikits['uikit-foo'].excludedPatternStates,
      uikitFoo.excludedPatternStates
    );
    test.equals(
      patternlab.uikits['uikit-foo'].excludedTags,
      uikitFoo.excludedTags
    );
    test.end();
  });
});

tap.test('loaduikits - only adds files for enabled uikits', function(test) {
  //arrange
  const patternlab = {
    config: testConfig,
    uikits: [],
  };

  patternlab.config.uikits = [
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
  ];

  //act
  loaduikits(patternlab).then(() => {
    //assert
    test.ok(patternlab.uikits['uikit-foo']);
    test.ok(patternlab.uikits['uikit-bar']);
    test.notOk(patternlab.uikits['uikit-baz']);
    test.end();
  });
});
