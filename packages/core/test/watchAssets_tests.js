'use strict';

const _ = require('lodash');
const tap = require('tap');
const rewire = require('rewire');
const path = require('path');

const util = require('./util/test_utils.js');
const watchAssets = rewire('../src/lib/watchAssets');

const patterns_dir = './test/files/_patterns';

tap.test(
  'watchAssets - adds assetWatcher to patternlab.watchers for given key ',
  (test) => {
    const pl = util.fakePatternLab(patterns_dir, { watchers: [] });
    const key = 'images';

    watchAssets(
      pl,
      '/foo',
      { source: '/images', public: '/images' },
      key,
      {},
      true
    );

    test.equal(_.keys(pl.watchers)[0], 'images');

    test.end();
  }
);

tap.test('watchAssets - complete path copied', (test) => {
  const copyFileMock = function (p, des) {
    test.equal(des, path.resolve('/proj/public/images/sample/waterfall.jpg'));
  };

  //set our mocks in place of usual require()
  watchAssets.__set__({
    copyFile: copyFileMock,
  });

  const onWatchTripped = watchAssets.__get__('onWatchTripped');
  onWatchTripped(
    '/proj/source/images/sample/waterfall.jpg',
    '/proj/source/images',
    '/proj',
    { public: '/proj/public/images' },
    {}
  );
  test.end();
});
