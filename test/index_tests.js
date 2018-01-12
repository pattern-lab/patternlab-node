const tap = require('tap');
const rewire = require("rewire");
const _ = require('lodash');
const fs = require('fs-extra');

const util = require('./util/test_utils.js');
const entry = rewire('../core/index');
const defaultConfig = require('../patternlab-config.json');
var testConfig = require('./util/patternlab-config.json');

//set up a global mocks - we don't want to be writing/rendering any files right now

const assetCopierMock = function () {
  return {copyAssets: function () {} }
}

const uiBuilderMock = function () {
  return {
    buildFrontend: function () { return Promise.resolve(); }
  };
};

const fsMock = {
  outputFileSync: function (path, content) { /* INTENTIONAL NOOP */},
  readJSONSync: function(path, encoding) {
    return fs.readJSONSync(path, encoding);
  },
  removeSync: function (path) { fs.removeSync(path); },
  emptyDirSync: function (path) { fs.emptyDirSync(path); },
  readFileSync: function (path, encoding) { return fs.readFileSync(path, encoding); },
}

//set our mocks in place of usual require()
entry.__set__({
  'ui_builder': uiBuilderMock,
  'fs': fsMock,
  'assetCopier': assetCopierMock
});

tap.test('getDefaultConfig - should return the default config object', function (test) {
  const requestedConfig = entry.getDefaultConfig();
  test.type(requestedConfig, 'object');
  test.equals(requestedConfig, defaultConfig);
  test.end();
});

tap.test('buildPatterns - should replace data link even when pattern parameter present', function (test) {
  //arrange
  test.plan(2);

  var patternExporterMock = {
    /*
     In this test, we actually take advantage of the pattern export functionality post-build to inspect what
     the contents of the patterns look like. This, coupled with a mocking of fs and the ui_builder, allow us to focus
     only on the order of events within build.
     */
    export_patterns: function (patternlab) {
      var pattern = _.find(patternlab.patterns, (p) => {
        return p.patternPartial === 'test-paramParent';
      });

      //assert
      test.equals(util.sanitized(pattern.extendedTemplate), '<div class="foo"> <a href="{{url}}">Cool Dude</a> </div>', 'partial inclusion completes');
      test.equals(pattern.patternPartialCode.indexOf('00-test-00-foo.rendered.html') > -1, true, 'data link should be replaced properly');
      test.end();
    }
  };

  entry.__set__({
    'pattern_exporter': patternExporterMock
  });

  testConfig.patternExportPatternPartials = ['test-paramParent'];
  var pl = new entry(testConfig);

  //act
  return pl.build({cleanPublic: true});
});
