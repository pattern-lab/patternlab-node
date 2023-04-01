'use strict';

const tap = require('tap');

const addPattern = require('../src/lib/addPattern');
var Pattern = require('../src/lib/object_factory').Pattern;
const util = require('./util/test_utils.js');

const patterns_dir = './test/files/_patterns';

tap.test(
  'addPattern - adds pattern extended template to patternlab partial object',
  function (test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var pattern = new Pattern('test/bar.hbs');
    pattern.extendedTemplate = 'barExtended';
    pattern.template = 'bar';

    //act
    addPattern(pattern, patternlab);

    //assert
    test.equal(patternlab.patterns.length, 1);
    test.equal(patternlab.partials['test-bar'] !== undefined, true);
    test.equal(patternlab.partials['test-bar'], 'barExtended');
    test.end();
  }
);

tap.test(
  'addPattern - adds pattern template to patternlab partial object if extendedtemplate does not exist yet',
  function (test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);

    var pattern = new Pattern('test/bar.hbs');
    pattern.extendedTemplate = undefined;
    pattern.template = 'bar';

    //act
    addPattern(pattern, patternlab);

    //assert
    test.equal(patternlab.patterns.length, 1);
    test.equal(patternlab.partials['test-bar'] !== undefined, true);
    test.equal(patternlab.partials['test-bar'], 'bar');
    test.end();
  }
);
