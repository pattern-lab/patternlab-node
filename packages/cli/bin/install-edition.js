'use strict';
const path = require('path');
const checkAndInstallPackage = require('./utils').checkAndInstallPackage;
const copyAsync = require('./utils').copyAsync;
const wrapAsync = require('./utils').wrapAsync;

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
    }
    return config;
  });

module.exports = installEdition;
