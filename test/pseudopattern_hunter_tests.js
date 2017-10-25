"use strict";

var tap = require('tap');

var path = require('path');
var pph = require('../core/lib/pseudopattern_hunter');

var pa = require('../core/lib/pattern_assembler');
var Pattern = require('../core/lib/object_factory').Pattern;
var PatternGraph = require('../core/lib/pattern_graph').PatternGraph;

var config = require('./util/patternlab-config.json');
var engineLoader = require('../core/lib/pattern_engines');
engineLoader.loadAllEngines(config);

var fs = require('fs-extra');
var pattern_assembler = new pa();
var patterns_dir = './test/files/_patterns/';
var public_patterns_dir = './test/public/patterns';

function stubPatternlab() {
  var pl = {};
  pl.graph = PatternGraph.empty();
  pl.config = {
    paths: {
      source: {
        patterns: patterns_dir
      },
      public: {
        patterns: public_patterns_dir
      }
    }
  };
  pl.data = {};
  pl.data.link = {};
  pl.config.debug = 'quiet';
  pl.patterns = [];
  pl.partials = {};
  pl.config.patternStates = {};
  pl.config.outputFileSuffixes = { rendered: ''};

  return pl;
}

tap.test('pseudpattern found and added as a pattern', function (test) {
  //arrange
  var pl = stubPatternlab();

  var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
  atomPattern.template = fs.readFileSync(patterns_dir + '00-test/03-styled-atom.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

  pattern_assembler.addPattern(atomPattern, pl);

  //act
  var patternCountBefore = pl.patterns.length;
  return pph.find_pseudopatterns(atomPattern, pl).then(() => {
    //assert
    test.equals(patternCountBefore + 1, pl.patterns.length);
    test.equals(pl.patterns[1].patternPartial, 'test-styled-atom-alt');
    test.equals(pl.patterns[1].extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), '<span class="test_base {{styleModifier}}"> {{message}} </span>');
    test.equals(JSON.stringify(pl.patterns[1].jsonFileData), JSON.stringify({"message": "alternateMessage"}));
    test.equals(pl.patterns[1].patternLink, '00-test-03-styled-atom-alt' + path.sep + '00-test-03-styled-atom-alt.html');
  });
});

tap.test('pseudpattern variant includes stylePartials and parameteredPartials', function (test) {
  //arrange
  var pl = stubPatternlab();

  var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
  atomPattern.template = fs.readFileSync(patterns_dir + '00-test/03-styled-atom.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.stylePartials = atomPattern.findPartialsWithStyleModifiers(atomPattern);
  atomPattern.parameteredPartials = atomPattern.findPartialsWithPatternParameters(atomPattern);

  var pseudoPattern = new Pattern('00-test/474-pseudomodifier.mustache');
  pseudoPattern.template = fs.readFileSync(patterns_dir + '00-test/474-pseudomodifier.mustache', 'utf8');
  pseudoPattern.extendedTemplate = atomPattern.template;
  pseudoPattern.stylePartials = pseudoPattern.findPartialsWithStyleModifiers(pseudoPattern);
  pseudoPattern.parameteredPartials = pseudoPattern.findPartialsWithPatternParameters(pseudoPattern);

  pattern_assembler.addPattern(atomPattern, pl);
  pattern_assembler.addPattern(pseudoPattern, pl);

  //act
  return pph.find_pseudopatterns(pseudoPattern, pl).then(() => {
    //assert
    test.equals(pl.patterns[2].patternPartial, 'test-pseudomodifier-test');
    test.equals(pl.patterns[2].stylePartials, pseudoPattern.stylePartials);
    test.equals(pl.patterns[2].parameteredPartials, pseudoPattern.parameteredPartials);
  });
});
