const tap = require('tap');
const wrapAsync = require('../bin/utils').wrapAsync;
const resolveConfig = require('../bin/resolve-config');

tap.test('resolveConfig ->', t =>
  wrapAsync(function*() {
    const config = yield resolveConfig(
      './test/fixtures/patternlab-config.json'
    );
    const badConfig = yield resolveConfig(123);
    const configNotFound = yield resolveConfig('./test/fixtures/some-config');
    t.type(config, 'object', 'should return a config of type object');
    t.ok(config.paths, 'config should have a paths property');
    t.notOk(badConfig, 'returns false when configPath is not of type string');
    t.notOk(configNotFound, 'returns false when configPath is not found');
    t.end();
  })
);
