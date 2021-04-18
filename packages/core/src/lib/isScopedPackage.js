'use strict';

const path = require('path');

const scopeMatch = /^@(.*)$/;

/**
 * @name isScopedPackage
 * @desc Checks whether a path in modules belongs to a scoped package
 * @param {string} filePath - The pathname to check
 * @return {Boolean} - Returns a bool when found, false othersie
 */
module.exports = (filePath) => {
  const baseName = path.basename(filePath);
  return scopeMatch.test(baseName);
};
