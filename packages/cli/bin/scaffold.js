'use strict';
const path = require('path');
const execa = require('execa');
const fs = require('fs-extra');
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
  wrapAsync(function* () {
    const projectPath = path.join(process.cwd(), projectDir);
    if (!fs.existsSync(path.join(projectPath, 'package.json'))) {
      fs.ensureDirSync(projectPath);
      execa.sync('npm', ['init', '-y'], {
        cwd: projectPath,
      });
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
