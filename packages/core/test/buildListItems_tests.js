'use strict';

const tap = require('tap');
const rewire = require('rewire');

const listItems = require('./files/_data/listitems.json');
const buildlistItems = rewire('../src/lib/buildListItems');

const _Mock = {
  shuffle: function (list) {
    return list;
  },
};

//set our mocks in place of usual require()
buildlistItems.__set__({
  _: _Mock,
});

tap.test(
  'buildlistItems transforms container of listItems with one value',
  (test) => {
    // do this to avoid the shuffling for now
    const container = Object.assign({}, { listitems: { 1: listItems['1'] } });
    buildlistItems(container);
    test.same(container.listitems, {
      'listItems-one': [
        {
          title: 'tA',
          description: 'dA',
          message: 'mA',
        },
      ],
    });
    test.end();
  }
);

tap.test(
  'buildlistItems transforms container of listItems with three values',
  (test) => {
    // do this to avoid the shuffling for now
    const container = { listitems: listItems };
    buildlistItems(container);
    test.same(container.listitems, {
      'listItems-one': [
        {
          title: 'tA',
          description: 'dA',
          message: 'mA',
        },
      ],
      'listItems-two': [
        {
          title: 'tA',
          description: 'dA',
          message: 'mA',
        },
        {
          title: 'tB',
          description: 'dB',
          message: 'mB',
        },
      ],
      'listItems-three': [
        {
          title: 'tA',
          description: 'dA',
          message: 'mA',
        },
        {
          title: 'tB',
          description: 'dB',
          message: 'mB',
        },
        {
          title: 'tC',
          description: 'dC',
          message: 'mC',
        },
      ],
    });
    test.end();
  }
);
