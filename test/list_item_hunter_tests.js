"use strict";

var tap = require('tap');

var lih = require('../core/lib/list_item_hunter');
var Pattern = require('../core/lib/object_factory').Pattern;
var extend = require('util')._extend;
var pa = require('../core/lib/pattern_assembler');
var pattern_assembler = new pa();
var testPatternsPath = './test/files/_patterns/';

// fake pattern creators
function createFakeListPattern(customProps) {
  var inputs = {
    relPath: '01-molecules/01-lists/00-list.mustache',
    data: {}
  };
  var pattern = new Pattern(testPatternsPath, inputs.relPath);

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
      },
      "outputFileSuffixes": {
        "rendered": ''
      }
    },
    "partials" : {},
    "patterns" : []
  };

  return extend(pl, customProps);
}


tap.test('process_list_item_partials finds and outputs basic repeating blocks', function(test){
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

  test.end();
});

tap.test('process_list_item_partials listitems with lowercase name', function(test){
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

  test.end();
});

tap.test('process_list_item_partials finds partials and outputs repeated renders', function(test){
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
        "patternPartial": "test-simple",
        "jsonFileData" : {}
      }

    ]
  });

  var list_item_hunter = new lih();

  //act
  list_item_hunter.process_list_item_partials(currentPattern, patternlab);

  //assert
  test.equals(currentPattern.extendedTemplate, "FooBar" );

  test.end();
});

tap.test('process_list_item_partials finds verbose partials and outputs repeated renders', function(test){
  var pattern1 = createFakeListPattern({
    "template": "{{#listItems.one}}{{> 00-test/00-foo.mustache }}{{/listItems.one}}",
    "extendedTemplate" : "{{#listItems.one}}{{> 00-test/00-foo.mustache }}{{/listItems.one}}",
    "patternPartial": "test-patternName1",
    "relPath": "00-test/02-patternName1.mustache"
  });

  var pattern2 = createFakeListPattern({
    "template": "{{#listItems.two}}{{> 00-test/00-bar.mustache }}{{/listItems.two}}",
    "extendedTemplate" : "{{#listItems.two}}{{> 00-test/00-bar.mustache }}{{/listItems.two}}",
    "patternPartial": "test-patternName2",
    "relPath": "00-test/03-patternName2.mustache"
  });

  var patternlab = createFakePatternLab({
    "patterns": [
      Pattern.create(testPatternsPath, '00-test/00-foo.mustache', null, {
        "template": "{{ title }}",
        "extendedTemplate": "{{ title }}",
        "relPath": "00-test/00-foo.mustache"
      }),
      Pattern.create(testPatternsPath, '00-test/00-bar.mustache', null, {
        "template": "{{ title }}",
        "extendedTemplate": "{{ title }}",
        "relPath": "00-test/00-bar.mustache"
      })
    ]
  });

  // {
  //  "template": "{{ title }}",
  //  "extendedTemplate" : "{{ title }}",
  //  "subdir": "00-test",
  //  "fileName": "00-foo",
  //  "jsonFileData" : {},
  //  "patternPartial": "test-foo",
  // },
  // {
  //  "template": "{{ title }}",
  //  "extendedTemplate" : "{{ title }}",
  //  "subdir": "00-test",
  //  "fileName": "01-bar",
  //  "jsonFileData" : {},
  //  "patternPartial": "test-bar",
  // }

  var list_item_hunter = new lih();

  //act
  list_item_hunter.process_list_item_partials(pattern1, patternlab);
  list_item_hunter.process_list_item_partials(pattern2, patternlab);

  //assert
  test.equals(pattern1.extendedTemplate, "Foo" );
  test.equals(pattern2.extendedTemplate, "FooBar" );

  test.end();
});

tap.test('process_list_item_partials overwrites listItem property if that property is in local .listitem.json', function(test) {
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
        "patternPartial": "test-simple",
        "jsonFileData": {}
      })
    ]
  });
  var list_item_hunter = new lih();

  //act
  list_item_hunter.process_list_item_partials(currentPattern, patternlab);

  //assert
  test.equals(currentPattern.extendedTemplate, "OneTwo" );

  test.end();
});

tap.test('process_list_item_partials keeps listItem property if that property is not in local .listitem.json', function(test){
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
  var list_item_hunter = new lih();

  //act
  list_item_hunter.process_list_item_partials(currentPattern, patternlab);

  //assert
  test.equals(currentPattern.extendedTemplate, "Foo" );

  test.end();
});

tap.test('process_list_item_partials uses local listItem property if that property is not set globally', function(test){
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
        "patternPartial": "test-simple",
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

  test.end();
});

tap.test('process_list_item_partials - correctly ignores bookended partials without a style modifier when the same partial has a style modifier between', function(test){
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

  var atomPattern = new Pattern(testPatternsPath, '00-test/03-styled-atom.mustache');
  atomPattern.template = fs.readFileSync(patterns_dir + '/00-test/03-styled-atom.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

  var bookendPattern = new Pattern(testPatternsPath, '00-test/11-bookend-listitem.mustache');
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
  test.end();
});

tap.test('process_list_item_partials - correctly ignores already processed partial that had a style modifier when the same partial no longer has one', function(test){
  //arrange
  var fs = require('fs-extra');
  var list_item_hunter = new lih();

  var pl = createFakePatternLab();

  var atomPattern = new Pattern(testPatternsPath, '00-test/03-styled-atom.mustache');
  atomPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '/00-test/03-styled-atom.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(atomPattern);

  var anotherStyledAtomPattern = new Pattern(testPatternsPath, '00-test/12-another-styled-atom.mustache');
  anotherStyledAtomPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '/00-test/12-another-styled-atom.mustache', 'utf8');
  anotherStyledAtomPattern.extendedTemplate = anotherStyledAtomPattern.template;
  anotherStyledAtomPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(anotherStyledAtomPattern);

  var listPattern = new Pattern(testPatternsPath, '00-test/13-listitem.mustache');
  listPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '/00-test/13-listitem.mustache', 'utf8');
  listPattern.extendedTemplate = listPattern.template;
  listPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(listPattern);

  pl.patterns.push(atomPattern);
  pl.patterns.push(anotherStyledAtomPattern);
  pl.patterns.push(listPattern);

  //act

  //might need to cal processPatternRecursive instead
  pattern_assembler.process_pattern_recursive(testPatternsPath, atomPattern.relPath, pl);
  pattern_assembler.process_pattern_recursive(testPatternsPath, anotherStyledAtomPattern.relPath, pl);
  pattern_assembler.process_pattern_recursive(testPatternsPath, listPattern.relPath, pl);

  //assert.
  var expectedValue = '<div class="test_group"> <span class="test_base "> FooM </span> </div>';
  test.equals(listPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
  test.end();
});


