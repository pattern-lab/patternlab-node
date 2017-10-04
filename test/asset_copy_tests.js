"use strict";

var tap = require('tap');
var rewire = require("rewire");
var _ = require('lodash');
var eol = require('os').EOL;
var Pattern = require('../core/lib/object_factory').Pattern;
var extend = require('util')._extend;
var ac = rewire('../core/lib/asset_copy');
var path = require('path');
var config = require('./util/patternlab-config.json');

var engineLoader = require('../core/lib/pattern_engines');
engineLoader.loadAllEngines(config);

//set up a global mocks - we don't want to be writing/rendering any files right now
// var chokidarMock = {
//   watch: function (path, data, cb) { }
// };

// ac.__set__({
//   'chokidar': chokidarMock,
// });

const assetCopier = ac();

function createFakePatternLab(customProps) {
  var pl = {
    config: {
      paths: {
        source: {
          img: './test/img',
          css: './test/css'
        },
        public: {
          img: './test/output/img',
          css: './test/output/css'
        }
      },
      styleGuideExcludes: [ ],
      debug: false,
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    },
    data: {}
  };
  return extend(pl, customProps);
}

// tap.test('transformConfigPaths takes configuration.paths() and maps to a better key store', function (test) {
//   //arrange
//   var patternlab = createFakePatternLab({});

//   //act
//   var result = assetCopy.transformConfigPaths(patternlab.config.paths);

//   //assert
//   test.equals(result.img.source, './test/img');
//   test.equals(result.img.public, './test/output/img');
//   test.equals(result.css.source, './test/css');
//   test.equals(result.css.public, './test/output/css');
//   test.end();
// });

tap.test('assetCopier does stuff', function(test) {
  //arrange
  var patternlab = createFakePatternLab({});

  //act

  assetCopier.copyAssets(patternlab.config.paths, {});

  //assert

  test.end();
})
