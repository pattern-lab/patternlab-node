'use strict';
const path = require('path');
const pkg = require('../package.json');
const {
  checkAndInstallPackage,
  copyAsync,
  wrapAsync,
  writeJsonAsync,
} = require('./utils');

const installEdition = (edition, config) =>
  wrapAsync(function*() {
    /**
     * 1. Trigger edition install
     * 2. Copy over the mandatory edition files to sourceDir
     * 3. Do custom post-install procedures for different core editions:
     * 3.1 Copy gulpfile.js for edition-node-gulp
     */
    const sourceDir = config.paths.source.root;
    yield checkAndInstallPackage(edition); // 1
    yield copyAsync(
      path.resolve('./node_modules', edition, 'source', '_meta'),
      path.resolve(sourceDir, '_meta')
    ); // 2
    switch (edition) { // 3
      // 3.1
      case '@pattern-lab/edition-node-gulp': {
        yield copyAsync(
          path.resolve('./node_modules', edition, 'gulpfile.js'),
          path.resolve(sourceDir, '../', 'gulpfile.js')
        );
      }
      case '@pattern-lab/edition-node': {
        const scriptsJSON = {
          'pl:build': 'patternlab build --config ./patternlab-config.json',
          'pl:help': 'patternlab --help',
          'pl:install': 'patternlab install --config ./patternlab-config.json',
          'pl:serve': 'patternlab serve --config ./patternlab-config.json',
          'pl:version': 'patternlab --version',
        };
        pkg.scripts = Object.assign({}, pkg.scripts || {}, scriptsJSON);
        yield writeJsonAsync('./package.json', pkg, { spaces: 2 });
      }
    }
    return config;
  });

module.exports = installEdition;
