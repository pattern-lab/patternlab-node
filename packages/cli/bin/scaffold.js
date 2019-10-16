'use strict';
const path = require('path');
const execa = require('execa');
const fs = require('fs');
const wrapAsync = require('./utils').wrapAsync;
const mkdirsAsync = require('./utils').mkdirsAsync;

/**
 * @func scaffold
 * @desc Generate file and folder structure for a Pattern Lab project
 * @param {string} projectDir - The project root directory path.
 * @param {string} sourceDir - The source root directory path.
 * @param {string} publicDir - The public root directory path.
 * @param {string} exportDir - The export root directory path.
 * @return {void}
 */
const scaffold = (projectDir, sourceDir, publicDir, exportDir) =>
  wrapAsync(function*() {
    if (!fs.existsSync(path.resolve(projectDir, 'package.json'))) {
      execa.sync('npm', ['init', '-y']);
    }
    /**
     * Create mandatory files structure
     * 1. Create project source directory
     * 2. Create project public directory
     * 3. Create project export directory
     */
    yield Promise.all([
      mkdirsAsync(path.resolve(projectDir, path.normalize(sourceDir))), // 1
      mkdirsAsync(path.resolve(projectDir, path.normalize(publicDir))), // 2
      mkdirsAsync(path.resolve(projectDir, path.normalize(exportDir))), // 3
    ]);
  });

module.exports = scaffold;
