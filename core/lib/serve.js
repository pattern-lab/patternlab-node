"use strict";
const plutils = require('./utilities');
const path = require('path');
const process = require('process');
const assetCopier = require('./asset_copy');

let copy = require('recursive-copy'); // eslint-disable-line
let chokidar = require('chokidar'); // eslint-disable-line

const serve = (patternlab) => {
  console.log('serve');
};

module.exports = serve;
