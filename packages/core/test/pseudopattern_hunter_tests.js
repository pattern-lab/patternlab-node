'use strict';

var tap = require('tap');

var path = require('path');
var pph = require('../src/lib/pseudopattern_hunter');

var loadPattern = require('../src/lib/loadPattern');
var Pattern = require('../src/lib/object_factory').Pattern;
var PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
const addPattern = require('../src/lib/addPattern');

var config = require('./util/patternlab-config.json');
var engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

var fs = require('fs-extra');
var patterns_dir = `${__dirname}/files/_patterns/`;
var public_patterns_dir = `${__dirname}/test/public/patterns`;

function stubPatternlab() {
  var pl = {};
  pl.graph = PatternGraph.empty();
  pl.config = {
    paths: {
      source: {
        patterns: patterns_dir,
      },
      public: {
        patterns: public_patterns_dir,
      },
    },
  };
  pl.data = {};
  pl.data.link = {};
  pl.config.logLevel = 'quiet';
  pl.patterns = [];
  pl.partials = {};
  pl.config.patternStates = {};
  pl.config.outputFileSuffixes = { rendered: '' };

  return pl;
}

tap.test('pseudpattern found and added as a pattern', function(test) {
  //arrange
  var pl = stubPatternlab();

  var atomPattern = loadPattern('00-test/03-styled-atom.mustache', pl);
  addPattern(atomPattern, pl);

  //act
  var patternCountBefore = pl.patterns.length;
  return pph.find_pseudopatterns(atomPattern, pl).then(() => {
    //assert
    test.equals(patternCountBefore + 1, pl.patterns.length);
    test.equals(pl.patterns[1].patternPartial, 'test-styled-atom-alt');
    test.equals(
      JSON.stringify(pl.patterns[1].jsonFileData),
      JSON.stringify({ message: 'alternateMessage' })
    );
    test.equals(
      pl.patterns[1].patternLink,
      '00-test-03-styled-atom-alt' +
        path.sep +
        '00-test-03-styled-atom-alt.html'
    );
  });
});

tap.test('pseudpattern does not pollute base pattern data', function(test) {
  //arrange
  var pl = stubPatternlab();

  var atomPattern = loadPattern('00-test/03-styled-atom.mustache', pl);

  //act
  var patternCountBefore = pl.patterns.length;
  return pph.find_pseudopatterns(atomPattern, pl).then(() => {
    //assert
    test.equals(pl.patterns[0].patternPartial, 'test-styled-atom');
    test.equals(
      JSON.stringify(pl.patterns[0].jsonFileData),
      JSON.stringify({ message: 'baseMessage' })
    );
  });
});

tap.test(
  'pseudpattern variant includes stylePartials and parameteredPartials',
  function(test) {
    //arrange
    var pl = stubPatternlab();

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(
      patterns_dir + '00-test/03-styled-atom.mustache',
      'utf8'
    );
    atomPattern.extendedTemplate = atomPattern.template;
    atomPattern.stylePartials = atomPattern.findPartialsWithStyleModifiers(
      atomPattern
    );
    atomPattern.parameteredPartials = atomPattern.findPartialsWithPatternParameters(
      atomPattern
    );

    var pseudoPattern = new Pattern('00-test/474-pseudomodifier.mustache');
    pseudoPattern.template = fs.readFileSync(
      patterns_dir + '00-test/474-pseudomodifier.mustache',
      'utf8'
    );
    pseudoPattern.extendedTemplate = atomPattern.template;
    pseudoPattern.stylePartials = pseudoPattern.findPartialsWithStyleModifiers(
      pseudoPattern
    );
    pseudoPattern.parameteredPartials = pseudoPattern.findPartialsWithPatternParameters(
      pseudoPattern
    );

    addPattern(atomPattern, pl);
    addPattern(pseudoPattern, pl);

    //act
    return pph.find_pseudopatterns(pseudoPattern, pl).then(() => {
      //assert
      test.equals(pl.patterns[2].patternPartial, 'test-pseudomodifier-test');
      test.equals(pl.patterns[2].stylePartials, pseudoPattern.stylePartials);
      test.equals(
        pl.patterns[2].parameteredPartials,
        pseudoPattern.parameteredPartials
      );
    });
  }
);

tap.test('pseudo pattern variant data should merge arrays', function(test) {
  const pl = stubPatternlab();
  pl.config.patternMergeVariantArrays = true;

  const pattern = loadPattern('00-test/475-variant-test.mustache', pl);

  addPattern(pattern, pl);

  return pph.find_pseudopatterns(pattern, pl).then(() => {
    test.equals(pl.patterns[1].patternPartial, 'test-variant-test-merge');
    test.equals(
      JSON.stringify(pl.patterns[1].jsonFileData),
      JSON.stringify({
        a: 2,
        b: [2, 3, 8],
        c: { d: [4, 5, 6, 7], e: 8, f: { a: ['a'], b: ['b', 'x'], c: ['c'] } },
      })
    );
  });
});

tap.test(
  'pseudo pattern variant data should merge arrays if config "patternMergeVariantArrays" is not available as default behavior',
  function(test) {
    const pl = stubPatternlab();

    const pattern = loadPattern('00-test/475-variant-test.mustache', pl);

    addPattern(pattern, pl);

    return pph.find_pseudopatterns(pattern, pl).then(() => {
      test.equals(pl.patterns[1].patternPartial, 'test-variant-test-merge');
      test.equals(
        JSON.stringify(pl.patterns[1].jsonFileData),
        JSON.stringify({
          a: 2,
          b: [2, 3, 8],
          c: {
            d: [4, 5, 6, 7],
            e: 8,
            f: { a: ['a'], b: ['b', 'x'], c: ['c'] },
          },
        })
      );
    });
  }
);

tap.test('pseudo pattern variant data should override arrays', function(test) {
  const pl = stubPatternlab();
  pl.config.patternMergeVariantArrays = false;

  const pattern = loadPattern('00-test/475-variant-test.mustache', pl);

  addPattern(pattern, pl);

  return pph.find_pseudopatterns(pattern, pl).then(() => {
    test.equals(pl.patterns[1].patternPartial, 'test-variant-test-merge');
    test.equals(
      JSON.stringify(pl.patterns[1].jsonFileData),
      JSON.stringify({
        a: 2,
        b: [8],
        c: { d: [6, 7], e: 8, f: { a: ['a'], b: ['x'], c: ['c'] } },
      })
    );
  });
});
