'use strict';

var tap = require('tap');
var rewire = require('rewire');

var Pattern = require('../src/lib/object_factory').Pattern;
var CompileState = require('../src/lib/object_factory').CompileState;
var PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
var engineLoader = require('../src/lib/pattern_engines');

const markModifiedPatterns = rewire('../src/lib/markModifiedPatterns');

const config = require('./util/patternlab-config.json');

const fsMock = {
  readFileSync: function (path, encoding, cb) {
    return '';
  },
};

function emptyPatternLab() {
  return {
    graph: PatternGraph.empty(),
  };
}

const public_dir = './test/public';

tap.only(
  'markModifiedPatterns - finds patterns modified since a given date',
  function (test) {
    //arrange
    markModifiedPatterns.__set__('fs', fsMock);

    var patternlab = emptyPatternLab();
    patternlab.config = config;
    patternlab.config.paths.public.patterns = public_dir + '/patterns';
    patternlab.config.outputFileSuffixes = {
      rendered: '',
      markupOnly: '.markup-only',
    };

    var pattern = new Pattern('test/bar.hbs');

    pattern.extendedTemplate = undefined;
    pattern.template = 'bar';
    pattern.lastModified = new Date('2016-01-31').getTime();

    // Initially the compileState is clean,
    // but we would change this after detecting that the file was modified
    pattern.compileState = CompileState.CLEAN;
    patternlab.patterns = [pattern];

    var lastCompilationRun = new Date('2016-01-01').getTime();
    var modifiedOrNot = markModifiedPatterns(lastCompilationRun, patternlab);

    test.same(
      modifiedOrNot.modified.length,
      1,
      'The pattern was modified after the last compilation'
    );

    // Reset the compile state as it was previously set by pattern_assembler.mark_modified_patterns
    pattern.compileState = CompileState.CLEAN;
    lastCompilationRun = new Date('2016-12-31').getTime();
    modifiedOrNot = markModifiedPatterns(lastCompilationRun, patternlab);
    test.same(
      modifiedOrNot.notModified.length,
      1,
      "Pattern was already compiled and hasn't been modified since last compile"
    );
    test.end();
  }
);

tap.test(
  'markModifiedPatterns - finds patterns when modification date is missing',
  function (test) {
    //arrange
    var patternlab = emptyPatternLab();
    patternlab.partials = {};
    patternlab.data = { link: {} };
    patternlab.config = { logLevel: 'quiet' };
    patternlab.config.outputFileSuffixes = { rendered: '' };

    var pattern = new Pattern('test/bar.hbs');
    pattern.extendedTemplate = undefined;
    pattern.template = 'bar';
    pattern.lastModified = undefined;
    patternlab.patterns = [pattern];

    let p = markModifiedPatterns(1000, patternlab);
    test.same(p.modified.length, 1);
    test.end();
  }
);

// This is the case when we want to force recompilation
tap.test(
  'markModifiedPatterns - finds patterns via compile state',
  function (test) {
    //arrange
    var patternlab = emptyPatternLab();
    patternlab.partials = {};
    patternlab.data = { link: {} };
    patternlab.config = { logLevel: 'quiet' };
    patternlab.config.outputFileSuffixes = { rendered: '' };

    var pattern = new Pattern('test/bar.hbs');
    pattern.extendedTemplate = undefined;
    pattern.template = 'bar';
    pattern.lastModified = 100000;
    pattern.compileState = CompileState.NEEDS_REBUILD;
    patternlab.patterns = [pattern];

    let p = markModifiedPatterns(1000, patternlab);
    test.same(p.modified.length, 1);
    test.end();
  }
);
