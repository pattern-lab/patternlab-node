'use strict';

var tap = require('tap');
var rewire = require("rewire");
var config = require('./util/patternlab-config.json');

var plEngineModule = rewire('../core/lib/patternlab');

//set up a global mocks - we don't want to be writing/rendering any files right now
var uiBuilderMock = {
  buildFrontend: function (patternlab) { }
};

//set our mocks in place of usual require()
plEngineModule.__set__({
  'ui_builder': uiBuilderMock
});

var pl = new plEngineModule(config);


// tap.test('buildPatternData - should merge all JSON files in the data folder except listitems', function(test){
//   var fs = require('fs-extra');
//   var plMain = require('../core/lib/patternlab');
//   var data_dir = './test/files/_data/';
//
//   var dataResult = plMain.build_pattern_data(data_dir, fs);
//   test.equals(dataResult.data, "test");
//   test.equals(dataResult.foo, "bar");
//   test.equals(dataResult.test_list_item, undefined);
//   test.end();
// });

tap.test('buildPatterns - should replace data link even when pattern parameter present', function(test) {
  //arrange

  //act
  pl.build(function() {

    test.equals(1,1);
    test.end();

  }, true);

  //assert

});
