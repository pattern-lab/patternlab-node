(function () {
  "use strict";

  var lih = require('../builder/list_item_hunter');
  var of = require('../builder/object_factory');
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

  exports['list_item_hunter'] = {
    'process_list_item_partials finds and outputs basic repeating blocks' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "extendedTemplate": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "key": "test-patternName"
      });

      var patternlab = {
        "listitems": {
          "1": [
             {
                "title": "Foo"
             }
          ],
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
        },
        "config": {"debug": false}
      };

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

      var patternlab = {
        "listitems": {
          "1": [
             {
                "title": "Foo"
             }
          ],
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
        },
        "config": {"debug": false}
      };

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(currentPattern, patternlab);

      //assert
      test.equals(currentPattern.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials finds partials and outputs repeated renders' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = createFakeListPattern({
        "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
        "extendedTemplate" : "{{#listItems.two}}{{> test-simple }}{{/listItems.two}}",
        "key": "test-patternName"
      });

      var patternlab = {
        "listitems": {
          "1": [
             {
                "title": "Foo"
             }
          ],
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
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
      test.equals(currentPattern.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials finds verbose partials and outputs repeated renders' : function(test){
      var pattern1 = createFakeListPattern({
        "template": "{{#listItems.one}}{{> 00-test/00-foo }}{{/listItems.one}}",
        "extendedTemplate" : "{{#listItems.one}}{{> 00-test/00-foo }}{{/listItems.one}}",
        "key": "test-patternName1"
      });

      var pattern2 = createFakeListPattern({
        "template": "{{#listItems.two}}{{> 00-test/01-bar.mustache }}{{/listItems.two}}",
        "extendedTemplate" : "{{#listItems.two}}{{> 00-test/01-bar.mustache }}{{/listItems.two}}",
        "key": "test-patternName2"
      });

      var patternlab = {
        "listitems": {
          "1": [
             {
                "title": "Foo"
             }
          ],
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
        },
        "config": {"debug": false},
        "patterns": [
          of.oPattern.create(null, "00-test", "00-foo", null, {
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}",
            "jsonFileData": {}
          }),
          of.oPattern.create(null, "00-test", "00-bar", null, {
            "template": "{{ title }}",
            "extendedTemplate": "{{ title }}",
            "jsonFileData": {}
          })
        ]
      };

      var list_item_hunter = new lih();

      //act
      list_item_hunter.process_list_item_partials(pattern1, patternlab);
      list_item_hunter.process_list_item_partials(pattern2, patternlab);

      //assert
      test.equals(pattern1.extendedTemplate, "Foo" );
      test.equals(pattern2.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials overwrites listItem property if that property is in local .listitem.json' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
         "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
         "extendedTemplate" : "{{#listItems.two}}{{> test-simple }}{{/listItems.two}}",
         "key": "test-patternName",
         "jsonFileData" : {},
         "listitems" : {
            "2": [
                   {
                      "title": "One"
                   },
                   {
                      "title": "Two"
                   },
                ]
          }
      };

      var patternlab = {
        "listitems": {
          "1": [
             {
                "title": "Foo"
             }
          ],
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
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
      test.equals(currentPattern.extendedTemplate, "OneTwo" );

      test.done();
    },

    'process_list_item_partials keeps listItem property if that property is not in local .listitem.json' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
         "template": "{{#listItems.one}}{{ title }}{{/listItems.one}}",
         "extendedTemplate" : "{{#listItems.one}}{{> test-simple }}{{/listItems.one}}",
         "key": "test-patternName",
         "jsonFileData" : {},
         "listitems" : {
            "2": [
                   {
                      "title": "One"
                   },
                   {
                      "title": "Two"
                   },
                ]
          }
      };

      var patternlab = {
        "listitems": {
          "1": [
             {
                "title": "Foo"
             }
          ],
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
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
      test.equals(currentPattern.extendedTemplate, "Foo" );

      test.done();
    },

    'process_list_item_partials uses local listItem property if that property is not set globally' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
         "template": "{{#listItems.one}}{{ title }}{{/listItems.one}}",
         "extendedTemplate" : "{{#listItems.one}}{{> test-simple }}{{/listItems.one}}",
         "key": "test-patternName",
         "jsonFileData" : {},
         "listitems" : {
            "1": [
               {
                  "title": "One"
               }
            ],
            "2": [
                   {
                      "title": "One"
                   },
                   {
                      "title": "Two"
                   },
                ]
          }
      };

      var patternlab = {
        "listitems": {
          "2": [
             {
                "title": "Foo"
             },
             {
                "title": "Bar"
             }
          ]
        },
        "data": {
          "link": {},
          "partials": []
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
      test.equals(currentPattern.extendedTemplate, "One" );

      test.done();
    }

  };

}());
