'use strict';

const tap = require('tap');
const path = require('path');

const lih = require('../src/lib/list_item_hunter');
const list_item_hunter = new lih();
const util = require('./util/test_utils.js');
const loadPattern = require('../src/lib/loadPattern');

const testPatternsPath = path.resolve(__dirname, 'files', '_patterns');

const config = require('./util/patternlab-config.json');
const engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

tap.test(
  'process_list_item_partials converts partial to simpler format',
  test => {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);
    const listPath = path.join('test', 'list.mustache');
    const testPattern = loadPattern(listPath, pl);

    //usually decompose does this
    testPattern.extendedTemplate = testPattern.template;

    //act
    list_item_hunter.process_list_item_partials(testPattern, pl).then(() => {
      //assert
      test.equals(
        util.sanitized(testPattern.extendedTemplate),
        util.sanitized(`
      {{#listItems-three}}
      {{title}}
      {{/listItems-three}}
      `)
      );
      test.end();
    });
  }
);

tap.test(
  'process_list_item_partials converts partial with includes to simpler format',
  test => {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);
    const listPath = path.join('test', 'listWithPartial.mustache');
    const testPattern = loadPattern(listPath, pl);

    //usually decompose does this
    testPattern.extendedTemplate = testPattern.template;

    //act
    list_item_hunter.process_list_item_partials(testPattern, pl).then(() => {
      //assert
      test.equals(
        util.sanitized(testPattern.extendedTemplate),
        util.sanitized(`
      {{#listItems-two}}
      {{> test-comment }}
      {{/listItems-two}}
      `)
      );
      test.end();
    });
  }
);
