'use strict';

const glob = require('glob'),
  _ = require('lodash'),
  path = require('path'),
  yaml = require('js-yaml');

/**
 * Loads a single config file, in yaml/json format.
 *
 * @param dataFilePath - leave off the file extension.
 * @param fsDep
 * @returns {*}
 */
function loadFile(dataFilePath, fsDep) {
  const dataFilesFullPath = `${dataFilePath}.{json,yml,yaml}`;

  if (dataFilePath) {
    const dataFiles = glob.sync(dataFilesFullPath),
      dataFile = _.head(dataFiles);

    if (dataFile && fsDep.existsSync(path.resolve(dataFile))) {
      try {
        return yaml.load(fsDep.readFileSync(path.resolve(dataFile), 'utf8'));
      } catch (err) {
        throw new Error(`Error loading file: ${dataFile} - ${err.message}`);
      }
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

  const globOptions = {};
  if (excludeFileNames) {
    globOptions.ignore = [excludeFullPath];
  }

  const dataFiles = glob.sync(dataFilesFullPath, globOptions);
  let mergeObject = {};

  dataFiles.forEach(function (filePath) {
    try {
      const jsonData = yaml.load(
        fsDep.readFileSync(path.resolve(filePath), 'utf8')
      );
      mergeObject = _.merge(mergeObject, jsonData);
    } catch (err) {
      throw new Error(`Error loading file: ${filePath} - ${err.message}`);
    }
  });

  return mergeObject;
}

module.exports = function configFileLoader() {
  return {
    loadDataFromFile: loadFile,
    loadDataFromFolder: loadDataFromFolder,
  };
};
