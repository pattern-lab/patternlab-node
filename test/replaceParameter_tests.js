"use strict";

const path = require('path');
const util = require('./util/test_utils.js');
const tap = require('tap');

const replaceParameter = require('../core/lib/replaceParameter');

tap.test('replaces simple value', function (test) {
  const result = replaceParameter('{{key}}', 'key', 'value');
  test.equals(result, 'value');
  test.end();
});

tap.test('replaces boolean true', function (test) {
  const result = replaceParameter('1{{#key}}value{{/key}}2', 'key', true);
  test.equals(result, '1value2');
  test.end();
});

tap.only('replaces boolean true with spaces', function (test) {
  const result = replaceParameter('1{{ #key }}value{{ /key }}2', 'key', true);
  test.equals(result, '1value2');
  test.end();
});

tap.test('replaces boolean false', function (test) {
  const result = replaceParameter('1{{#key}}value{{/key}}2', 'key', false);
  test.equals(result, '12');
  test.end();
});
