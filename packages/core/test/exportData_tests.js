'use strict';

const path = require('path');
const tap = require('tap');
const rewire = require('rewire');

const exportData = rewire('../src/lib/exportData');
const util = require('./util/test_utils.js');

const testPatternsPath = path.resolve(__dirname, 'files', '_patterns');

const fsMock = {
  outputFileSync: function(path, content) {
    /* INTENTIONAL NOOP */
  },
};

//set our mocks in place of usual require()
exportData.__set__({
  fs: fsMock,
});

const uikitFoo = {
  name: 'uikit-foo',
  enabled: true,
  outputDir: 'foo',
  excludedPatternStates: ['legacy'],
  excludedTags: ['baz'],
};

tap.test('exportData exports config', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('config') > -1, true);
  test.equals(result.indexOf('paths') > -1, true);
  test.equals(result.indexOf('theme') > -1, true);
  test.end();
});

tap.test('exportData exports ishControls', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('ishControlsHide') > -1, true);
  test.end();
});

tap.test('exportData exports navItems', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('patternGroups') > -1, true);
  test.end();
});

tap.test('exportData exports patternPaths', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('patternPaths') > -1, true);
  test.end();
});

tap.test('exportData exports viewAllPaths', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('viewAllPaths') > -1, true);
  test.end();
});

tap.test('exportData exports plugins', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('plugins') > -1, true);
  test.end();
});

tap.test('exportData exports defaultShowPatternInfo', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('defaultShowPatternInfo') > -1, true);
  test.equals(result.indexOf('"defaultShowPatternInfo":false') > -1, true);
  test.end();
});

tap.test('exportData exports defaultPattern', function(test) {
  const patternlab = util.fakePatternLab(testPatternsPath);
  const result = exportData(patternlab, uikitFoo);

  test.equals(result.indexOf('defaultPattern') > -1, true);
  test.equals(result.indexOf('"defaultPattern":"all"') > -1, true);
  test.end();
});
