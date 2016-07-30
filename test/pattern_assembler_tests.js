(function () {
  "use strict";

  var pa = require('../core/lib/pattern_assembler');
  var Pattern = require('../core/lib/object_factory').Pattern;
  var path = require('path');

  exports['pattern_assembler'] = {
    'process_pattern_recursive recursively includes partials' : function(test){
      test.expect(3);

      //tests inclusion of partial that will be discovered by diveSync later in iteration than parent
      //prepare to diveSync
      var fs = require('fs-extra');
      var plMain = require('../core/lib/patternlab');
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';
      var patternlab = {};
      patternlab.config = fs.readJSONSync('./patternlab-config.json');
      patternlab.config.paths.source.patterns = patterns_dir;

      //patternlab.data = fs.readJSONSync(path.resolve(patternlab.config.paths.source.data, 'data.json'));
      patternlab.data = {};
      //patternlab.listitems = fs.readJSONSync(path.resolve(patternlab.config.paths.source.data, 'listitems.json'));
      patternlab.listitems = {};
      //patternlab.header = fs.readFileSync(path.resolve(patternlab.config.paths.source.patternlabFiles, 'templates/pattern-header-footer/header.html'), 'utf8');
      patternlab.header = '';
      //patternlab.footer = fs.readFileSync(path.resolve(patternlab.config.paths.source.patternlabFiles, 'templates/pattern-header-footer/footer.html'), 'utf8');
      patternlab.footer = '';
      patternlab.patterns = [];
      patternlab.data.link = {};
      patternlab.partials = {};

      //iteratively populate the patternlab object
      plMain.process_all_patterns_iterative(pattern_assembler, patterns_dir, patternlab);

      // preprocess partials so they can be recursively included respecting any parameters they may be submitting
      var engine;
      for (var i = 0; i < patternlab.patterns.length; i++) {
        if (patternlab.patterns[i].isPattern) {
            engine = patternlab.patterns[i].engine;
            break;
        }
      }

      if (typeof engine.preprocessPartials === 'function') {
        engine.preprocessPartials(pattern_assembler, patternlab);
      }

      //recursively include partials, filling out the
      //extendedTemplate property of the patternlab.patterns elements
      plMain.process_all_patterns_recursive(pattern_assembler, patterns_dir, patternlab);

      //get test output for comparison
      var foo = fs.readFileSync(patterns_dir + '/00-test/00-foo.mustache', 'utf8').trim();
      var bar = fs.readFileSync(patterns_dir + '/00-test/01-bar.mustache', 'utf8').trim();
      var fooExtended;

      //get extended pattern
      for(var i = 0; i < patternlab.patterns.length; i++){
        if(patternlab.patterns[i].fileName === '00-foo'){
          fooExtended = patternlab.patterns[i].extendedTemplate.trim();
          break;
        }
      }

      //check initial values
      test.equals(foo, '{{> test-bar }}');
      test.equals(bar, 'bar');
      //test that 00-foo.mustache included partial 01-bar.mustache
      test.equals(fooExtended, 'bar');

      test.done();
    },

    'processPatternRecursive - correctly replaces all stylemodifiers when multiple duplicate patterns with different stylemodifiers found' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};

      var groupPattern = pattern_assembler.process_pattern_iterative('00-test/04-group.mustache', pl);
      pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      groupPattern.engine.preprocessPartials(pattern_assembler, pl);
      pattern_assembler.process_pattern_recursive(groupPattern.relPath, pl, groupPattern);

      //assert
      var expectedValue = '<div class="test_group"> <span class="test_base test_1"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
      test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },
    'processPatternRecursive - correctly replaces multiple stylemodifier classes on same partial' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};

      var groupPattern = pattern_assembler.process_pattern_iterative('00-test/10-multiple-classes-numeric.mustache', pl);
      pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      groupPattern.engine.preprocessPartials(pattern_assembler, pl);
      pattern_assembler.process_pattern_recursive(groupPattern.relPath, pl, groupPattern);

      //act
      pattern_assembler.process_pattern_recursive('00-test/10-multiple-classes-numeric.mustache', pl, groupPattern);

      //assert
      var expectedValue = '<div class="test_group"> <span class="test_base foo1"> {{message}} </span> <span class="test_base foo1 foo2"> {{message}} </span> <span class="test_base foo1 foo2"> bar </span> </div>';
      test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },
    'processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};

      var mixedPattern = pattern_assembler.process_pattern_iterative('00-test/06-mixed.mustache', pl);
      pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      mixedPattern.engine.preprocessPartials(pattern_assembler, pl);
      pattern_assembler.process_pattern_recursive(mixedPattern.relPath, pl, mixedPattern);

      //assert. here we expect {{styleModifier}} to be in the first group, since it was not replaced by anything. rendering with data will then remove this (correctly)
      var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
      test.equals(mixedPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },
    'processPatternRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier  between' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};

      var bookendPattern = pattern_assembler.process_pattern_iterative('00-test/09-bookend.mustache', pl);
      pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      bookendPattern.engine.preprocessPartials(pattern_assembler, pl);
      pattern_assembler.process_pattern_recursive(bookendPattern.relPath, pl, bookendPattern);

      //assert. here we expect {{styleModifier}} to be in the first and last group, since it was not replaced by anything. rendering with data will then remove this (correctly)
      var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
      var actualValue = bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ');
      test.equals(actualValue.trim(), expectedValue.trim(), 'actual value:\n' + actualValue + '\nexpected value:\n' + expectedValue);
      test.done();
    },
    'processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier and pattern parameters' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};

      var mixedPattern = pattern_assembler.process_pattern_iterative('00-test/07-mixed-params.mustache', pl);
      pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      mixedPattern.engine.preprocessPartials(pattern_assembler, pl);
      pattern_assembler.process_pattern_recursive(mixedPattern.relPath, pl, mixedPattern);

      //assert. here we expect {{styleModifier}} to be in the first span, since it was not replaced by anything. rendering with data will then remove this (correctly)
      var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base test_4"> 4 </span> </div>';
      test.equals(mixedPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },
    'processPatternRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier and pattern parameters between' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};

      var bookendPattern = pattern_assembler.process_pattern_iterative('00-test/08-bookend-params.mustache', pl);
      pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      bookendPattern.engine.preprocessPartials(pattern_assembler, pl);
      pattern_assembler.process_pattern_recursive(bookendPattern.relPath, pl, bookendPattern);

      //assert. here we expect {{styleModifier}} to be in the first and last span, since it was not replaced by anything. rendering with data will then remove this (correctly)
      var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
      test.equals(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },
    'setState - applies any patternState matching the pattern' : function(test){
      //arrange
      var pa = require('../core/lib/pattern_assembler');
      var pattern_assembler = new pa();
      var patternlab = {};
      patternlab.config = {};
      patternlab.config.patternStates = {};
      patternlab.config.patternStates["pages-homepage-emergency"] = "inprogress";

      var pattern = {
        patternPartial: "pages-homepage-emergency"
      };

      //act
      pattern_assembler.setPatternState(pattern, patternlab);

      //assert
      test.equals(pattern.patternState, "inprogress");
      test.done();
    },
    'setState - does not apply any patternState if nothing matches the pattern' : function(test){
      //arrange
      var pa = require('../core/lib/pattern_assembler');
      var pattern_assembler = new pa();
      var patternlab = {};
      patternlab.config = {};
      patternlab.config.patternStates = {};
      patternlab.config.patternStates["pages-homepage-emergency"] = "inprogress";

      var pattern = {
        key: "pages-homepage",
        patternState: ""
      };

      //act
      pattern_assembler.setPatternState(pattern, patternlab);

      //assert
      test.equals(pattern.patternState, "");
      test.done();
    },
    'parseDataLinks - replaces found link.* data for their expanded links' : function(test){
      //arrange
      var diveSync = require('diveSync');
      var fs = require('fs-extra');
      var pa = require('../core/lib/pattern_assembler');
      var plMain = require('../core/lib/patternlab');
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns/';
      var patternlab = {};
      //THIS IS BAD
      patternlab.config = fs.readJSONSync('./patternlab-config.json');
      patternlab.config.paths.source.patterns = patterns_dir;
      patternlab.data = {};
      patternlab.listitems = {};
      patternlab.header = {};
      patternlab.footer = {};
      //patternlab.data = fs.readJSONSync(path.resolve(patternlab.config.paths.source.data, 'data.json'));
      //patternlab.listitems = fs.readJSONSync(path.resolve(patternlab.config.paths.source.data, 'listitems.json'));
      //patternlab.header = fs.readFileSync(path.resolve(patternlab.config.paths.source.patternlabFiles, 'templates/pattern-header-footer/header.html'), 'utf8');
      //patternlab.footer = fs.readFileSync(path.resolve(patternlab.config.paths.source.patternlabFiles, 'templates/pattern-header-footer/footer.html'), 'utf8');
      patternlab.patterns = [];
      patternlab.data.link = {};
      patternlab.partials = {};

      //diveSync once to perform iterative populating of patternlab object
      plMain.process_all_patterns_iterative(pattern_assembler, patterns_dir, patternlab);

      //for the sake of the test, also imagining I have the following pages...
      patternlab.data.link['twitter-brad'] = 'https://twitter.com/brad_frost';
      patternlab.data.link['twitter-dave'] = 'https://twitter.com/dmolsen';
      patternlab.data.link['twitter-brian'] = 'https://twitter.com/bmuenzenmeyer';

      patternlab.data.brad = { url: "link.twitter-brad" };
      patternlab.data.dave = {  url: "link.twitter-dave" };
      patternlab.data.brian = {  url: "link.twitter-brian" };


      var pattern;
      for(var i = 0; i < patternlab.patterns.length; i++){
        if(patternlab.patterns[i].patternPartial === 'test-nav'){
          pattern = patternlab.patterns[i];
        }
      }

      //assert before
      test.equals(pattern.jsonFileData.brad.url, "link.twitter-brad");
      test.equals(pattern.jsonFileData.dave.url, "link.twitter-dave");
      test.equals(pattern.jsonFileData.brian.url, "link.twitter-brian");

      //act
      pattern_assembler.parse_data_links(patternlab);

      //assert after
      test.equals(pattern.jsonFileData.brad.url, "https://twitter.com/brad_frost");
      test.equals(pattern.jsonFileData.dave.url, "https://twitter.com/dmolsen");
      test.equals(pattern.jsonFileData.brian.url, "https://twitter.com/bmuenzenmeyer");

      test.equals(patternlab.data.brad.url, "https://twitter.com/brad_frost");
      test.equals(patternlab.data.dave.url, "https://twitter.com/dmolsen");
      test.equals(patternlab.data.brian.url, "https://twitter.com/bmuenzenmeyer");
      test.done();
    },
    'get_pattern_by_key - returns the fuzzy result when no others found' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patternlab = {};
      patternlab.patterns = [];

      patternlab.patterns.push({
        patternPartial: 'character-han-solo',
        subdir: 'character',
        fileName: 'han-solo'
      });

      //act
      var result = pattern_assembler.findPartial('character-han', patternlab);
      //assert
      test.equals(result, patternlab.patterns[0]);
      test.done();
    },
    'get_pattern_by_key - returns the exact key if found' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patternlab = {};
      patternlab.patterns = [];

      patternlab.patterns.push({
        patternPartial: 'molecules-primary-nav-jagged',
        subdir: 'molecules',
        fileName: 'primary-nav-jagged'
      }, {
        patternPartial: 'molecules-primary-nav',
        subdir: 'molecules',
        fileName: 'molecules-primary-nav'
      });

      //act
      var result = pattern_assembler.findPartial('molecules-primary-nav', patternlab);
      //assert
      test.equals(result, patternlab.patterns[1]);
      test.done();
    },
    'addPattern - adds pattern extended template to patternlab partial object' : function(test){
      //arrange
      var pattern_assembler = new pa();
      var patterns_dir = './test/files/_patterns';

      var patternlab = {};
      patternlab.patterns = [];
      patternlab.partials = {};
      patternlab.data = {link: {}};
      patternlab.config = {
        paths: {
          source: {
            patterns: patterns_dir
          }
        }
      };

      var fooPattern = pattern_assembler.process_pattern_iterative('00-test/00-foo.mustache', patternlab);
      pattern_assembler.process_pattern_iterative('00-test/01-bar.mustache', patternlab);
      fooPattern.engine.preprocessPartials(pattern_assembler, patternlab);
      pattern_assembler.process_pattern_recursive(fooPattern.relPath, patternlab, fooPattern);

      //assert
      test.equals(patternlab.patterns.length, 2);
      test.equals(patternlab.partials['{{> test-bar }}'].partial, 'test-bar');
      test.equals(patternlab.partials['{{> test-bar }}'].content.trim(), 'bar');
      test.done();
    }
  };
})();
