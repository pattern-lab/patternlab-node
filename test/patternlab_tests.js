'use strict';

const tap = require('tap');
const rewire = require("rewire");
const _ = require('lodash');
const fs = require('fs-extra');
var config = require('./util/patternlab-config.json');

var plEngineModule = rewire('../core/lib/patternlab');

//set up a global mocks - we don't want to be writing/rendering any files right now
const uiBuilderMock = function(){
  return {
    buildFrontend: function () { }
  };
};

const fsMock = {
  outputFileSync: function (path, content) { /* INTENTIONAL NOOP */},
  readJSONSync: function(path, encoding) {
    return fs.readJSONSync(path, encoding);
  },
  removeSync: function(path) { fs.removeSync(path); },
  emptyDirSync: function(path) { fs.emptyDirSync(path); },
  readFileSync: function(path, encoding) { return fs.readFileSync(path, encoding); },
}

//set our mocks in place of usual require()
plEngineModule.__set__({
  'ui_builder': uiBuilderMock,
  'fs': fsMock
});

tap.test('buildPatternData - should merge all JSON files in the data folder except listitems', function(test){
  var data_dir = './test/files/_data/';

  var pl = new plEngineModule(config);
  var dataResult = pl.buildPatternData(data_dir, fs);
  test.equals(dataResult.data, "test");
  test.equals(dataResult.foo, "bar");
  test.equals(dataResult.test_list_item, undefined);
  test.end();
});

tap.test('buildPatternData - can load json, yaml, and yml files', function(test) {
  const data_dir = './test/files/_data/';

  var pl = new plEngineModule(config);
  var dataResult = pl.buildPatternData(data_dir, fs);
  test.equals(dataResult.from_yml, "from_yml");
  test.equals(dataResult.from_yaml, "from_yaml");
  test.equals(dataResult.from_json, "from_json");
  test.end();
});
