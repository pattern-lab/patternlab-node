'use strict';

const tap = require('tap');

const dataLoader = require('../core/lib/data_loader')();
const data_dir = './test/files/_data/';

tap.test('loadDataFromFile - Load ', function(test){
  const fs = require('fs-extra');
  const data = dataLoader.loadDataFromFile(data_dir + 'foo', fs);
  test.equals(data.foo, 'bar');
  test.end();
});

tap.test('assembleFilename - Load ', function(test){
  const dataFilesPath = data_dir + 'data';
  const dataFilePath = dataLoader.assembleFilename(dataFilesPath);
  test.equals(dataFilePath, dataFilesPath + '.json');
  test.end();
});
