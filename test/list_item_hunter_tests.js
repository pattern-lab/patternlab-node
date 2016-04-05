(function () {
  "use strict";

  var lih = require('../core/lib/list_item_hunter');
  var of = require('../core/lib/object_factory');
  var extend = require('util')._extend;

  // fake pattern creators
  function createFakeListPattern(customProps) {
    var inputs = {
      abspath: '/home/fakeuser/pl/source/_patterns/01-molecules/01-lists/00-list.mustache',
      subdir: '01-molecules\\01-lists',
      filename: '00-list.mustache',
      data: {}
    };
    var pattern = new of.oPattern(inputs.abspath, inputs.subdir, inputs.filename, inputs.data);

    return extend(pattern, customProps);
  }

  function createFakePatternLab(customProps) {
    var pl = {
      "listitems": {
        "1": [
          { "title": "Foo" }
        ],
        "2": [
          { "title": "Foo" },
          { "title": "Bar" }
        ]
      },
      "data": {
        "link": {},
        "partials": []
      },
      "config": {"debug": false},
      "partials" : {}
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
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "extendedTemplate": "{{#listItems.two}}{{> test-simple }}{{/listItems.two}}",
        "key": "test-patternName"
      });

      var patternlab = createFakePatternLab({
        "patterns": [
          {
            "template": "{{ title }}",
            "extendedTemplate" : "{{ title }}",
            "key": "test-simple",
            "jsonFileData" : {}
          }

        ]
      });

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials finds verbose partials and outputs repeated renders' : function(test){
      var pattern1 = createFakeListPattern({
        "template": "{{#listItems.one}}{{> 00-atoms/00-test/00-foo.mustache }}{{/listItems.one}}",
        "extendedTemplate" : "{{#listItems.one}}{{> 00-atoms/00-test/00-foo.mustache }}{{/listItems.one}}",
        "key": "test-patternName1"
      });

      var pattern2 = createFakeListPattern({
        "template": "{{#listItems.two}}{{> 00-atoms/00-test/00-bar.mustache }}{{/listItems.two}}",
        "extendedTemplate" : "{{#listItems.two}}{{> 00-atoms/00-test/00-bar.mustache }}{{/listItems.two}}",
        "key": "test-patternName2"
      });

      var patternlab = createFakePatternLab({
        "patterns": [
          of.oPattern.create('/home/fakeuser/pl/source/_patterns/00-atoms/00-test/00-foo.mustache', "00-atoms/00-test", "00-foo.mustache", null, {
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}"
          }),
          of.oPattern.create('/home/fakeuser/pl/source/_patterns/00-atoms/00-test/00-bar.mustache', "00-atoms/00-test", "00-bar.mustache", null, {
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}"
          })
        ]
      });
      
      // {
      //  "template": "{{ title }}",
      //  "extendedTemplate" : "{{ title }}",
      //  "subdir": "00-test",
      //  "fileName": "00-foo",
      //  "jsonFileData" : {},
      //  "key": "test-foo",
      // },
      // {
      //  "template": "{{ title }}",
      //  "extendedTemplate" : "{{ title }}",
      //  "subdir": "00-test",
      //  "fileName": "01-bar",
      //  "jsonFileData" : {},
      //  "key": "test-bar",
      // }

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(pattern1, patternlab);
      list_item_hunter.process_list_item_partials(pattern2, patternlab);

      //assert
      test.equals(pattern1.extendedTemplate, "Foo" );
      test.equals(pattern2.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials overwrites listItem property if that property is in local .listitem.json': function(test) {
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "extendedTemplate": "{{#listItems.two}}{{> test-simple }}{{/listItems.two}}",
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
            "key": "test-simple",
            "jsonFileData": {}
          })
        ]
      });
      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "OneTwo" );

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
            "key": "test-simple",
            "jsonFileData" : {}
          })
        ]
      });
      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "Foo" );

      test.done();
    },

    'process_list_item_partials uses local listItem property if that property is not set globally' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.one}}{{ title }}{{/listItems.one}}",
        "extendedTemplate": "{{#listItems.one}}{{> test-simple }}{{/listItems.one}}",
        "key": "test-patternName",
        "jsonFileData": {},
        "listitems": {
          "1": [
            { "title": "One" }
          ],
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
            "key": "test-simple",
            "jsonFileData": {}
          })
        ]
      });
      delete patternlab.listitems["1"]; // remove the "1" list

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(typeof patternlab.listitems["1"], "undefined");
      test.equals(currentPattern.extendedTemplate, "One" );

      test.done();
    },

    'process_list_item_partials - correctly ignores bookended partials without a style modifier when the same partial has a style modifier between' : function(test){
      //arrange
      var fs = require('fs-extra');
      var pa = require('../core/lib/pattern_assembler');
      var pattern_assembler = new pa();
      var list_item_hunter = new lih();
      var patterns_dir = './test/files/_patterns';

      var pl = {};
      pl.config = {};
      pl.data = {};
      pl.data.link = {};
      pl.config.debug = false;
      pl.patterns = [];
      pl.partials = {};
      pl.config.patterns = { source: patterns_dir};
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

      var atomPattern = new of.oPattern('test/files/_patterns/00-test/03-styled-atom.mustache', '00-test', '03-styled-atom.mustache');
      atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
      atomPattern.extendedTemplate = atomPattern.template;
      atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

      var bookendPattern = new of.oPattern('test/files/_patterns/00-test/11-bookend-listitem.mustache', '00-test', '11-bookend-listitem.mustache');
      bookendPattern.template = fs.readFileSync(patterns_dir + '/00-test/11-bookend-listitem.mustache', 'utf8');
      bookendPattern.extendedTemplate = bookendPattern.template;
      bookendPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bookendPattern);

      pl.patterns.push(atomPattern);
      pl.patterns.push(bookendPattern);

      //act
      list_item_hunter.process_list_item_partials(bookendPattern, pl);

      //assert. here we expect {{styleModifier}} to be replaced with an empty string or the styleModifier value from the found partial with the :styleModifier
      var expectedValue = '<div class="test_group"> <span class="test_base "> Foo </span> <span class="test_base test_1"> Foo </span> <span class="test_base "> Foo </span> <span class="test_base "> Bar </span> <span class="test_base test_1"> Bar </span> <span class="test_base "> Bar </span> </div>';
      test.equals(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    }

  };

})();
