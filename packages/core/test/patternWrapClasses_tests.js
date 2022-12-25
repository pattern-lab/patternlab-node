'use strict';

const path = require('path');
const tap = require('tap');

const loadPattern = require('../src/lib/loadPattern');
const patternWrapClassesChangePatternTemplate = require('../src/lib/patternWrapClasses');
const util = require('./util/test_utils.js');
const patternEngines = require('../src/lib/pattern_engines');
const config = require('./util/patternlab-config.json');

patternEngines.loadAllEngines(config);

const patterns_dir = `${__dirname}/files/_patterns`;

tap.test('reading pattern wrap class from markdown', function (test) {
  const patternlab = util.fakePatternLab(patterns_dir);
  patternlab.config = {
    ...patternlab.config,
    patternWrapClassesEnable: true,
    patternWrapClassesKey: ['theme-class'],
  };

  const patternPathMarkdown = path.join(
    'test',
    'pattern-wrap-class-markdown.hbs'
  );
  const patternMarkdown = loadPattern(patternPathMarkdown, patternlab);
  patternWrapClassesChangePatternTemplate(patternlab, patternMarkdown);
  const patternPartialMarkdown =
    '<div class="pl-pattern-wrapper-element markdown-theme-class"></div>';

  test.equal(patternMarkdown.patternPartialCode, patternPartialMarkdown);
  test.end();
});

tap.test('reading pattern wrap class from json', function (test) {
  const patternlab = util.fakePatternLab(patterns_dir);
  patternlab.config = {
    ...patternlab.config,
    patternWrapClassesEnable: true,
    patternWrapClassesKey: ['theme-class'],
  };

  const patternPathJson = path.join('test', 'pattern-wrap-class-json.hbs');
  const patternJson = loadPattern(patternPathJson, patternlab);
  patternWrapClassesChangePatternTemplate(patternlab, patternJson);
  const patternPartialJson =
    '<div class="pl-pattern-wrapper-element json-theme-class"></div>';

  test.equal(patternJson.patternPartialCode, patternPartialJson);
  test.end();
});
