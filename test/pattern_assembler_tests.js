(function () {
	"use strict";

	var pa = require('../builder/pattern_assembler');
	var object_factory = require('../builder/object_factory');

	exports['pattern_assembler'] = {
		'find_pattern_partials finds partials' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials(currentPattern);
			test.equals(results.length, 2);
			test.equals(results[0], '{{> molecules-comment-header}}');
			test.equals(results[1], '{{> molecules-single-comment(description: \'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.\') }}');

			test.done();
		},

		'find_pattern_partials finds verbose partials' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> 01-molecules/06-components/03-comment-header.mustache }}</h1><div>{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials(currentPattern);
			test.equals(results.length, 2);
			test.equals(results[0], '{{> 01-molecules/06-components/03-comment-header.mustache }}');
			test.equals(results[1], '{{> 01-molecules/06-components/02-single-comment(description: \'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.\') }}');

			test.done();
		},

		'find_pattern_partials_with_style_modifiers finds style modifiers' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment:foo }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_style_modifiers(currentPattern);
			test.equals(results.length, 1);
			test.equals(results[0], '{{> molecules-single-comment:foo }}');

			test.done();
		},

		'find_pattern_partials_with_style_modifiers finds style modifiers with parameters present too' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment:foo(bar:'baz') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_style_modifiers(currentPattern);
			test.equals(results.length, 1);
			test.equals(results[0], "{{> molecules-single-comment:foo(bar:'baz') }}");

			test.done();
		},

		'find_pattern_partials_with_style_modifiers finds style modifiers with verbose partials' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> 01-molecules/06-components/molecules-comment-header}}</h1><div>{{> 01-molecules/06-components/molecules-single-comment:foo }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_style_modifiers(currentPattern);
			test.equals(results.length, 1);
			test.equals(results[0], '{{> 01-molecules/06-components/molecules-single-comment:foo }}');

			test.done();
		},

		'find_pattern_partials_with_style_modifiers finds no style modifiers when only partials present' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_style_modifiers(currentPattern);
			test.equals(results, null);

			test.done();
		},

		'find_pattern_partials_with_style_modifiers finds no style modifiers when only partials with pattern parameters present' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment(foo: 'bar') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_style_modifiers(currentPattern);
			test.equals(results, null);

			test.done();
		},

		'find_pattern_partials_with_parameters finds parameters' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment(bar:'baz') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_parameters(currentPattern);
			test.equals(results.length, 1);
			test.equals(results[0], "{{> molecules-single-comment(bar:'baz') }}");

			test.done();

		},

		'find_pattern_partials_with_parameters finds parameters when stylemodifiers present too' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment:foo(bar:'baz') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_parameters(currentPattern);
			test.equals(results.length, 1);
			test.equals(results[0], "{{> molecules-single-comment:foo(bar:'baz') }}");

			test.done();

		},

		'find_pattern_partials_with_parameters finds parameters with verbose partials' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> 01-molecules/06-components/molecules-comment-header}}</h1><div>{{> 01-molecules/06-components/molecules-single-comment(bar:'baz') }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_parameters(currentPattern);
			test.equals(results.length, 1);
			test.equals(results[0], "{{> 01-molecules/06-components/molecules-single-comment(bar:'baz') }}");

			test.done();

		},

		'find_pattern_partials_with_parameters finds no style modifiers when only partials present' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_parameters(currentPattern);
			test.equals(results, null);

			test.done();
		},

		'find_pattern_partials_with_parameters finds no style modifiers when only partials with style modifiers present' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
				"template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment:foo }}</div>",
			};

			var pattern_assembler = new pa();

			var results = pattern_assembler.find_pattern_partials_with_parameters(currentPattern);
			test.equals(results, null);

			test.done();
		},

		'process_pattern_recursive recursively includes partials' : function(test){

			//tests inclusion of partial that will be discovered by diveSync later in iteration than parent
			//prepare to diveSync
			var diveSync = require('diveSync');
			var fs = require('fs-extra');
			var pa = require('../builder/pattern_assembler');
			var pattern_assembler = new pa();
			var patterns_dir = './test/files/_patterns';
			var patternlab = {};
			patternlab.config = fs.readJSONSync('./config.json');
			patternlab.config.patterns = {source: patterns_dir};
			patternlab.data = fs.readJSONSync('./source/_data/data.json');
			patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
			patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
			patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
			patternlab.patterns = [];
			patternlab.data.link = {};
			patternlab.partials = {};

			//diveSync once to perform iterative populating of patternlab object
			diveSync(patterns_dir,
				{
					filter: function(path, dir){
						if(dir){
							var remainingPath = path.replace(patterns_dir, '');
							var isValidPath = remainingPath.indexOf('/_') === -1;
							return isValidPath;
						}
						return true;
					}
				},
				function(err, file){
					//log any errors
					if(err){
						console.log(err);
						return;
					}

					pattern_assembler.process_pattern_iterative(file.substring(2), patternlab);
				}
			);

			//diveSync again to recursively include partials, filling out the
			//extendedTemplate property of the patternlab.patterns elements
			diveSync(patterns_dir,
				{
					filter: function(path, dir){
						if(dir){
							var remainingPath = path.replace(patterns_dir, '');
							var isValidPath = remainingPath.indexOf('/_') === -1;
							return isValidPath;
						}
						return true;
					}
				},
				function(err, file){
					//log any errors
					if(err){
						console.log(err);
						return;
					}

					pattern_assembler.process_pattern_recursive(file.substring(2), patternlab);
				}
			);

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
			pl.config = {};
			pl.data = {};
			pl.data.link = {};
			pl.config.debug = false;
			pl.patterns = [];
			pl.config.patterns = { source: patterns_dir};

			var atomPattern = new object_factory.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

			var groupPattern = new object_factory.oPattern('test/files/_patterns/00-test/04-group.mustache', '00-test', '04-group.mustache');
			groupPattern.template = fs.readFileSync(patterns_dir + '/00-test/04-group.mustache', 'utf8');
			groupPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(groupPattern);

			pl.patterns.push(atomPattern);
			pl.patterns.push(groupPattern);

			//act
			pattern_assembler.process_pattern_recursive('test/files/_patterns/00-test/04-group.mustache', pl, {});

			//assert
			var expectedValue = '<div class="test_group"> <span class="test_base test_1"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base test_4"> {{message}} </span> </div>';
			test.equals(groupPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier' : function(test){
			//arrange
			var fs = require('fs-extra');
			var pattern_assembler = new pa();
			var patterns_dir = './test/files/_patterns';

			var pl = {};
			pl.config = {};
			pl.data = {};
			pl.data.link = {};
			pl.config.debug = false;
			pl.patterns = [];
			pl.config.patterns = { source: patterns_dir};

			var atomPattern = new object_factory.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

			var mixedPattern = new object_factory.oPattern('test/files/_patterns/00-test/06-mixed.mustache', '00-test', '06-mixed.mustache');
			mixedPattern.template = fs.readFileSync(patterns_dir + '/00-test/06-mixed.mustache', 'utf8');
			mixedPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(mixedPattern);

			pl.patterns.push(atomPattern);
			pl.patterns.push(mixedPattern);

			//act
			pattern_assembler.process_pattern_recursive('test/files/_patterns/00-test/06-mixed.mustache', pl, {});

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
			pl.config = {};
			pl.data = {};
			pl.data.link = {};
			pl.config.debug = false;
			pl.patterns = [];
			pl.config.patterns = { source: patterns_dir};

			var atomPattern = new object_factory.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

			var bookendPattern = new object_factory.oPattern('test/files/_patterns/00-test/09-bookend.mustache', '00-test', '09-bookend.mustache');
			bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/09-bookend.mustache', 'utf8');
			bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);

			pl.patterns.push(atomPattern);
			pl.patterns.push(bookendPattern);

			//act
			pattern_assembler.process_pattern_recursive('test/files/_patterns/00-test/09-bookend.mustache', pl, {});

			//assert. here we expect {{styleModifier}} to be in the first and last group, since it was not replaced by anything. rendering with data will then remove this (correctly)
			var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> {{message}} </span> <span class="test_base test_3"> {{message}} </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
			test.equals(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternRecursive - correctly ignores a partial without a style modifier when the same partial later has a style modifier and pattern parameters' : function(test){
			//arrange
			var fs = require('fs-extra');
			var pattern_assembler = new pa();
			var patterns_dir = './test/files/_patterns';

			var pl = {};
			pl.config = {};
			pl.data = {};
			pl.data.link = {};
			pl.config.debug = false;
			pl.patterns = [];
			pl.config.patterns = { source: patterns_dir};

			var atomPattern = new object_factory.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
      atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

			var mixedPattern = new object_factory.oPattern('test/files/_patterns/00-test/07-mixed-params.mustache', '00-test', '07-mixed-params.mustache');
			mixedPattern.template = fs.readFileSync(patterns_dir + '/00-test/07-mixed-params.mustache', 'utf8');
			mixedPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(mixedPattern);
      mixedPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(mixedPattern);

			pl.patterns.push(atomPattern);
			pl.patterns.push(mixedPattern);

			//act
			pattern_assembler.process_pattern_recursive('test/files/_patterns/00-test/07-mixed-params.mustache', pl, {});

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
			pl.config = {};
			pl.data = {};
			pl.data.link = {};
			pl.config.debug = false;
			pl.patterns = [];
			pl.config.patterns = { source: patterns_dir};

			var atomPattern = new object_factory.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
			atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
			atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);
      atomPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(atomPattern);

			var bookendPattern = new object_factory.oPattern('test/files/_patterns/00-test/08-bookend-params.mustache', '00-test', '08-bookend-params.mustache');
			bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/08-bookend-params.mustache', 'utf8');
			bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);
      bookendPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(bookendPattern);

			pl.patterns.push(atomPattern);
			pl.patterns.push(bookendPattern);

			//act
			pattern_assembler.process_pattern_recursive('test/files/_patterns/00-test/08-bookend-params.mustache', pl, {});

			//assert. here we expect {{styleModifier}} to be in the first and last span, since it was not replaced by anything. rendering with data will then remove this (correctly)
			var expectedValue = '<div class="test_group"> <span class="test_base {{styleModifier}}"> {{message}} </span> <span class="test_base test_2"> 2 </span> <span class="test_base test_3"> 3 </span> <span class="test_base {{styleModifier}}"> {{message}} </span> </div>';
			test.equals(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
			test.done();
		},
		'processPatternIterative - ignores files that start with underscore' : function(test){
			//arrange
			var diveSync = require('diveSync');
			var fs = require('fs-extra');
			var pa = require('../builder/pattern_assembler');
			var pattern_assembler = new pa();
			var patterns_dir = './test/files/_patterns';
			var patternlab = {};
			patternlab.config = fs.readJSONSync('./config.json');
			patternlab.config.patterns = {source: patterns_dir};
			patternlab.data = fs.readJSONSync('./source/_data/data.json');
			patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
			patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
			patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
			patternlab.patterns = [];
			patternlab.data.link = {};
			patternlab.partials = {};

			//act
			diveSync(patterns_dir,
				{
					filter: function(path, dir){
						if(dir){
							var remainingPath = path.replace(patterns_dir, '');
							var isValidPath = remainingPath.indexOf('/_') === -1;
							return isValidPath;
						}
						return true;
					}
				},
				function(err, file){
					//log any errors
					if(err){
						console.log(err);
						return;
					}

					pattern_assembler.process_pattern_iterative(file.substring(2), patternlab);
				}
			);

			//assert
			var foundIgnoredPattern = false;
			for(var i = 0; i < patternlab.patterns.length; i++){
				if(patternlab.patterns[i].fileName[0] === '_'){
					foundIgnoredPattern = true;
				}
			}
			test.equals(foundIgnoredPattern, false);
			test.done();
		},
		'processPatternIterative - ignores files that are variants' : function(test){
			//arrange
			var diveSync = require('diveSync');
			var fs = require('fs-extra');
			var pa = require('../builder/pattern_assembler');
			var pattern_assembler = new pa();
			var patterns_dir = './test/files/_patterns';
			var patternlab = {};
			//THIS IS BAD.
			patternlab.config = fs.readJSONSync('./config.json');
			patternlab.config.patterns = {source: patterns_dir};
			patternlab.data = fs.readJSONSync('./source/_data/data.json');
			patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
			patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
			patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
			patternlab.patterns = [];
			patternlab.data.link = {};
			patternlab.partials = {};

			//act
			diveSync(patterns_dir,
				{
					filter: function(path, dir){
						if(dir){
							var remainingPath = path.replace(patterns_dir, '');
							var isValidPath = remainingPath.indexOf('/_') === -1;
							return isValidPath;
						}
						return true;
					}
				},
				function(err, file){
					//log any errors
					if(err){
						console.log(err);
						return;
					}

					pattern_assembler.process_pattern_iterative(file.substring(2), patternlab);
				}
			);

			//assert
			var foundVariant = false;
			for(var i = 0; i < patternlab.patterns.length; i++){
				if(patternlab.patterns[i].fileName.indexOf('~') > -1){
					foundVariant = true;
				}
			}
			test.equals(foundVariant, false);
			test.done();
		},
		'setState - applies any patternState matching the pattern' : function(test){
			//arrange
			var pa = require('../builder/pattern_assembler');
			var pattern_assembler = new pa();
			var patternlab = {};
			patternlab.config = {};
			patternlab.config.patternStates = {};
			patternlab.config.patternStates["homepage-emergency"] = "inprogress";

			var pattern = {
				patternName: "homepage-emergency"
			};

			//act
			pattern_assembler.setPatternState(pattern, patternlab);

			//assert
			test.equals(pattern.patternState, "inprogress");
			test.done();
		},
		'setState - does not apply any patternState if nothing matches the pattern' : function(test){
			//arrange
			var pa = require('../builder/pattern_assembler');
			var pattern_assembler = new pa();
			var patternlab = {};
			patternlab.config = {};
			patternlab.config.patternStates = {};
			patternlab.config.patternStates["homepage-emergency"] = "inprogress";

			var pattern = {
				patternName: "homepage"
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
			var pa = require('../builder/pattern_assembler');
			var pattern_assembler = new pa();
			var patterns_dir = './test/files/_patterns/';
			var patternlab = {};
			//THIS IS BAD
			patternlab.config = fs.readJSONSync('./config.json');
			patternlab.config.patterns = {source: patterns_dir};
			patternlab.data = fs.readJSONSync('./source/_data/data.json');
			patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
			patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
			patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
			patternlab.patterns = [];
			patternlab.data.link = {};
			patternlab.partials = {};

			diveSync(patterns_dir,
				{
					filter: function(path, dir){
						if(dir){
							var remainingPath = path.replace(patterns_dir, '');
							var isValidPath = remainingPath.indexOf('/_') === -1;
							return isValidPath;
						}
						return true;
					}
				},
				function(err, file){
					//log any errors
					if(err){
						console.log(err);
						return;
					}
					pattern_assembler.process_pattern_iterative(file.substring(2), patternlab);
				}
			);

			//for the sake of the test, also imagining I have the following pages...
			patternlab.data.link['twitter-brad'] = 'https://twitter.com/brad_frost';
			patternlab.data.link['twitter-dave'] = 'https://twitter.com/dmolsen';
			patternlab.data.link['twitter-brian'] = 'https://twitter.com/bmuenzenmeyer';

			patternlab.data.brad = { url: "link.twitter-brad" }
			patternlab.data.dave = {	url: "link.twitter-dave" }
			patternlab.data.brian = {	url: "link.twitter-brian" }


			var pattern;
			for(var i = 0; i < patternlab.patterns.length; i++){
				if(patternlab.patterns[i].key === 'test-nav'){
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
		}
	};
}());
