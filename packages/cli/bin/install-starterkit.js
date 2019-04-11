'use strict';
const path = require('path');
const fs = require('fs-extra');
const {
  copyAsync,
  wrapAsync,
  checkAndInstallPackage,
  readJsonAsync,
} = require('./utils');

const installStarterkit = (starterkit, config) =>
  wrapAsync(function*() {
    const sourceDir = config.paths.source.root;
    const name = starterkit.value || starterkit;
    const url = name.startsWith('@pattern-lab/') ? name : `pattern-lab/${name}`;
    yield checkAndInstallPackage(name, url);
    const kitPath = path.resolve('./node_modules', name);
    yield copyAsync(path.resolve(kitPath, 'dist'), path.resolve(sourceDir));
    let kitConfig;
    const kitConfigPath = path.resolve(kitPath, 'patternlab-config.json');
    if (fs.existsSync(kitConfigPath)) {
      kitConfig = yield readJsonAsync(kitConfigPath);
    }
    return kitConfig;
  });

module.exports = installStarterkit;
