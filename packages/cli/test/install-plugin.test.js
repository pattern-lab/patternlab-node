const tap = require('tap');
const installPlugin = require('../bin/install-plugin');
const wrapAsync = require('../bin/utils').wrapAsync;
const getUniqueProjectPath = require('./utils/getUniqueProjectPath');
const moduleExist = require.resolve;

const projectRoot = getUniqueProjectPath();

const minimalConfig = {
	paths: {
		source: {
			root: projectRoot
		}
	}
};

tap.test('Install plugin-node-tab ->', t => wrapAsync(function*() {
	yield installPlugin('plugin-node-tab', minimalConfig);
	const pkg = yield moduleExist('plugin-node-tab');
	t.ok(pkg, 'module should exist after install');
	t.equal(minimalConfig['plugin-node-tab'], false, 'and persist it on the patternlab-config.json');
	t.end();
}));
