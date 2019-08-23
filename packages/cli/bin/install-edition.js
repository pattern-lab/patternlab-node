/* eslint-disable no-param-reassign */
'use strict';

const path = require('path');
const merge = require('deepmerge');
const EOL = require('os').EOL;
const {
  checkAndInstallPackage,
  copyAsync,
  wrapAsync,
  writeJsonAsync,
  getJSONKey,
} = require('./utils');

const installEdition = (edition, config, projectDir) => {
  const pkg = require(path.resolve(projectDir, 'package.json'));

  return wrapAsync(function*() {
    /**
     * 1. Trigger edition install
     * 2. Copy over the mandatory edition files to sourceDir
     * 3. Copy dependencies defined in edition
     * 4. Do custom post-install procedures for different core editions:
     * 4.1 Copy gulpfile.js for edition-node-gulp
     * 4.2 Copy scripts for edition-node
     * 4.3 Copy items for edition-twig
     */
    const sourceDir = config.paths.source.root;
    yield checkAndInstallPackage(edition); // 1
    yield copyAsync(
      path.resolve('./node_modules', edition, 'source', '_meta'),
      path.resolve(sourceDir, '_meta')
    ); // 2
    pkg.dependencies = Object.assign(
      {},
      pkg.dependencies || {},
      yield getJSONKey(edition, 'dependencies')
    ); // 3
    switch (
      edition // 4
    ) {
      // 4.1
      case '@pattern-lab/edition-node-gulp': {
        yield copyAsync(
          path.resolve('./node_modules', edition, 'gulpfile.js'),
          path.resolve(sourceDir, '../', 'gulpfile.js')
        );
        break;
      }
      // 4.2
      case '@pattern-lab/edition-node': {
        pkg.scripts = Object.assign(
          {},
          pkg.scripts || {},
          yield getJSONKey(edition, 'scripts')
        );
        break;
      }
      // 4.3
      case '@pattern-lab/edition-twig': {
        const editionPath = path.resolve('./node_modules', edition);
        const editionConfigPath = path.resolve(
          editionPath,
          'patternlab-config.json'
        );
        const editionConfig = require(editionConfigPath);

        pkg.scripts = Object.assign(
          {},
          pkg.scripts || {},
          yield getJSONKey(edition, 'scripts')
        );

        yield copyAsync(
          path.resolve(editionPath, 'alter-twig.php'),
          path.resolve(sourceDir, '../', 'alter-twig.php')
        );

        config = merge(config, editionConfig);
        break;
      }
    }
    yield writeJsonAsync(path.resolve(projectDir, 'package.json'), pkg, {
      spaces: 2,
      EOL: EOL,
    });
    return config;
  });
};

module.exports = installEdition;
