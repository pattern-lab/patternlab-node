'use strict';
const path = require('path');
const _ = require('lodash');

/**
 * @func replaceConfigPaths
 * @desc Immutable replace source and public paths in the passed config.
 * @param {config} config - The passed Pattern Lab config.
 * @param {string} projectDir - The project directory path, defaults to ./
 * @param {string} sourceDir - The source root directory path.
 * @param {string} publicDir - The public root directory path.
 * @param {string} exportDir - The export root directory path.
 * @return {config} - Returns a modified config. Original stays unaltered.
 */
function replaceConfigPaths(
  config,
  projectDir,
  sourceDir,
  publicDir,
  exportDir
) {
  const conf = Object.assign({}, config);
  _.map(conf.paths.source, (value, key) => {
    conf.paths.source[key] = _.isString(value)
      ? value.replace(/^\.\/source/g, path.join(projectDir, sourceDir))
      : value;
  });
  _.map(conf.paths.public, (value, key) => {
    conf.paths.public[key] = _.isString(value)
      ? value.replace(/^\.\/public/g, path.join(projectDir, publicDir))
      : value;
  });
  conf.patternExportDirectory = path.join(projectDir, exportDir);
  return conf;
}

module.exports = replaceConfigPaths;
