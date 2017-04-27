'use strict';

const tap = require('tap');
const rewire = require("rewire");
const _ = require('lodash');
const fs = require('fs-extra');
var config = require('./util/patternlab-config.json');

var plEngineModule = rewire('../core/lib/patternlab');

//set up a global mocks - we don't want to be writing/rendering any files right now
const uiBuilderMock = {
  buildFrontend: function (patternlab) { }
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

  var dataResult = plEngineModule.build_pattern_data(data_dir, fs);
  test.equals(dataResult.data, "test");
  test.equals(dataResult.foo, "bar");
  test.equals(dataResult.test_list_item, undefined);
  test.end();
});

tap.test('buildPatterns - should replace data link even when pattern parameter present', function(test) {
  //arrange

  var patternExporterMock = {
    /*
     In this test, we actually take advantage of the pattern export functionality post-build to inspect what
     the contents of the patterns look like. This, coupled with a mocking of fs and the ui_builder, allow us to focus
     only on the order of events within build.
     */
    export_patterns: function (patternlab) {
      var pattern = _.find(patternlab.patterns, (pattern) => {
        return pattern.patternPartial === 'test-paramParent';
      });
      //assert
      test.equals(pattern.patternPartialCode.indexOf('00-test-00-foo.rendered.html') > -1, true, 'data link should be replaced properly');
    }
  };

  plEngineModule.__set__({
    'pattern_exporter': patternExporterMock
  });

  config.patternExportPatternPartials = ['test-paramParent'];
  var pl = new plEngineModule(config);

  //act
  pl.build(function() {
    test.end();
  }, true);


});
