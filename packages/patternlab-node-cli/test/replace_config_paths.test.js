const tap = require('tap');
const replaceConfigPaths = require('../bin/replace-config');
const config = require('../bin/default-config');

tap.test('replaceConfigPaths ->', t => {
	const newConfig = replaceConfigPaths(config, 'projectDir', 'sourceDir', 'publicDir', 'exportDir');
	for (const k of Object.keys(newConfig.paths.source)) {
		t.ok(/^projectDir\/sourceDir\/|^node_modules/.test(newConfig.paths.source[k]), `should be ok for newConfig.paths.source.${k}`);
	}
	for (const k of Object.keys(newConfig.paths.public)) {
		t.ok(/^projectDir\/publicDir\//.test(newConfig.paths.public[k]), `should be ok for newConfig.paths.public.${k}`);
	}
	t.ok(/^projectDir\/exportDir/.test(newConfig.patternExportDirectory), `should be ok for newConfig.patternExportDirectory`);
	t.end();
});
