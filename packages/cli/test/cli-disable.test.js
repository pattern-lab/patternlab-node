const getUniqueProjectPath = require('./utils/getUniqueProjectPath');
const spawnCmd = require('./utils/spawnCmd');
const tap = require('tap');
const { readFileSync } = require('fs');
const wrapAsync = require('../bin/utils').wrapAsync;

const projectRoot = getUniqueProjectPath();

tap.test('Disable ->', (t) =>
  wrapAsync(function* () {
    yield spawnCmd([
      'init',
      '--verbose',
      '--project-dir',
      projectRoot,
      '--edition',
      '@pattern-lab/edition-node',
      '--starterkit',
      '@pattern-lab/starterkit-handlebars-vanilla',
    ]);
    yield spawnCmd([
      'install',
      '--plugins',
      '@pattern-lab/plugin-tab',
      '--config',
      `${projectRoot}/patternlab-config.json`,
    ]);
    yield spawnCmd([
      'enable',
      '--plugins',
      '@pattern-lab/plugin-tab',
      '--config',
      `${projectRoot}/patternlab-config.json`,
    ]);
    yield spawnCmd([
      'disable',
      '--plugins',
      '@pattern-lab/plugin-tab',
      '--config',
      `${projectRoot}/patternlab-config.json`,
    ]);
    const config = JSON.parse(
      readFileSync(`${projectRoot}/patternlab-config.json`, 'utf8')
    );
    t.equal(
      config.plugins['@pattern-lab/plugin-tab'].enabled,
      false,
      'and set the enabled flag to false in patternlab-config.json'
    );
    t.end();
  })
);
