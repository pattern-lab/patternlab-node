'use strict';

const path = require('path');

/**
 * @func resolvePackageLocations
 * Resolves all possible package locations
 */
const resolvePackageLocations = () => {
  let lookupPath = path.resolve(process.env.projectDir);
  const paths = [lookupPath];
  while (path.dirname(lookupPath) !== lookupPath) {
    lookupPath = path.join(lookupPath, '../');
    paths.push(lookupPath);
  }
  return paths;
};

/**
 * @func resolveFileInPackage
 * Resolves a file inside a package
 */
const resolveFileInPackage = (packageName, ...pathElements) => {
  if (process.env.projectDir) {
    return require.resolve(path.join(packageName, ...pathElements), {
      paths: resolvePackageLocations(),
    });
  } else {
    return require.resolve(path.join(packageName, ...pathElements));
  }
};

/**
 * @func resolvePackageFolder
 * Resolves the location of a package on disc
 */
const resolvePackageFolder = (packageName) => {
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
