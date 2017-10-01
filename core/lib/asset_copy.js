"use strict";
const plutils = require('./utilities');
let fs = require('fs-extra'); // eslint-disable-line

const asset_copy = () => {
  const copyDirectory = (sourceDirectoryPath, destDirectoryPath) => {
    return fs.copy(sourceDirectoryPath, destDirectoryPath);
  };
};

module.exports = asset_copy;
