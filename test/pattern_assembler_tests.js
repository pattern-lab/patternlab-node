(function () {
	"use strict";

	var pa = require('../core/lib/pattern_assembler');
  var Pattern = require('../core/lib/object_factory').Pattern;
  var path = require('path');

	exports['pattern_assembler'] = {

		//'find_pattern_partials_with_parameters finds parameters' : function(test){
      //test.expect(2);
      //
		//	//setup current pattern from what we would have during execution
      //var currentPattern = new Pattern(
      //  '01-molecules/00-testing/00-test-mol.mustache', // relative path now
      //  null // data
      //);
		//	currentPattern.template = "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment(bar:'baz') }}</div>";
      //
      //var results = currentPattern.findPartialsWithPatternParameters();
		//	test.equals(results.length, 1);
		//	test.equals(results[0], "{{> molecules-single-comment(bar:'baz') }}");
      //
		//	test.done();
      //
		//},
		//'find_pattern_partials_with_parameters finds parameters when stylemodifiers present too' : function(test){
      //test.expect(2);
      //
		//	//setup current pattern from what we would have during execution
      //var currentPattern = new Pattern(
      //  '01-molecules/00-testing/00-test-mol.mustache', // relative path now
      //  null // data
      //);
		//	currentPattern.template = "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment:foo(bar:'baz') }}</div>";
      //
      //var results = currentPattern.findPartialsWithPatternParameters();
		//	test.equals(results.length, 1);
		//	test.equals(results[0], "{{> molecules-single-comment:foo(bar:'baz') }}");
      //
		//	test.done();
		//},
		//'find_pattern_partials_with_parameters finds parameters with verbose partials' : function(test){
      //test.expect(2);
      //
		//	//setup current pattern from what we would have during execution
      //var currentPattern = new Pattern(
      //  '01-molecules/00-testing/00-test-mol.mustache', // relative path now
      //  null // data
      //);
		//	currentPattern.template = "<h1>{{> 01-molecules/06-components/molecules-comment-header}}</h1><div>{{> 01-molecules/06-components/molecules-single-comment(bar:'baz') }}</div>";
      //
      //var results = currentPattern.findPartialsWithPatternParameters();
		//	test.equals(results.length, 1);
		//	test.equals(results[0], "{{> 01-molecules/06-components/molecules-single-comment(bar:'baz') }}");
      //
		//	test.done();
		//},
		//'find_pattern_partials_with_parameters finds no style modifiers when only partials present' : function(test){
      //test.expect(1);
      //
		//	//setup current pattern from what we would have during execution
      //var currentPattern = new Pattern(
      //  '01-molecules/00-testing/00-test-mol.mustache', // relative path now
      //  null // data
      //);
		//	currentPattern.template = "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment }}</div>";
      //
      //var results = currentPattern.findPartialsWithPatternParameters();
		//	test.equals(results, null);
      //
		//	test.done();
		//},
		//'find_pattern_partials_with_parameters finds no style modifiers when only partials with style modifiers present' : function(test){
      //test.expect(1);
      //
		//	//setup current pattern from what we would have during execution
      //var currentPattern = new Pattern(
      //  '01-molecules/00-testing/00-test-mol.mustache', // relative path now
      //  null // data
      //);
		//	currentPattern.template = "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment:foo }}</div>";
      //
      //var results = currentPattern.findPartialsWithPatternParameters();
		//	test.equals(results, null);
      //
		//	test.done();
		//},
		'process_pattern_recursive recursively includes partials' : function(test){
      test.expect(3);

			//tests inclusion of partial that will be discovered by diveSync later in iteration than parent
			//prepare to diveSync
			var diveSync = require('diveSync');
			var fs = require('fs-extra');
			var pa = require('../core/lib/pattern_assembler');
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

			//diveSync once to perform iterative populating of patternlab object
			plMain.process_all_patterns_iterative(pattern_assembler, patterns_dir, patternlab);

			//diveSync again to recursively include partials, filling out the
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
			var fs = require('fs-extra');
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

			var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

			var groupPattern = new Pattern('00-test/04-group.mustache');
			groupPattern.template = fs.readFileSync(patterns_dir + '/00-test/04-group.mustache', 'utf8');
			groupPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(groupPattern);

			pattern_assembler.addPattern(atomPattern, pl);
			pattern_assembler.addPattern(groupPattern, pl);

			//act

			pattern_assembler.process_pattern_recursive('00-test/04-group.mustache', pl, {});

			//assert
			var expectedValue = '<div class="test_group"> <span class="test_base test_1"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
			test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternRecursive - correctly replaces multiple stylemodifier classes on same partial' : function(test){
			//arrange
			var fs = require('fs-extra');
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

			var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
			atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

			var groupPattern = new Pattern('00-test/10-multiple-classes-numeric.mustache');
			groupPattern.template = fs.readFileSync(patterns_dir + '/00-test/10-multiple-classes-numeric.mustache', 'utf8');
			groupPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(groupPattern);
			groupPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(groupPattern);

			pattern_assembler.addPattern(atomPattern, pl);
			pattern_assembler.addPattern(groupPattern, pl);

			//act
			pattern_assembler.process_pattern_recursive('00-test/10-multiple-classes-numeric.mustache', pl, {});

			//assert
			var expectedValue = '<div class="test_group"> <span class="test_base foo1"> {{message}} </span> <span class="test_base foo1 foo2"> {{message}} </span> <span class="test_base foo1 foo2"> bar </span> </div>';
			test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier' : function(test){
			//arrange
			var fs = require('fs-extra');
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

			var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

			var mixedPattern = new Pattern('00-test/06-mixed.mustache');
			mixedPattern.template = fs.readFileSync(patterns_dir + '/00-test/06-mixed.mustache', 'utf8');
			mixedPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(mixedPattern);

			pattern_assembler.addPattern(atomPattern, pl);
			pattern_assembler.addPattern(mixedPattern, pl);

			//act
			pattern_assembler.process_pattern_recursive('00-test/06-mixed.mustache', pl, {});

			//assert. here we expect {{styleModifier}} to be in the first group, since it was not replaced by anything. rendering with data will then remove this (correctly)
			var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
			test.equals(mixedPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier  between' : function(test){
			//arrange
			var fs = require('fs-extra');
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

			var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

			var bookendPattern = new Pattern('00-test/09-bookend.mustache');
			bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/09-bookend.mustache', 'utf8');
			bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);

			pattern_assembler.addPattern(atomPattern, pl);
			pattern_assembler.addPattern(bookendPattern, pl);

			//act
			pattern_assembler.process_pattern_recursive('00-test/09-bookend.mustache', pl, {});

			//assert. here we expect {{styleModifier}} to be in the first and last group, since it was not replaced by anything. rendering with data will then remove this (correctly)
			var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
      var actualValue = bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ');
			test.equals(actualValue.trim(), expectedValue.trim(), 'actual value:\n' + actualValue + '\nexpected value:\n' + expectedValue);
			test.done();
		},
		'processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier and pattern parameters' : function(test){
			//arrange
			var fs = require('fs-extra');
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

			var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
			atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

			var mixedPattern = new Pattern('00-test/07-mixed-params.mustache');
			mixedPattern.template = fs.readFileSync(patterns_dir + '/00-test/07-mixed-params.mustache', 'utf8');
			mixedPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(mixedPattern);
      		mixedPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(mixedPattern);

			pattern_assembler.addPattern(atomPattern, pl);
			pattern_assembler.addPattern(mixedPattern, pl);

			//act
			pattern_assembler.process_pattern_recursive('00-test/07-mixed-params.mustache', pl, {});

			//assert. here we expect {{styleModifier}} to be in the first span, since it was not replaced by anything. rendering with data will then remove this (correctly)
			var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base test_4"> 4 </span> </div>';
			test.equals(mixedPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternRecursive - correctly ignores bookended partials without a style modifier when the same partial has a style modifier and pattern parameters between' : function(test){
			//arrange
			var fs = require('fs-extra');
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

			var atomPattern = new Pattern('00-test/03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
      		atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

			var bookendPattern = new Pattern('00-test/08-bookend-params.mustache');
			bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/08-bookend-params.mustache', 'utf8');
			bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);
      		bookendPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(bookendPattern);

			pattern_assembler.addPattern(atomPattern, pl);
			pattern_assembler.addPattern(bookendPattern, pl);

			//act
			pattern_assembler.process_pattern_recursive('00-test/08-bookend-params.mustache', pl, {});

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
        key: "pages-homepage"
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
            patternlab.data.dave = {	url: "link.twitter-dave" };
            patternlab.data.brian = {	url: "link.twitter-brian" };


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
			var patternlab = {};
			patternlab.patterns = [];
			patternlab.partials = {};
			patternlab.data = {link: {}};
      patternlab.config = { debug: false };

			var pattern = new Pattern('00-test/01-bar.mustache');
			pattern.extendedTemplate = 'barExtended';
			pattern.template = 'bar';

			//act
			pattern_assembler.addPattern(pattern, patternlab);

			//assert
			test.equals(patternlab.patterns.length, 1);
			test.equals(patternlab.partials['test-bar'] != undefined, true);
			test.equals(patternlab.partials['test-bar'], 'barExtended');
			test.done();
		},
		'addPattern - adds pattern template to patternlab partial object if extendedtemplate does not exist yet' : function(test){
			//arrange
			var pattern_assembler = new pa();
			var patternlab = {};
			patternlab.patterns = [];
			patternlab.partials = {};
			patternlab.data = {link: {}};
      patternlab.config = { debug: false };

			var pattern = new Pattern('00-test/01-bar.mustache');
			pattern.extendedTemplate = undefined;
			pattern.template = 'bar';

			//act
			pattern_assembler.addPattern(pattern, patternlab);

			//assert
			test.equals(patternlab.patterns.length, 1);
			test.equals(patternlab.partials['test-bar'] != undefined, true);
			test.equals(patternlab.partials['test-bar'], 'bar');
			test.done();
		}
	};
})();
