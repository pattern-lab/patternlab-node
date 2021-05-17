const exists = require('path-exists');
const getUniqueProjectPath = require('./utils/getUniqueProjectPath');
const path = require('path');
const spawnCmd = require('./utils/spawnCmd');
const tap = require('tap');
const wrapAsync = require('../bin/utils').wrapAsync;

const projectRoot = getUniqueProjectPath();

tap.test('Init and export ->', (t) =>
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
    yield spawnCmd([
      'export',
      '--config',
      `${projectRoot}/patternlab-config.json`,
    ]);
    t.ok(
      exists.sync(path.resolve(projectRoot, 'pattern_exports', 'patterns.zip')),
      ' should create patterns.zip'
    );
    t.end();
  })
);
