const tap = require('tap');
const installStarterkit = require('../bin/install-starterkit');
const wrapAsync = require('../bin/utils').wrapAsync;
const getUniqueProjectPath = require('./utils/getUniqueProjectPath');
const moduleExist = require.resolve;

const projectRoot = getUniqueProjectPath();

const minimalConfig = {
  paths: {
    source: {
      root: projectRoot,
    },
  },
};

tap.test('Install @pattern-lab/starterkit-handlebars-vanilla ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit(
      '@pattern-lab/starterkit-handlebars-vanilla',
      minimalConfig
    );
    const pkg = yield moduleExist('@pattern-lab/starterkit-handlebars-vanilla');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install @pattern-lab/starterkit-handlebars-demo ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit(
      '@pattern-lab/starterkit-handlebars-demo',
      minimalConfig
    );
    const pkg = yield moduleExist('@pattern-lab/starterkit-handlebars-demo');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install @pattern-lab/starterkit-twig-demo ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit('@pattern-lab/starterkit-twig-demo', minimalConfig);
    const pkg = yield moduleExist('@pattern-lab/starterkit-twig-demo');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);
