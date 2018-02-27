'use strict';

var tap = require('tap');
var rewire = require('rewire');
var _ = require('lodash');
var eol = require('os').EOL;
var Pattern = require('../src/lib/object_factory').Pattern;
var extend = require('util')._extend;
var c = rewire('../src/lib/copier');
var path = require('path');
var config = require('./util/patternlab-config.json');

var engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

//set up a global mocks - we don't want to be writing/rendering any files right now
// var chokidarMock = {
//   watch: function (path, data, cb) { }
// };

// c.__set__({
//   'chokidar': chokidarMock,
// });

const copier = c();

function createFakePatternLab(customProps) {
  var pl = {
    config: {
      paths: {
        source: {
          img: './test/img',
          css: './test/css',
        },
        public: {
          img: './test/output/img',
          css: './test/output/css',
        },
      },
      styleGuideExcludes: [],
      logLevel: 'quiet',
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only',
      },
    },
    data: {},
  };
  return extend(pl, customProps);
}

tap.test(
  'transformConfigPaths takes configuration.paths() and maps to a better key store',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({});

    //act
    var result = copier.transformConfigPaths(patternlab.config.paths);

    //assert
    test.equals(result.img.source, './test/img');
    test.equals(result.img.public, './test/output/img');
    test.equals(result.css.source, './test/css');
    test.equals(result.css.public, './test/output/css');
    test.end();
  }
);
