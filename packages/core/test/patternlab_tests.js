'use strict';

const tap = require('tap');
const rewire = require('rewire');
const fs = require('fs-extra');
var config = require('./util/patternlab-config.json');

var plEngineModule = rewire('../src/lib/patternlab');

//set up a global mocks - we don't want to be writing/rendering any files right now
const fsMock = {
  outputFileSync: function(path, content) {
    /* INTENTIONAL NOOP */
  },
  readJSONSync: function(path, encoding) {
    return fs.readJSONSync(path, encoding);
  },
  emptyDir: function(path) {
    return fs.emptyDir(path);
  },
  readFileSync: function(path, encoding) {
    return fs.readFileSync(path, encoding);
  },
};

//set our mocks in place of usual require()
plEngineModule.__set__({
  fs: fsMock,
});

tap.test(
  'buildPatternData - should merge all JSON files in the data folder except listitems',
  function(test) {
    const data_dir = `${__dirname}/files/_data/`;

    var pl = new plEngineModule(config);
    var dataResult = pl.buildPatternData(data_dir, fs);
    test.equals(dataResult.data, 'test');
    test.equals(dataResult.foo, 'bar');
    test.equals(dataResult.test_list_item, undefined);
    test.end();
  }
);

tap.test('buildPatternData - can load json, yaml, and yml files', function(
  test
) {
  const data_dir = `${__dirname}/files/_data/`;

  var pl = new plEngineModule(config);
  var dataResult = pl.buildPatternData(data_dir, fs);
  test.equals(dataResult.from_yml, 'from_yml');
  test.equals(dataResult.from_yaml, 'from_yaml');
  test.equals(dataResult.from_json, 'from_json');
  test.end();
});
