(function () {
  "use strict";

  var lih = require('../core/lib/list_item_hunter');
  var Pattern = require('../core/lib/object_factory').Pattern;
  var extend = require('util')._extend;
  var pa = require('../core/lib/pattern_assembler');
  var pattern_assembler = new pa();

  // fake pattern creators
  function createFakeListPattern(customProps) {
    var inputs = {
      relPath: '01-molecules/01-lists/00-list.mustache',
      data: {}
    };
    var pattern = new Pattern(inputs.relPath);

    return extend(pattern, customProps);
  }

  function createFakePatternLab(customProps) {

    //NOTE: These listitems are faked so that pattern_assembler.combine_listitems has already clobbered them.

    var pl = {
      "listitems": {
        "1": [
          {
            "title": "Foo",
            "message": "FooM"
          }
        ],
        "2" : [
          {
            "title": "Foo",
            "message": "FooM"
          },
          {
            "title": "Bar",
            "message": "BarM"
          }
        ],
        "3": [
          {
            "title": "Foo",
            "message": "FooM"
          },
          {
            "title": "Bar",
            "message": "BarM"
          },
          {
            "title": "Baz",
            "message": "BazM"
          },
        ]
      },
      "data": {
        "link": {},
        "partials": []
      },
      "config": {
        "debug": false,
        "paths": {
          "source": {
            "patterns": "./test/files/_patterns"
          }
        }
      },
      "partials" : {},
      "patterns" : []
    };

    return extend(pl, customProps);
  }

  exports['list_item_hunter'] = {
    'process_list_item_partials finds and outputs basic repeating blocks': function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "extendedTemplate": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "key": "test-patternName"
      });
      var patternlab = createFakePatternLab();
      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials listitems with lowercase name' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listitems.two}}{{ title }}{{/listitems.two}}",
        "extendedTemplate" : "{{#listitems.two}}{{ title }}{{/listitems.two}}",
        "key": "test-patternName"
      });
      var patternlab = createFakePatternLab();
      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials finds partials and outputs repeated renders': function(test){
      var patternlab = createFakePatternLab({
        "patterns": [
          {
            "template": "{{ title }}",
            "extendedTemplate" : "{{ title }}",
            "patternPartial": "test-simple",
            "jsonFileData" : {}
          }

        ]
      });

      //act
	  var pattern = pattern_assembler.process_pattern_iterative("01-test1/00-listitem-partial.mustache", patternlab);
      pattern.registerPartial(patternlab);
      pattern.engine.preprocessPartials(pattern_assembler, patternlab);
	  pattern_assembler.process_pattern_recursive(pattern.relPath, patternlab, pattern);

      //assert
      test.equals(pattern.extendedTemplate.trim(), "FooBar" );

      test.done();
    },

    'process_list_item_partials finds verbose partials and outputs repeated renders' : function(test){
      var patternlab = createFakePatternLab({
        "patterns": [
          Pattern.create('00-test/00-foo.mustache', null, {
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}"
          }),
          Pattern.create('00-test/00-bar.mustache', null, {
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}"
          })
        ],
        data: {
          link: {}
        }
      });

      //act
	  var pattern1 = pattern_assembler.process_pattern_iterative("01-test1/01-listitem-verbose-foo.mustache", patternlab);
      pattern1.registerPartial(patternlab);
      pattern1.engine.preprocessPartials(pattern_assembler, patternlab);
	  pattern_assembler.process_pattern_recursive(pattern1.relPath, patternlab, pattern1);

	  var pattern2 = pattern_assembler.process_pattern_iterative("01-test1/02-listitem-verbose-bar.mustache", patternlab);
      pattern2.registerPartial(patternlab);
      pattern2.engine.preprocessPartials(pattern_assembler, patternlab);
	  pattern_assembler.process_pattern_recursive(pattern2.relPath, patternlab, pattern2);

      //assert
      test.equals(pattern1.extendedTemplate.trim(), "Foo" );
      test.equals(pattern2.extendedTemplate.trim(), "FooBar" );

      test.done();
    },

    'process_list_item_partials overwrites listItem property if that property is in local .listitem.json': function(test) {
      var patternlab = createFakePatternLab({
        "patterns": [
          createFakeListPattern({
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}",
            "patternPartial": "test-simple",
            "jsonFileData": {}
          })
        ]
      });

      //act
	  var pattern = pattern_assembler.process_pattern_iterative("01-test1/00-listitem-partial.mustache", patternlab);
      pattern.listitems = {
        "2": [
          { "title": "One" },
          { "title": "Two" }
        ]
      };
      pattern.registerPartial(patternlab);
      pattern.engine.preprocessPartials(pattern_assembler, patternlab);
	  pattern_assembler.process_pattern_recursive(pattern.relPath, patternlab, pattern);

      //assert
      test.equals(pattern.extendedTemplate.trim(), "OneTwo" );

      test.done();
    },

    'process_list_item_partials keeps listItem property if that property is not in local .listitem.json' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.one}}{{ title }}{{/listItems.one}}",
        "extendedTemplate": "{{#listItems.one}}{{> test-simple }}{{/listItems.one}}",
        "key": "test-patternName",
        "jsonFileData": {},
        "listitems": {
          "2": [
            { "title": "One" },
            { "title": "Two" }
          ]
        }
      });
      var patternlab = createFakePatternLab({
        "patterns": [
          createFakeListPattern({
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}",
            "patternPartial": "test-simple",
            "jsonFileData" : {}
          })
        ]
      });

      //act
	  var pattern = pattern_assembler.process_pattern_iterative("01-test1/00-listitem-partial.mustache", patternlab);
      pattern.template = "{{#listItems.one}}{{> test-simple }}{{/listItems.one}}";
      pattern.extendedTemplate = pattern.template;
      pattern.listitems = {
        "2": [
          { "title": "One" },
          { "title": "Two" }
        ]
      };
      pattern.registerPartial(patternlab);
      pattern.engine.preprocessPartials(pattern_assembler, patternlab);
	  pattern_assembler.process_pattern_recursive(pattern.relPath, patternlab, pattern);

      //assert
      test.equals(pattern.extendedTemplate.trim(), "Foo" );

      test.done();
    },

    'process_list_item_partials uses local listItem property if that property is not set globally' : function(test){
      var patternlab = createFakePatternLab({
        "patterns": [
          createFakeListPattern({
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}",
            "patternPartial": "test-simple",
            "jsonFileData": {}
          })
        ]
      });
      delete patternlab.listitems["1"]; // remove the "1" list

      //act
	  var pattern = pattern_assembler.process_pattern_iterative("01-test1/00-listitem-partial.mustache", patternlab);
      pattern.template = "{{#listItems.one}}{{> test-simple }}{{/listItems.one}}";
      pattern.extendedTemplate = pattern.template;
      pattern.listitems = {
        "1": [
          { "title": "One" }
        ],
        "2": [
          { "title": "One" },
          { "title": "Two" }
        ]
      };
      pattern.registerPartial(patternlab);
      pattern.engine.preprocessPartials(pattern_assembler, patternlab);
	  pattern_assembler.process_pattern_recursive(pattern.relPath, patternlab, pattern);

      //assert
      test.equals(typeof patternlab.listitems["1"], "undefined");
      test.equals(pattern.extendedTemplate.trim(), "One" );

      test.done();
    },

    'process_list_item_partials - correctly ignores bookended partials without a style modifier when the same partial has a style modifier between' : function(test){
      //arrange
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {};
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.config.paths = {
        "source": {
          "patterns": "./test/files/_patterns"
        }
      };
      pl.patterns = [];
      pl.partials = {};
      pl.config.patterns = { source: patterns_dir };
      pl.listitems = {
        "1": [
           {
              "message": "Foo"
           }
        ],
        "2": [
           {
              "message": "Foo"
           },
           {
              "message": "Bar"
           }
        ]
      };

      //act
      var atomPattern = pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      pl.patterns.push(atomPattern);
      atomPattern.registerPartial(pl);
      atomPattern.engine.preprocessPartials(pattern_assembler, pl);
	  pattern_assembler.process_pattern_recursive(atomPattern.relPath, pl, atomPattern);

      var bookendPattern = pattern_assembler.process_pattern_iterative('00-test/11-bookend-listitem.mustache', pl);
      pl.patterns.push(bookendPattern);
      bookendPattern.registerPartial(pl);
      bookendPattern.engine.preprocessPartials(pattern_assembler, pl);
	  pattern_assembler.process_pattern_recursive(bookendPattern.relPath, pl, bookendPattern);

      //assert. here we expect {{styleModifier}} to be replaced with an empty string or the styleModifier value from the found partial with the :styleModifier
      var expectedValue = '<div class="test_group"> <span class="test_base "> Foo </span> <span class="test_base test_1"> Foo </span> <span class="test_base "> Foo </span><span class="test_base "> Bar </span> <span class="test_base test_1"> Bar </span> <span class="test_base "> Bar </span> </div>';
      test.equals(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },

    'process_list_item_partials - correctly ignores already processed partial that had a style modifier when the same partial no longer has one' : function(test){
      //arrange
      var pl = createFakePatternLab();

      //act
      var atomPattern = pattern_assembler.process_pattern_iterative('00-test/03-styled-atom.mustache', pl);
      pl.patterns.push(atomPattern);
      atomPattern.registerPartial(pl);
      atomPattern.engine.preprocessPartials(pattern_assembler, pl);
	  pattern_assembler.process_pattern_recursive(atomPattern.relPath, pl, atomPattern);

      var anotherStyledAtomPattern = pattern_assembler.process_pattern_iterative('00-test/12-another-styled-atom.mustache', pl);
      pl.patterns.push(anotherStyledAtomPattern);
      anotherStyledAtomPattern.registerPartial(pl);
      anotherStyledAtomPattern.engine.preprocessPartials(pattern_assembler, pl);
	  pattern_assembler.process_pattern_recursive(anotherStyledAtomPattern.relPath, pl, anotherStyledAtomPattern);

      var listPattern = pattern_assembler.process_pattern_iterative('00-test/13-listitem.mustache', pl);
      pl.patterns.push(listPattern);
      listPattern.registerPartial(pl);
      listPattern.engine.preprocessPartials(pattern_assembler, pl);
	  pattern_assembler.process_pattern_recursive(listPattern.relPath, pl, listPattern);

      //assert.
      var expectedValue = '<div class="test_group"> <span class="test_base "> FooM </span> </div>';
      test.equals(listPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },

  };

})();
