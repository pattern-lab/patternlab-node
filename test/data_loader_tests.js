'use strict';

const tap = require('tap');

tap.test('loadDataFromFile - Load ', function(test){
  const fs = require('fs-extra'),
    dataLoader = require('../core/lib/data_loader')(),
    data_dir = './test/files/_data/';

  let data = dataLoader.loadDataFromFile(data_dir + 'foo', fs);
  test.equals(data.foo, 'bar');
  test.end();
});
