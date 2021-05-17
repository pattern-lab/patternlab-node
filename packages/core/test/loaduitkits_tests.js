'use strict';

const tap = require('tap');
const path = require('path');
const rewire = require('rewire');

const logger = require('../src/lib/log');
const loaduikits = rewire('../src/lib/loaduikits');

const testConfig = require('./util/patternlab-config.json');

tap.test('loaduikits - does warn on missing package property', (test) => {
  //arrange
  const patternlab = {
    config: testConfig,
    uikits: {},
  };

  patternlab.config.logLevel = 'warning';
  logger.log.on('warning', (msg) => test.ok(msg.includes('package:')));

  //act
  loaduikits(patternlab).then(() => {
    logger.warning = () => {};
    test.done();
  });
});

tap.test('loaduikits - maps fields correctly', function (test) {
  //arrange
  const patternlab = {
    config: testConfig,
    uikits: {},
  };

  //act
  loaduikits(patternlab).then(() => {
    //assert
    test.equal(patternlab.uikits['uikit-workshop'].name, 'uikit-workshop');
    test.equal(
      patternlab.uikits['uikit-workshop'].package,
      '@pattern-lab/uikit-workshop'
    );
    test.contains(
      patternlab.uikits['uikit-workshop'].modulePath,
      path.join('packages', 'uikit-workshop')
    );
    test.ok(patternlab.uikits['uikit-workshop'].enabled);
    test.equal(patternlab.uikits['uikit-workshop'].outputDir, 'test/');
    test.deepEquals(patternlab.uikits['uikit-workshop'].excludedPatternStates, [
      'legacy',
    ]);
    test.deepEquals(patternlab.uikits['uikit-workshop'].excludedTags, ['baz']);
    test.end();
  });
});

tap.test('loaduikits - only adds files for enabled uikits', function (test) {
  //arrange
  const patternlab = {
    config: testConfig,
    uikits: {},
  };

  //act
  loaduikits(patternlab).then(() => {
    //assert
    test.ok(patternlab.uikits['uikit-workshop']);
    test.notOk(patternlab.uikits['uikit-polyfills']);
    test.end();
  });
});
