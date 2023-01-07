'use strict';
const path = require('path');
const fs = require('fs-extra');
const {
  copyAsync,
  wrapAsync,
  checkAndInstallPackage,
  readJsonAsync,
} = require('./utils');
const {
  resolvePackageFolder,
  resolveDirInPackage,
} = require('@pattern-lab/core/src/lib/resolver');

const installStarterkit = (starterkit, config) =>
  wrapAsync(function* () {
    const sourceDir = config.paths.source.root;
    const name = starterkit.value || starterkit;
    yield checkAndInstallPackage(name);
    yield copyAsync(
      resolveDirInPackage(name, 'dist'),
      path.resolve(process.env.projectDir || '', sourceDir)
    );
    let kitConfig;
    const kitConfigPath = path.join(
      resolvePackageFolder(name),
      'patternlab-config.json'
    );
    if (fs.existsSync(kitConfigPath)) {
      kitConfig = yield readJsonAsync(kitConfigPath);
    }
    return kitConfig;
  });

module.exports = installStarterkit;
