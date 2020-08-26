'use strict';

const path = require('path');

/**
 * @func resolveFileInPackage
 * Resolves a file inside a package
 */
const resolveFileInPackage = (packageName, ...pathElements) => {
  return require.resolve(path.join(packageName, ...pathElements));
};

/**
 * @func resolvePackageFolder
 * Resolves the location of a package on disc
 */
const resolvePackageFolder = packageName => {
  return path.dirname(resolveFileInPackage(packageName, 'package.json'));
};

/**
 * @func resolveDirInPackage
 * Resolves a file inside a package
 */
const resolveDirInPackage = (packageName, ...pathElements) => {
  return path.join(resolvePackageFolder(packageName), ...pathElements);
};

module.exports = {
  resolveFileInPackage,
  resolveDirInPackage,
  resolvePackageFolder,
};
