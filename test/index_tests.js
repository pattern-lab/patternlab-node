const tap = require('tap');
const defaultConfig = require('../patternlab-config.json');

const entry = require('../core/index');

tap.test('getDefaultConfig - should return the default config object', function (test) {
  console.log(1)
  const requestedConfig = entry.getDefaultConfig();
  test.type(requestedConfig, 'object');
  test.equals(requestedConfig, defaultConfig);
  test.end();
});
