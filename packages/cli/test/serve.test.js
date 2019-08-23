const proxyquire = require('proxyquire');
const tap = require('tap');
const _ = require('lodash');
const resolveConfig = require('../bin/resolve-config');
const patternLabMock = require('./mocks/patternlab.mock.js');
const wrapAsync = require('../bin/utils').wrapAsync;

// Require preview but mock patternlab so that we only test the module behavior
const preview = proxyquire('../bin/serve', {
  '@pattern-lab/core': patternLabMock,
});

tap.test('Serve ->', t =>
  wrapAsync(function*() {
    const config = yield resolveConfig(
      './test/fixtures/patternlab-config.json'
    );
    config.paths.source.root = undefined;
    t.throws(
      () => {
        preview();
      },
      {},
      'throws when config is empty'
    );
    t.throws(
      () => {
        preview(123);
      },
      {},
      'throws when config is not of type object'
    );
    t.throws(
      () => {
        _.unset(config, 'paths.source.root');
        preview(config);
      },
      {},
      'throws when no source root dir is set on config'
    );
    t.throws(
      () => {
        _.unset(config, 'paths.public.root');
        preview(config);
      },
      {},
      'throws when no public root dir is set on config'
    );
    t.end();
  })
);
