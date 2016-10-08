'use strict';

var tap = require('tap');

tap.test('buildPatternData - should merge all JSON files in the data folder except listitems', function(test){
  var fs = require('fs-extra');
        var plMain = require('../core/lib/patternlab');
  var data_dir = './test/files/_data/';

  var dataResult = plMain.build_pattern_data(data_dir, fs);
  test.equals(dataResult.data, "test");
  test.equals(dataResult.foo, "bar");
  test.equals(dataResult.test_list_item, undefined);
  test.end();
});
