const proxyquire = require('proxyquire');
const tap = require('tap');
const config = require('../bin/generator').defaultPatternlabConfig;
const patternLabMock = require('./mocks/patternlab.mock');

// Require build and mock patternlab.build() so that we only test the build module behavior
const exportPatterns = proxyquire('../bin/export', {'patternlab-node': patternLabMock});
const opts = {patternsOnly: true};

tap.test('Export ->', t => {
	t.throws(() => { exportPatterns() }, {}, 'throws when config is empty');
	t.throws(() => { exportPatterns(123) }, {}, 'throws when config is not of type object');
	t.throws(() => { exportPatterns(undefined, opts) }, {}, '--patterns-only throws when config is empty');
	t.throws(() => { exportPatterns(undefined, opts) }, {}, '--patterns-only throws when config is not of type object');
	t.end();
});
