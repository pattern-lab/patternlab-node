const exists = require('path-exists');
const getUniqueProjectPath = require('./utils/getUniqueProjectPath');
const path = require('path');
const spawnCmd = require('./utils/spawnCmd');
const tap = require('tap');
const wrapAsync = require('../bin/utils').wrapAsync;

const projectRoot = getUniqueProjectPath();

tap.test('Init ->', (t) =>
  wrapAsync(function* () {
    yield spawnCmd([
      'init',
      '--verbose',
      '--project-dir',
      projectRoot,
      '--edition',
      '@pattern-lab/edition-node',
      '--starterkit',
      '@pattern-lab/starterkit-mustache-base',
    ]);
    t.ok(
      exists.sync(path.resolve(projectRoot)),
      'should initialize a Pattern Lab project'
    );
    t.ok(exists.sync(path.resolve(projectRoot, 'source')), 'with a source dir');
    t.ok(exists.sync(path.resolve(projectRoot, 'public')), 'with a public dir');
    t.ok(
      exists.sync(path.resolve(projectRoot, 'pattern_exports')),
      'with a pattern_exports dir'
    );
    t.ok(
      exists.sync(path.resolve(projectRoot, 'patternlab-config.json')),
      'with a pattern_exports dir'
    );
    t.end();
  })
);
