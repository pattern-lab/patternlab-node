"use strict";

const glob = require('glob'),
  _ = require('lodash'),
  path = require('path'),
  yaml = require('js-yaml');

/**
 *
 * @param dataFilesPath
 * @param fsDep
 * @returns {*}
 */
function loadFile(dataFilesPath, fsDep) {
  const dataFilesFullPath = dataFilesPath + '*.{json,yml,yaml}';

  const dataFiles = glob.sync(dataFilesFullPath),
    dataFile = _.head(dataFiles);

  if (fsDep.existsSync(path.resolve(dataFile))) {
    return yaml.safeLoad(fsDep.readFileSync(path.resolve(dataFile), 'utf8'));
  }

  return null;
}

/**
 *
 * @param dataFilesPath
 * @param excludeFileNames
 * @param fsDep
 * @returns {{}}
 */
function loadConfigFromFolder(dataFilesPath, excludeFileNames, fsDep) {
  const dataFilesFullPath = dataFilesPath + '*.{json,yml,yaml}',
    excludeFullPath = dataFilesPath + excludeFileNames + '.{json,yml,yaml}';

  const dataFiles = glob.sync(dataFilesFullPath, {"ignore" : [excludeFullPath]});
  let mergeObject = {};

  dataFiles.forEach(function (filePath) {
    let jsonData = yaml.safeLoad(fsDep.readFileSync(path.resolve(filePath), 'utf8'));
    mergeObject = _.merge(mergeObject, jsonData);
  });

  return mergeObject;
}

module.exports = function configFileLoader() {
  return {
    loadConfigFromFile: loadFile,
    loadConfigFromFolder: loadConfigFromFolder
  };
};
