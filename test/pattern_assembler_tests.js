"use strict";

var tap = require('tap');
var fs = require('fs-extra');
var path = require('path');

var util = require('./util/test_utils.js');
var pa = require('../core/lib/pattern_assembler');
var pattern_assembler = new pa();
var Pattern = require('../core/lib/object_factory').Pattern;
var CompileState = require('../core/lib/object_factory').CompileState;
var PatternGraph = require('../core/lib/pattern_graph').PatternGraph;
var engineLoader = require('../core/lib/pattern_engines');
const addPattern = require('../core/lib/addPattern');
const processIterative = require('../core/lib/processIterative');
const processRecursive = require('../core/lib/processRecursive');

var plMain = require('../core/lib/patternlab');
var config = require('./util/patternlab-config.json');

engineLoader.loadAllEngines(config);

function emptyPatternLab() {
  return {
    graph: PatternGraph.empty()
  }
}

const patterns_dir = './test/files/_patterns';
const public_dir = './test/public';

tap.test('parseDataLinks - replaces found link.* data for their expanded links', function(test) {
  //arrange
  var patternlab = new plMain(config);
  patternlab.graph = PatternGraph.empty();

  patternlab.patterns = [
    Pattern.createEmpty({ patternPartial: 'twitter-brad' }, patternlab),
    Pattern.createEmpty({ patternPartial: 'twitter-dave' }, patternlab),
    Pattern.createEmpty({ patternPartial: 'twitter-brian' }, patternlab)
  ];
  patternlab.data.link = {};

  var navPattern = pattern_assembler.load_pattern_iterative('00-test/nav.mustache', patternlab);
  addPattern(navPattern, patternlab);

  //for the sake of the test, also imagining I have the following pages...
  patternlab.data.link['twitter-brad'] = 'https://twitter.com/brad_frost';
  patternlab.data.link['twitter-dave'] = 'https://twitter.com/dmolsen';
  patternlab.data.link['twitter-brian'] = 'https://twitter.com/bmuenzenmeyer';

  patternlab.data.brad = {url: "link.twitter-brad"};
  patternlab.data.dave = {url: "link.twitter-dave"};
  patternlab.data.brian = {url: "link.twitter-brian"};

  var pattern;
  for (var i = 0; i < patternlab.patterns.length; i++) {
    if (patternlab.patterns[i].patternPartial === 'test-nav') {
      pattern = patternlab.patterns[i];
    }
  }

  //assert before
  test.equals(pattern.jsonFileData.brad.url, "link.twitter-brad", "brad pattern data should be found");
  test.equals(pattern.jsonFileData.dave.url, "link.twitter-dave", "dave pattern data should be found");
  test.equals(pattern.jsonFileData.brian.url, "link.twitter-brian", "brian pattern data should be found");

  //act
  pattern_assembler.parse_data_links(patternlab);

  //assert after
  test.equals(pattern.jsonFileData.brad.url, "https://twitter.com/brad_frost", "brad pattern data should be replaced");
  test.equals(pattern.jsonFileData.dave.url, "https://twitter.com/dmolsen",  "dave pattern data should be replaced");
  test.equals(pattern.jsonFileData.brian.url, "https://twitter.com/bmuenzenmeyer", "brian pattern data should be replaced");

  test.equals(patternlab.data.brad.url, "https://twitter.com/brad_frost", "global brad data should be replaced");
  test.equals(patternlab.data.dave.url, "https://twitter.com/dmolsen", "global dave data should be replaced");
  test.equals(patternlab.data.brian.url, "https://twitter.com/bmuenzenmeyer", "global brian data should be replaced");
  test.end();
});

