'use strict';

const tap = require('tap');

tap.test('buildPatternData - should merge all JSON files in the data folder except listitems', function(test){
  const fs = require('fs-extra'),
    plMain = require('../core/lib/patternlab'),
    data_dir = './test/files/_data/';

  let dataResult = plMain.build_pattern_data(data_dir, fs);
  test.equals(dataResult.data, "test");
  test.equals(dataResult.foo, "bar");
  test.equals(dataResult.test_list_item, undefined);
  test.end();
});

tap.test('buildPatternData - can load json, yaml, and yml files', function(test) {
  const fs = require('fs-extra'),
    plMain = require('../core/lib/patternlab'),
    data_dir = './test/files/_data/';

  let dataResult = plMain.build_pattern_data(data_dir, fs);
  test.equals(dataResult.from_yml, "from_yml");
  test.equals(dataResult.from_yaml, "from_yaml");
  test.equals(dataResult.from_json, "from_json");
  test.end();
});
