'use strict';
const path = require('path');
const fs = require('fs-extra');
const {
  copyAsync,
  wrapAsync,
  checkAndInstallPackage,
  readJsonAsync,
  resolveFileInPackage,
  resolveDirInPackage,
} = require('./utils');

const installStarterkit = (starterkit, config) =>
  wrapAsync(function*() {
    const sourceDir = config.paths.source.root;
    const name = starterkit.value || starterkit;
    yield checkAndInstallPackage(name);
    yield copyAsync(resolveDirInPackage(name, 'dist'), path.resolve(sourceDir));
    let kitConfig;
    const kitConfigPath = resolveFileInPackage(name, 'patternlab-config.json');
    if (fs.existsSync(kitConfigPath)) {
      kitConfig = yield readJsonAsync(kitConfigPath);
    }
    return kitConfig;
  });

module.exports = installStarterkit;
