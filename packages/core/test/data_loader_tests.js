'use strict';

const tap = require('tap');

tap.test('loadDataFromFile - Load ', function(test) {
  const fs = require('fs-extra'),
    dataLoader = require('../src/lib/data_loader')(),
    data_dir = `${__dirname}/files/_data/`;

  let data = dataLoader.loadDataFromFile(data_dir + 'foo', fs);
  test.equals(data.foo, 'bar');
  test.end();
});
