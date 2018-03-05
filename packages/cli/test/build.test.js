const patternlab = require('@pattern-lab/core');
const proxyquire = require('proxyquire');
const tap = require('tap');
const patternLabMock = require('./mocks/patternlab.mock.js');
const config = patternlab.getDefaultConfig();

// Require build and mock patternlab.build() so that we only test the build module behavior
const build = proxyquire('../bin/build', {
  '@pattern-lab/core': patternLabMock,
});
const opts = { patternsOnly: true };

tap.test('Build ->', t => {
  t.throws(
    () => {
      build();
    },
    {},
    'throws when config is empty'
  );
  t.throws(
    () => {
      build(123);
    },
    {},
    'throws when config is not of type object'
  );
  t.throws(
    () => {
      build(undefined, opts);
    },
    {},
    '--patterns-only throws when config is empty'
  );
  t.throws(
    () => {
      build(undefined, opts);
    },
    {},
    '--patterns-only throws when config is not of type object'
  );
  t.type(build(config), 'boolean', 'returns a bool');
  t.type(build(config, opts), 'boolean', '--patterns-only returns a bool');
  t.end();
});
