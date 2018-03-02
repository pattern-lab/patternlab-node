'use strict';

const tap = require('tap');
const help = require('../src/lib/help');

tap.test('help - includes passed in version number', function(
  test
) {
  //arrange
  const version = '⚡';

  //act
  const result = help(version).trim();

  //assert
  test.ok(result.startsWith(`Pattern Lab Node v${version}`));
  test.end();
});