tap.test('markModifiedPatterns - finds patterns modified since a given date', function(test){
  const fs = require('fs-extra');
  // test/myModule.test.js
  var rewire = require("rewire");

  var pattern_assembler_mock = rewire("../core/lib/pattern_assembler");
  var fsMock = {
    readFileSync: function (path, encoding, cb) {
      return "";
    }
  };
  pattern_assembler_mock.__set__("fs", fsMock);
  //arrange
  var pattern_assembler = new pattern_assembler_mock();
  var patternlab = emptyPatternLab();
  patternlab.config = fs.readJSONSync('./patternlab-config.json');
  patternlab.config.paths.public.patterns = public_dir + "/patterns";
  patternlab.config.outputFileSuffixes = {rendered: '', markupOnly: '.markup-only'};

  var pattern = new Pattern('00-test/01-bar.mustache');
  pattern.extendedTemplate = undefined;
  pattern.template = 'bar';
  pattern.lastModified = new Date("2016-01-31").getTime();
  // Initially the compileState is clean,
  // but we would change this after detecting that the file was modified
  pattern.compileState = CompileState.CLEAN;
  patternlab.patterns = [pattern];

  var lastCompilationRun = new Date("2016-01-01").getTime();
  var modifiedOrNot = pattern_assembler.mark_modified_patterns(lastCompilationRun, patternlab);

  test.same(modifiedOrNot.modified.length, 1, "The pattern was modified after the last compilation");

  // Reset the compile state as it was previously set by pattern_assembler.mark_modified_patterns
  pattern.compileState = CompileState.CLEAN;
  lastCompilationRun = new Date("2016-12-31").getTime();
  modifiedOrNot = pattern_assembler.mark_modified_patterns(lastCompilationRun, patternlab);
  test.same(modifiedOrNot.notModified.length, 1, "Pattern was already compiled and hasn't been modified since last compile");
  test.end();
});

tap.test('markModifiedPatterns - finds patterns when modification date is missing', function(test){
  //arrange
  var patternlab = emptyPatternLab();
  patternlab.partials = {};
  patternlab.data = {link: {}};
  patternlab.config = { logLevel: 'quiet' };
  patternlab.config.outputFileSuffixes = {rendered : ''};

  var pattern = new Pattern('00-test/01-bar.mustache');
  pattern.extendedTemplate = undefined;
  pattern.template = 'bar';
  pattern.lastModified = undefined;
  patternlab.patterns = [pattern];

  let p = pattern_assembler.mark_modified_patterns(1000, patternlab);
  test.same(p.modified.length, 1);
  test.end();
});

// This is the case when we want to force recompilation
tap.test('markModifiedPatterns - finds patterns via compile state', function(test){
  //arrange
  var patternlab = emptyPatternLab();
  patternlab.partials = {};
  patternlab.data = {link: {}};
  patternlab.config = { logLevel: 'quiet' };
  patternlab.config.outputFileSuffixes = {rendered : ''};

  var pattern = new Pattern('00-test/01-bar.mustache');
  pattern.extendedTemplate = undefined;
  pattern.template = 'bar';
  pattern.lastModified = 100000;
  pattern.compileState = CompileState.NEEDS_REBUILD;
  patternlab.patterns = [pattern];

  let p = pattern_assembler.mark_modified_patterns(1000, patternlab);
  test.same(p.modified.length, 1);
  test.end();
});

tap.test('parses pattern title correctly when frontmatter present', function(test){

  //arrange
  var testPatternsPath = path.resolve(__dirname, 'files', '_patterns');
  var pl = util.fakePatternLab(testPatternsPath);

  var testPatternPath = path.join('00-test', '01-bar.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //act
  return Promise.all([
    processIterative(testPattern, pl),
    processRecursive(testPatternPath, pl)
  ]).then((results) => {
    //assert
    test.equals(results[0].patternName, 'An Atom Walks Into a Bar','patternName not overridden');
  }).catch(test.threw);
});

tap.test('parses pattern extra frontmatter correctly when frontmatter present', function(test){

  //arrange
  var testPatternsPath = path.resolve(__dirname, 'files', '_patterns');
  var pl = util.fakePatternLab(testPatternsPath);

  var testPatternPath = path.join('00-test', '01-bar.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //act
  return Promise.all([
    processIterative(testPattern, pl),
    processRecursive(testPatternPath, pl)
  ]).then((results) => {
    //assert
    test.equals(results[0].allMarkdown.joke, 'bad','extra key not added');

  }).catch(test.threw);
});
