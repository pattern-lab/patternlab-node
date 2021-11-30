'use strict';

const path = require('path');

const isScopedPackage = require('./isScopedPackage');

let fs = require('fs-extra'); // eslint-disable-line

const isDir = (fPath) => {
  const stats = fs.lstatSync(fPath);
  return stats.isDirectory() || stats.isSymbolicLink();
};

module.exports = (dir, filter) => {
  /**
   * @name findModules
   * @desc Traverse the given path and gather possible engines
   * @param  {string} fPath - The file path to traverse
   * @param  {Array<Engine>} foundModules - An array of modules
   * @return {Array<Engine>} - The final array of engines
   */
  const findModules = (fPath, foundModules) => {
    /**
     * @name dirList
     * @desc A list of all directories in the given path
     * @type {Array<string>}
     */
    const dirList = fs
      .readdirSync(fPath)
      .filter((p) => isDir(path.join(fPath, p)));

    /**
     * @name m
     * @desc For the current dir get all modules
     * @type {Array<Engine>}
     */
    const m = foundModules.concat(
      dirList.filter(filter).map((mod) => {
        return {
          name: filter(mod),
          modulePath: path.join(fPath, mod),
        };
      })
    );

    /**
     * 1. Flatten all engines from inner recursions and current dir
     * 2. Filter the dirList for scoped packages
     * 3. Map over every scoped package and recurse into it to find scoped modules
     */
    return [].concat(
      ...m,
      ...dirList
        .filter(isScopedPackage) // 2
        .map((scope) => findModules(path.join(fPath, scope), m)) // 3
    );
  };

  return findModules(dir, []);
};
