(function () {
  "use strict";

  var lih = require('../builder/list_item_hunter');
  var pa = require('../builder/pattern_assembler');
  var path = require('path');
  var object_factory = require('../builder/object_factory');

  exports['list_item_hunter'] = {
    'process_list_item_partials finds and outputs basic repeating blocks' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
         "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
         "extendedTemplate" : "{{#listItems.two}}{{ title }}{{/listItems.two}}",
         "key": "test-patternName",
         "jsonFileData" : {}
      };

      var patternlab = {
        "listitems": {
          "1": {
            "title": "Foo"
          },
          "2": {
            "title": "Bar"
          }
        },
        "data": {
          "link": {}
        },
        "config": {"debug": false}
      };

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.ok(currentPattern.extendedTemplate.match(/(FooBar|BarFoo)/));

      test.done();
    },

    'process_list_item_partials listitems with lowercase name' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
         "template": "{{#listitems.two}}{{ title }}{{/listitems.two}}",
         "extendedTemplate" : "{{#listitems.two}}{{ title }}{{/listitems.two}}",
         "key": "test-patternName",
         "jsonFileData" : {}
      };

      var patternlab = {
        "listitems": {
          "1": {
            "title": "Foo"
          },
          "2": {
            "title": "Bar"
          }
        },
        "data": {
          "link": {}
        },
        "config": {"debug": false}
      };

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.ok(currentPattern.extendedTemplate.match(/(FooBar|BarFoo)/));

      test.done();
    },

    'process_list_item_partials finds partials and outputs repeated renders' : function(test){
      //will test recursion and verbose partial inclusion syntax
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
      pl.dataKeys = ['one', 'message'];
      pl.config.debug = false;
      pl.patterns = [];
      pl.config.patterns = { source: patterns_dir};
      pl.listitems = {
        "1": {
          "message": "Foo"
        },
        "2": {
          "message": "Bar"
        }
      };

      var fooFile = path.resolve('test/files/_patterns/00-test/00-foo.mustache');
      var barFile = path.resolve('test/files/_patterns/00-test/01-bar.mustache');
      var listitemsFile = path.resolve('test/files/_patterns/00-test/02-listitems.mustache');

      //the contents of these files:
      //00-foo.mustache:
      //  {{> test-bar }}
      //01-bar.mustache:
      //  {{message}}bar
      //02-listitems.mustache
      //  {{#listItems.one}}{{> 00-test/00-foo }}{{/listItems.one}}
      //  {{#listItems.one}}{{> 00-test/01-bar.mustache }}{{/listItems.one}}

      pattern_assembler.process_pattern_iterative(fooFile, pl);
      pattern_assembler.process_pattern_iterative(barFile, pl);
      pattern_assembler.process_pattern_iterative(listitemsFile, pl);

      //act
      pattern_assembler.process_pattern_recursive(listitemsFile, pl, 0, null, true);
      var listitemsPattern = pattern_assembler.get_pattern_by_key(listitemsFile, pl);

      //assert
      test.ok(listitemsPattern.extendedTemplate.replace(/\n/g, '').match(/(FoobarFoobar|BarbarBarbar)/));

      test.done();
    },

    'process_list_item_partials overwrites listItem property if that property is in local .listitem.json' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
        "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "extendedTemplate" : "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "key": "test-patternName1",
        "jsonFileData" : {},
        "listitems": {},
        "listitemsRaw": {
          "1": {
            "title": "One"
          },
          "2": {
            "title": "Two"
          }
        }
      };

      var patternlab = {
        "listitems" : {
          "1": {
            "title": "Foo"
          },
          "2": {
            "title": "Bar"
          }
        },
        "data": {
          "link": {}
        },
        "config": {"debug": false},
        "patterns": [
          {
           "template": "{{ title }}",
           "extendedTemplate" : "{{ title }}",
           "key": "test-simple",
           "jsonFileData" : {}
          }
        ]
      };

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.ok(currentPattern.extendedTemplate.match(/OneTwo|TwoOne/));

      test.done();
    },

    'process_list_item_partials keeps listItem property if that property is not in local .listitem.json' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
        "template": "{{#listItems.one}}{{ title }}{{/listItems.one}}",
        "extendedTemplate" : "{{#listItems.one}}{{ title }}{{/listItems.one}}",
        "key": "test-patternName",
        "jsonFileData" : {},
        "listitems": {},
        "listitemsRaw": {
          "1": {
            "number": "One"
          }
        }
      };

      var patternlab = {
        "listitems": {
          "1": {
            "title": "Foo"
          }
        },
        "data": {
          "link": {}
        },
        "config": {"debug": false},
        "patterns": [
          {
           "template": "{{ title }}",
           "extendedTemplate" : "{{ title }}",
           "key": "test-simple",
           "jsonFileData" : {}
          }
        ]
      };

      var list_item_hunter = new lih();
      var pattern_assembler = new pa();

      //act
      currentPattern.listitemsRaw = pattern_assembler.merge_data(patternlab.listitems, currentPattern.listitemsRaw);
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "Foo" );

      test.done();
    },

    'process_list_item_partials uses local listItem property if that property is not set globally' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
        "template": "{{#listItems.two}}{{ number }}{{/listItems.two}}",
        "extendedTemplate" : "{{#listItems.two}}{{ number }}{{/listItems.two}}",
        "key": "test-patternName",
        "jsonFileData" : {},
        "listitems": {},
        "listitemsRaw" : {
          "1": {
            "number": "One"
          },
          "2": {
            "number": "Two"
          }
        }
      };

      var patternlab = {
        "listitems": {
          "1": {
            "title": "Foo"
          },
          "2": {
            "title": "Bar"
          }
        },
        "data": {
          "link": {}
        },
        "config": {"debug": false},
        "patterns": [
          {
           "template": "{{ title }}",
           "extendedTemplate" : "{{ title }}",
           "key": "test-simple",
           "jsonFileData" : {}
          }
        ]
      };

      var list_item_hunter = new lih();
      var pattern_assembler = new pa();

      //act
      currentPattern.listitemsRaw = pattern_assembler.merge_data(patternlab.listitems, currentPattern.listitemsRaw);
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.ok(currentPattern.extendedTemplate.match(/(OneTwo|TwoOne)/));

      test.done();
    },

    'process_list_item_partials - correctly ignores bookended partials without a style modifier when the same partial has a style modifier between' : function(test){
      //arrange
      var fs = require('fs-extra');
      var pattern_assembler = new pa();
      var list_item_hunter = new lih();
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
      pl.dataKeys = ['two', 'message'];
      pl.config.debug = false;
      pl.patterns = [];
      pl.config.patterns = { source: patterns_dir};
      pl.listitems = {
        "1": {
          "message": "Foo"
        },
        "2": {
          "message": "Bar"
        }
      };

      var atomFile = path.resolve('test/files/_patterns/00-test/03-styled-atom.mustache');
      var bookendFile = path.resolve('test/files/_patterns/00-test/11-bookend-listitem.mustache');

      pattern_assembler.process_pattern_iterative(atomFile, pl);
      pattern_assembler.process_pattern_iterative(bookendFile, pl);

      //act
      pattern_assembler.process_pattern_recursive(bookendFile, pl, 0, null, true);
      var bookendPattern = pattern_assembler.get_pattern_by_key(bookendFile, pl);

      //assert. here we expect {{styleModifier}} to be replaced with an empty string or the styleModifier value from the found partial with the :styleModifier
      var expectedValue = /<div class="test_group"> <span class="test_base "> (Foo|Bar) <\/span> <span class="test_base test_1"> (Foo|Bar) <\/span> <span class="test_base "> (Foo|Bar) <\/span><span class="test_base "> (Foo|Bar) <\/span> <span class="test_base test_1"> (Foo|Bar) <\/span> <span class="test_base "> (Foo|Bar) <\/span> <\/div>/;
      test.ok(bookendPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim().match(expectedValue));
      test.done();
    }

  };

}());
