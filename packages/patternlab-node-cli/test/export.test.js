const exportPatterns = require('../bin/cli-actions/export');
const tap = require('tap');
const wrapAsync = require('../bin/utils').wrapAsync;

tap.test('Export ->', t => {
	t.plan(2)
	t.test('with options empty', t => wrapAsync(function*() {
		try {
			yield exportPatterns()
		} catch (err) {
			t.type(err, TypeError, 'throws when options are empty');
			t.end();
		}
	}));
	t.test('with options not an object', t => wrapAsync(function*() {
		try {
			yield exportPatterns(123)
		} catch (err) {
			t.type(err, TypeError, 'throws when passed options are not of type object');
			t.end();
		}
	}));
});
