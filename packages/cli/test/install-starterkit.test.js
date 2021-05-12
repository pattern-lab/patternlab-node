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

tap.test('Install starterkit-mustache-demo ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit(
      '@pattern-lab/starterkit-mustache-demo',
      minimalConfig
    );
    const pkg = yield moduleExist('@pattern-lab/starterkit-mustache-demo');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install starterkit-mustache-base ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit(
      '@pattern-lab/starterkit-mustache-base',
      minimalConfig
    );
    const pkg = yield moduleExist('@pattern-lab/starterkit-mustache-base');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install starterkit-mustache-bootstrap ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit('starterkit-mustache-bootstrap', minimalConfig);
    const pkg = yield moduleExist('starterkit-mustache-bootstrap');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install starterkit-mustache-foundation ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit('starterkit-mustache-foundation', minimalConfig);
    const pkg = yield moduleExist('starterkit-mustache-foundation');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install starterkit-mustache-acidtest ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit('starterkit-mustache-acidtest', minimalConfig);
    const pkg = yield moduleExist('starterkit-mustache-acidtest');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);

tap.test('Install starterkit-mustache-materialdesign ->', (t) =>
  wrapAsync(function* () {
    yield installStarterkit(
      'starterkit-mustache-materialdesign',
      minimalConfig
    );
    const pkg = yield moduleExist('starterkit-mustache-materialdesign');
    t.ok(pkg, 'module should exist after install');
    t.end();
  })
);
