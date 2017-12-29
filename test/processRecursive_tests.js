"use strict";

const tap = require('tap');
const fs = require('fs-extra');
const path = require('path');

const util = require('./util/test_utils.js');
const pa = require('../core/lib/pattern_assembler');
const pattern_assembler = new pa();
const Pattern = require('../core/lib/object_factory').Pattern;
const CompileState = require('../core/lib/object_factory').CompileState;
const PatternGraph = require('../core/lib/pattern_graph').PatternGraph;
const engineLoader = require('../core/lib/pattern_engines');
const addPattern = require('../core/lib/addPattern');
const processRecursive = require('../core/lib/processRecursive');
const processIterative = require('../core/lib/processIterative');

var plMain = require('../core/lib/patternlab');
var config = require('./util/patternlab-config.json');

engineLoader.loadAllEngines(config);

const patterns_dir = './test/files/_patterns';

tap.test('process_pattern_recursive recursively includes partials', function (test) {
  //assert
  const patternlab = util.fakePatternLab(patterns_dir);

  var fooPatternPath = path.join('00-test', '00-foo.mustache');
  var fooPattern = pattern_assembler.load_pattern_iterative(fooPatternPath, patternlab);

  var barPatternPath = path.join('00-test', '01-bar.mustache');
  var barPattern = pattern_assembler.load_pattern_iterative(barPatternPath, patternlab);

  var p1 = processIterative(fooPattern, patternlab);
  var p2 = processIterative(barPattern, patternlab);

  Promise.all([p1, p2]).then(() => {
    //act
    processRecursive(fooPatternPath, patternlab).then(() => {
      //assert
      var expectedValue = 'bar';
      test.equals(util.sanitized(fooPattern.extendedTemplate), util.sanitized(expectedValue));
      test.end();
    }).catch(test.threw);
  }).catch(test.threw);
});

  /*

  tap.test('processPatternRecursive - correctly replaces all stylemodifiers when multiple duplicate patterns with different stylemodifiers found', function(test) {
    //arrange
    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

    var groupPattern = new Pattern('00-test/04-group.mustache');
    groupPattern.template = fs.readFileSync(patterns_dir + '/00-test/04-group.mustache', 'utf8');
    groupPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(groupPattern);

    addPattern(atomPattern, pl);
    addPattern(groupPattern, pl);

    //act

    processRecursive('00-test' + path.sep + '04-group.mustache', pl, {});

    //assert
    var expectedValue = '<div class="test_group"> <span class="test_base test_1"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
    test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
    test.end();
  });

  tap.test('processPatternRecursive - correctly replaces multiple stylemodifier classes on same partial', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
    atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

    var groupPattern = new Pattern('00-test/10-multiple-classes-numeric.mustache');
    groupPattern.template = fs.readFileSync(patterns_dir + '/00-test/10-multiple-classes-numeric.mustache', 'utf8');
    groupPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(groupPattern);
    groupPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(groupPattern);

    addPattern(atomPattern, pl);
    addPattern(groupPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '10-multiple-classes-numeric.mustache', pl, {});

    //assert
    var expectedValue = '<div class="test_group"> <span class="test_base foo1"> {{message}} </span> <span class="test_base foo1 foo2"> {{message}} </span> <span class="test_base foo1 foo2"> bar </span> </div>';
    test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
    test.end();
  });

  tap.test('processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

    var mixedPattern = new Pattern('00-test/06-mixed.mustache');
    mixedPattern.template = fs.readFileSync(patterns_dir + '/00-test/06-mixed.mustache', 'utf8');
    mixedPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(mixedPattern);

    addPattern(atomPattern, pl);
    addPattern(mixedPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '06-mixed.mustache', pl, {});

    //assert. here we expect {{styleModifier}} to be in the first group, since it was not replaced by anything. rendering with data will then remove this (correctly)
    var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
    test.equals(mixedPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
    test.end();
  });

  tap.test('processPatternRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier  between', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

    var bookendPattern = new Pattern('00-test/09-bookend.mustache');
    bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/09-bookend.mustache', 'utf8');
    bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);

    addPattern(atomPattern, pl);
    addPattern(bookendPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '09-bookend.mustache', pl, {});

    //assert. here we expect {{styleModifier}} to be in the first and last group, since it was not replaced by anything. rendering with data will then remove this (correctly)
    var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
    var actualValue = bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ');
    test.equals(actualValue.trim(), expectedValue.trim(), 'actual value:\n' + actualValue + '\nexpected value:\n' + expectedValue);
    test.end();
  });

  tap.test('processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier and pattern parameters', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
    atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

    var mixedPattern = new Pattern('00-test/07-mixed-params.mustache');
    mixedPattern.template = fs.readFileSync(patterns_dir + '/00-test/07-mixed-params.mustache', 'utf8');
    mixedPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(mixedPattern);
    mixedPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(mixedPattern);

    addPattern(atomPattern, pl);
    addPattern(mixedPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '07-mixed-params.mustache', pl, {});

    //assert. here we expect {{styleModifier}} to be in the first span, since it was not replaced by anything. rendering with data will then remove this (correctly)
    var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base test_4"> 4 </span> </div>';
    test.equals(mixedPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
    test.end();
  });

  tap.test('processPatternRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier and pattern parameters between', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
    atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

    var bookendPattern = new Pattern('00-test/08-bookend-params.mustache');
    bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/08-bookend-params.mustache', 'utf8');
    bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);
    bookendPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(bookendPattern);

    addPattern(atomPattern, pl);
    addPattern(bookendPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '08-bookend-params.mustache', pl, {});

    //assert. here we expect {{styleModifier}} to be in the first and last span, since it was not replaced by anything. rendering with data will then remove this (correctly)
    var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
    test.equals(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
    test.end();
  });

  tap.test('processPatternRecursive - does not pollute previous patterns when a later one is found with a styleModifier', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
    atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

    var anotherPattern = new Pattern('00-test/12-another-styled-atom.mustache');
    anotherPattern.template = fs.readFileSync(patterns_dir + '/00-test/12-another-styled-atom.mustache', 'utf8');
    anotherPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(anotherPattern);
    anotherPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(anotherPattern);

    addPattern(atomPattern, pl);
    addPattern(anotherPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '12-another-styled-atom.mustache', pl, {});

    //assert
    var expectedCleanValue = '<span class="test_base {{styleModifier}}"> {{message}} </span>';
    var expectedSetValue = '<span class="test_base test_1"> {{message}} </span>';

    //this is the "atom" - it should remain unchanged
    test.equals(atomPattern.template.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedCleanValue.trim());
    test.equals(atomPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedCleanValue.trim());

    // this is the style modifier pattern, which should resolve correctly
    test.equals(anotherPattern.template.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), '{{> test-styled-atom:test_1 }}');
    test.equals(anotherPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedSetValue.trim());

    test.end();
  });

  tap.test('processPatternRecursive - ensure deep-nesting works', function(test) {
    //arrange
    var fs = require('fs-extra');
    var pattern_assembler = new pa();
    var patterns_dir = './test/files/_patterns';

    var pl = emptyPatternLab();
    pl.config = {
      paths: {
        source: {
          patterns: patterns_dir
        }
      },
      outputFileSuffixes: {
        rendered: ''
      }
    };
    pl.data = {};
    pl.data.link = {};
    pl.config.logLevel = 'quiet';
    pl.patterns = [];
    pl.partials = {};

    var atomPattern = new Pattern('00-test/01-bar.mustache');
    atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/01-bar.mustache', 'utf8');
    atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
    atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

    var templatePattern = new Pattern('00-test/00-foo.mustache');
    templatePattern.template = fs.readFileSync(patterns_dir + '/00-test/00-foo.mustache', 'utf8');
    templatePattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(templatePattern);
    templatePattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(templatePattern);

    var pagesPattern = new Pattern('00-test/14-inception.mustache');
    pagesPattern.template = fs.readFileSync(patterns_dir + '/00-test/14-inception.mustache', 'utf8');
    pagesPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(pagesPattern);
    pagesPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(pagesPattern);

    addPattern(atomPattern, pl);
    addPattern(templatePattern, pl);
    addPattern(pagesPattern, pl);

    //act
    processRecursive('00-test' + path.sep + '14-inception.mustache', pl, {});

    //assert
    var expectedCleanValue = 'bar';
    var expectedSetValue = 'bar';

    //this is the "atom" - it should remain unchanged
    test.equals(atomPattern.template.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedCleanValue);
    test.equals(atomPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedCleanValue);

    //this is the "template pattern" - it should have an updated extendedTemplate but an unchanged template
    test.equals(templatePattern.template.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), '{{> test-bar }}');
    test.equals(templatePattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedSetValue.trim());

    //this is the "pages pattern" - it should have an updated extendedTemplate equal to the template pattern but an unchanged template
    test.equals(pagesPattern.template.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), '{{> test-foo }}');
    test.equals(pagesPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedSetValue.trim());
    test.end();
  });

  tap.test('processPatternRecursive - 685 ensure listitems data is used', function(test) {
    //arrange
    var pattern_assembler = new pa();
    var testPatternsPath = path.resolve(__dirname, 'files', '_patterns');
    var pl = util.fakePatternLab(testPatternsPath);
    pl.data.title = "0";
    pl.listitems = {
      "1": {
        "title": "1"
      },
      "2": {
        "title": "2"
      },
      "3": {
        "title": "3"
      }
    };

    pattern_assembler.combine_listItems(pl);

    var listPatternPath = path.join('00-test', '685-list.mustache');
    var listPattern = pattern_assembler.load_pattern_iterative(listPatternPath, pl);

    return Promise.all([
      pattern_assembler.process_pattern_iterative(listPattern, pl)
    ]).then((results) => {

       //act
      processRecursive(listPatternPath, pl);

      //assert
      test.true(results[0].extendedTemplate.indexOf(1) > -1);
      test.true(results[0].extendedTemplate.indexOf(2) > -1);
      test.true(results[0].extendedTemplate.indexOf(3) > -1);
      test.end();
    }).catch(test.threw);
  });

  tap.test('hidden patterns can be called by their nice names', function(test){
  //arrange
  var testPatternsPath = path.resolve(__dirname, 'files', '_patterns');
  var pl = util.fakePatternLab(testPatternsPath);
  var pattern_assembler = new pa();

  //act
  var hiddenPatternPath = path.join('00-test', '_00-hidden-pattern.mustache');
  var testPatternPath = path.join('00-test', '15-hidden-pattern-tester.mustache');

  var hiddenPattern = pattern_assembler.load_pattern_iterative(hiddenPatternPath, pl);
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  return Promise.all([
    pattern_assembler.process_pattern_iterative(hiddenPattern, pl),
    pattern_assembler.process_pattern_iterative(testPattern, pl)
  ]).then((results) => {
    pattern_assembler.process_pattern_recursive(hiddenPatternPath, pl);
    pattern_assembler.process_pattern_recursive(testPatternPath, pl);

    //assert
    test.equals(util.sanitized(results[1].render()), util.sanitized('Hello there! Here\'s the hidden atom: [This is the hidden atom]'), 'hidden pattern rendered output not as expected');
  }).catch(test.threw);
});

  */
