'use strict';

const _ = require('lodash');
const tap = require('tap');
const rewire = require('rewire');
const path = require('path');

const util = require('./util/test_utils.js');
const watchPatternLabFiles = rewire('../src/lib/watchPatternLabFiles');

const patterns_dir = './test/files/_patterns';

tap.test(
  'watchPatternLabFiles - adds watcher to patternlab.watchers for given patternWatchPath',
  (test) => {
    const pl = util.fakePatternLab(patterns_dir, {
      watchers: [],
      engines: {},
    });

    pl.engines.getSupportedFileExtensions = () => {
      return ['.hbs', '.handlebars'];
    };

    watchPatternLabFiles(
      pl,
      {
        source: {
          data: '_data',
          meta: '_meta',
          patterns: 'patterns',
        },
      },
      '/foo',
      true
    );

    // should have two for _data and _meta
    // should have five for '.json', '.yml', '.yaml', '.md', '.hbs' and '.handlebars'
    test.equal(Object.keys(pl.watchers).length, 8);

    test.end();
  }
);
