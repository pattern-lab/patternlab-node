'use strict';

const tap = require('tap');
const rewire = require('rewire');

const ch = rewire('../src/lib/changes_hunter');

const fsMock = {
  statSync: function () {
    return {
      mtime: {
        getTime: () => {
          return 100;
        },
      },
    };
  },
  pathExistsSync: () => {
    return true;
  },
};

//set our mocks in place of usual require()
ch.__set__({
  fs: fsMock,
});

const changes_hunter = new ch();

tap.test('checkLastModified - sets lastModified to fileTime ', function (test) {
  //arrange
  const mockPattern = { lastModified: 0 };
  //act
  changes_hunter.checkLastModified(mockPattern, {});

  //assert
  test.equal(mockPattern.lastModified, 100);
  test.end();
});

tap.test(
  'checkLastModified - does not alter pattern if file not found',
  function (test) {
    //arrange
    const mockPattern = { lastModified: 1010 };
    //act
    changes_hunter.checkLastModified(mockPattern, null);

    //assert
    test.equal(mockPattern.lastModified, 1010);
    test.end();
  }
);

tap.test(
  'checkLastModified - uses pattern.lastModified if greater than file time',
  function (test) {
    //arrange
    const mockPattern = { lastModified: 101 };
    //act
    changes_hunter.checkLastModified(mockPattern, {});

    //assert
    test.equal(mockPattern.lastModified, 101);
    test.end();
  }
);
