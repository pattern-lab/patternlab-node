(function () {
  "use strict";

  var lih = require('../builder/list_item_hunter');

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
      var currentPattern = {
         "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
         "extendedTemplate" : "{{#listItems.two}}{{> test-simple }}{{/listItems.two}}",
         "key": "test-patternName",
         "jsonFileData" : {}
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
      test.equals(currentPattern.extendedTemplate, "FooBar" );

      test.done();
    },

    'process_list_item_partials overwrites listItem data if local .listitem.json is found' : function(test){
      //arrange
      //setup current pattern from what we would have during execution
      var currentPattern = {
         "template": "{{#listItems.two}}{{ title }}{{/listItems.two}}",
         "extendedTemplate" : "{{#listItems.two}}{{> test-simple }}{{/listItems.two}}",
         "key": "test-patternName",
         "jsonFileData" : {},
         "patternSpecificListJson" : {
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
    }

  };

}());
