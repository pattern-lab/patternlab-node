'use strict';

const path = require('path');
const util = require('./util/test_utils.js');
const tap = require('tap');

const replaceParameter = require('../src/lib/replaceParameter');

tap.test('replaces simple value', function (test) {
  const result = replaceParameter('{{key}}', 'key', 'value');
  test.equal(result, 'value');
  test.end();
});

tap.test('replaces simple boolean true value', function (test) {
  const result = replaceParameter('{{key}}', 'key', true);
  test.equal(result, 'true');
  test.end();
});

tap.test('replaces simple boolean false value', function (test) {
  const result = replaceParameter('{{key}}', 'key', false);
  test.equal(result, 'false');
  test.end();
});

tap.test('replaces raw value', function (test) {
  const result = replaceParameter('{{{key}}}', 'key', 'value');
  test.equal(result, 'value');
  test.end();
});

tap.test('replaces boolean true section', function (test) {
  const result = replaceParameter('1{{#key}}value{{/key}}2', 'key', true);
  test.equal(result, '1value2');
  test.end();
});

tap.only('replaces boolean true section with spaces', function (test) {
  const result = replaceParameter('1{{ #key }}value{{ /key }}2', 'key', true);
  test.equal(result, '1value2');
  test.end();
});

tap.test('replaces boolean section false', function (test) {
  const result = replaceParameter('1{{#key}}value{{/key}}2', 'key', false);
  test.equal(result, '12');
  test.end();
});
