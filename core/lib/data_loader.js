"use strict";

const glob = require('glob'),
  _ = require('lodash'),
  path = require('path'),
  yaml = require('js-yaml');

/**
 * Loads a single config file, in yaml/json format.
 *
 * @param dataFilesPath - leave off the file extension.
 * @param fsDep
 * @returns {*}
 */
function loadFile(dataFilesPath, fsDep) {
  const dataFilesFullPath = dataFilesPath + '*.{json,yml,yaml}';

  if (dataFilesPath) {
    const dataFiles = glob.sync(dataFilesFullPath),
      dataFile = _.head(dataFiles);

    if (dataFile && fsDep.existsSync(path.resolve(dataFile))) {
      return yaml.safeLoad(fsDep.readFileSync(path.resolve(dataFile), 'utf8'));
    }
  }

  return null;
}

/**
 * Loads a set of config files from a folder, in yaml/json format.
 *
 * @param dataFilesPath - leave off the file extension
 * @param excludeFileNames - leave off the file extension
 * @param fsDep
 * @returns Object, with merged data files, empty object if no files.
 */
function loadDataFromFolder(dataFilesPath, excludeFileNames, fsDep) {
  const dataFilesFullPath = dataFilesPath + '*.{json,yml,yaml}',
    excludeFullPath = dataFilesPath + excludeFileNames + '.{json,yml,yaml}';

  let globOptions = {};
  if (excludeFileNames) {
    globOptions.ignore = [excludeFullPath];
  }

  const dataFiles = glob.sync(dataFilesFullPath, globOptions);
  let mergeObject = {};

  dataFiles.forEach(function (filePath) {
    let jsonData = yaml.safeLoad(fsDep.readFileSync(path.resolve(filePath), 'utf8'));
    mergeObject = _.merge(mergeObject, jsonData);
  });

  return mergeObject;
}

module.exports = function configFileLoader() {
  return {
    loadDataFromFile: loadFile,
    loadDataFromFolder: loadDataFromFolder
  };
};
