const patternlab = require('@pattern-lab/core');
const tap = require('tap');
const replaceConfigPaths = require('../bin/replace-config');
const config = patternlab.getDefaultConfig();

tap.test('replaceConfigPaths ->', t => {
  const newConfig = replaceConfigPaths(
    config,
    'projectDir',
    'sourceDir',
    'publicDir',
    'exportDir'
  );
  for (const k of Object.keys(newConfig.paths.source)) {
    if (k === 'patternlabFiles') {
      for (const l of Object.keys(newConfig.paths.source[k])) {
        t.ok(
          /^projectDir\/sourceDir\/|^\.\/node_modules/.test(
            newConfig.paths.source[k][l]
          ),
          `should be ok for newConfig.paths.source.${k}.${l}`
        );
      }
    } else {
      t.ok(
        /^projectDir\/sourceDir\/|^\.\/node_modules/.test(
          newConfig.paths.source[k]
        ),
        `should be ok for newConfig.paths.source.${k}`
      );
    }
  }
  for (const l of Object.keys(newConfig.paths.public)) {
    t.ok(
      /^projectDir\/publicDir\//.test(newConfig.paths.public[l]),
      `should be ok for newConfig.paths.public.${l}`
    );
  }
  t.ok(
    /^projectDir\/exportDir/.test(newConfig.patternExportDirectory),
    `should be ok for newConfig.patternExportDirectory`
  );
  t.end();
});
