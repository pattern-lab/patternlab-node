const proxyquire = require('proxyquire');
const tap = require('tap');
const config = require('../bin/default-config');
const patternLabMock = require('./mocks/patternlab.mock.js');

// Require build and mock patternlab.build() so that we only test the build module behavior
const build = proxyquire('../bin/build', {'patternlab-node': patternLabMock});
const opts = {patternsOnly: true};

tap.test('Build ->', t => {
	t.throws(() => { build() }, {}, 'throws when config is empty');
	t.throws(() => { build(123) }, {}, 'throws when config is not of type object');
	t.throws(() => { build(undefined, opts) }, {}, '--patterns-only throws when config is empty');
	t.throws(() => { build(undefined, opts) }, {}, '--patterns-only throws when config is not of type object');
	t.type(build(config), 'boolean', 'returns a bool');
	t.type(build(config, opts), 'boolean', '--patterns-only returns a bool');
	t.end();
});
