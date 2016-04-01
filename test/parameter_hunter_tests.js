(function () {
  "use strict";

  var ph = require('../core/lib/parameter_hunter');

  //setup current pattern from what we would have during execution
  function currentPatternClosure() {
    return {
      "fileName": "01-sticky-comment",
      "subdir": "02-organisms/02-comments",
      "name": "02-organisms-02-comments-01-sticky-comment",
      "patternName": "sticky-comment",
      "patternLink": "02-organisms-02-comments-01-sticky-comment/02-organisms-02-comments-01-sticky-comment.html",
      "patternGroup": "organisms",
      "patternSubGroup": "comments",
      "flatPatternPath": "02-organisms-02-comments",
      "key": "organisms-sticky-comment",
      "template": "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
      "escapedTemplate": "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
      "extendedTemplate": "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
      "dataKeys": [],
      "parameteredPartials": [
        "{{> molecules-single-comment(description: 'We are all in the gutter, but some of us are looking at the stars.') }}",
        "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}"
      ]
    };
  }

  function patternlabClosure() {
    return {
      patterns: [
        {
          "fileName": "02-single-comment",
          "subdir": "01-molecules/06-components",
          "name": "01-molecules-06-components-02-single-comment",
          "patternName": "single-comment",
          "patternLink": "01-molecules-06-components-02-single-comment/01-molecules-06-components-02-single-comment.html",
          "patternGroup": "molecules",
          "patternSubGroup": "components",
          "flatPatternPath": "01-molecules-06-components",
          "key": "molecules-single-comment",
          "template": "<p>{{description}}</p>",
          "escapedTemplate": "<p>{{description}}</p>",
          "extendedTemplate": "<p>{{description}}</p>"
        }
      ],
      config: {
        debug: false
      },
      data: {
        description: 'Not a quote from a smart man'
      }
    }
  };

  exports['parameter_hunter'] = {
    'parameter hunter finds and extends templates' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      parameter_hunter.find_parameters(currentPattern, patternlab, currentPattern.parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'parameter hunter finds and extends templates with mixed parameter and global data' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var pa = require('../core/lib/pattern_assembler');
      var pattern_assembler = new pa();

      currentPattern.escapedTemplate = '<h1>{{foo}}</h1>' + currentPattern.template;
      currentPattern.extendedTemplate = currentPattern.escapedTemplate;
      patternlab.data.foo = 'Bar';

      parameter_hunter.find_parameters(currentPattern, patternlab, currentPattern.parameteredPartials);
      currentPattern.extendedTemplate = pattern_assembler.renderPattern(currentPattern.extendedTemplate, patternlab.data);
      test.equals(currentPattern.extendedTemplate, '<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'parameter hunter finds and extends templates with verbose partials' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = "{{> 01-molecules/06-components/02-single-comment(description: 'We are all in the gutter, but some of us are looking at the stars.') }}";
      parameteredPartials[1] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'parameter hunter finds and extends templates with fully-pathed partials' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'We are all in the gutter, but some of us are looking at the stars.') }}";
      parameteredPartials[1] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    //previous tests were for unquoted parameter keys and single-quoted values.
    //test other quoting options.
    'parameter hunter parses parameters with unquoted keys and unquoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(description: true) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with unquoted keys and double-quoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(description: \"true\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with single-quoted keys and unquoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment('description': true) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with single-quoted keys and single-quoted values wrapping internal escaped single-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment('description': 'true not,\\'true\\'') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true not,&#39;true&#39;</p>');

      test.done();
    },

    'parameter hunter parses parameters with single-quoted keys and double-quoted values wrapping internal single-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment('description': \"true not:'true'\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true not:&#39;true&#39;</p>');

      test.done();
    },

    'parameter hunter parses parameters with double-unquoted keys and unquoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(\"description\": true) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with double-quoted keys and single-quoted values wrapping internal double-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(\"description\": 'true not{\",true\"') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true not{&quot;,true&quot;</p>');

      test.done();
    },

    'parameter hunter parses parameters with double-quoted keys and double-quoted values wrapping internal escaped double-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(\"description\": \"true not}\\\":true\\\"\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true not}&quot;:true&quot;</p>');

      test.done();
    },

    'parameter hunter parses parameters with combination of quoting schemes for keys and values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(description: true, 'foo': false, \"bar\": false, 'single': true, 'singlesingle': 'true', 'singledouble': \"true\", \"double\": true, \"doublesingle\": 'true', \"doubledouble\": \"true\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.dataKeys = [];
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with values containing a closing parenthesis' : function(test){
      // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      currentPattern.template = "{{> molecules-single-comment(description: 'Hello ) World') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>Hello ) World</p>');

      test.done();
    },

    'parameter hunter parses parameters that follow a non-quoted value' : function(test){
      // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      patternlab.patterns[0].template = "<p>{{foo}}</p><p>{{bar}}</p>";
      patternlab.patterns[0].escapedTemplate = patternlab.patterns[0].template;
      patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

      currentPattern.template = "{{> molecules-single-comment(foo: true, bar: \"Hello World\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p><p>Hello World</p>');

      test.done();
    },

    'parameter hunter parses parameters whose keys contain escaped quotes' : function(test){
      // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      patternlab.patterns[0].template = "<p>{{ silly'key }}</p><p>{{bar}}</p><p>{{ another\"silly-key }}</p>";
      patternlab.patterns[0].escapedTemplate = patternlab.patterns[0].template;
      patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

      currentPattern.template = "{{> molecules-single-comment('silly\\\'key': true, bar: \"Hello World\", \"another\\\"silly-key\": 42 ) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p><p>Hello World</p><p>42</p>');

      test.done();
    },

    'parameter hunter skips malformed parameters' : function(test){
      // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      patternlab.patterns[0].template = "<p>{{foo}}</p>";
      patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

      currentPattern.abspath = __filename;
      currentPattern.template = "{{> molecules-single-comment( missing-val: , : missing-key, : , , foo: \"Hello World\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      parameteredPartials[0] = currentPattern.template;

      console.log('\nPattern Lab should catch JSON.parse() errors and output useful debugging information...');
      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p></p>');

      test.done();
    },

    'pattern assembler recursively includes and processes a partial that has parameters itself' : function(test){
      // this test utilizes pattern_assembler for the heavy lifting, but the actual code being tested resides inside parameter_hunter.js
      //arrange
      var fs = require('fs-extra');
      var path = require('path');
      var object_factory = require('../core/lib/object_factory');
      var pa = require('../core/lib/pattern_assembler');
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
      pl.dataKeys = [];
      pl.config.debug = false;
      pl.patterns = [];

      var atomFile = path.resolve('test/files/_patterns/00-test/01-bar.mustache');
      var styleFile = path.resolve('test/files/_patterns/00-test/03-styled-atom.mustache');
      var innerParameteredFile = path.resolve('test/files/_patterns/00-test/12-parameter-partial.mustache');
      var outerParameteredFile = path.resolve('test/files/_patterns/00-test/13-another-parameter-partial.mustache');

      pattern_assembler.process_pattern_iterative(atomFile, pl);
      pattern_assembler.process_pattern_iterative(styleFile, pl);
      pattern_assembler.process_pattern_iterative(innerParameteredFile, pl);
      pattern_assembler.process_pattern_iterative(outerParameteredFile, pl);

      //act
      pattern_assembler.process_pattern_recursive(atomFile, pl, 0, null, true);
      pattern_assembler.process_pattern_recursive(styleFile, pl, 0, null, true);
      pattern_assembler.process_pattern_recursive(innerParameteredFile, pl, 0, null, true);
      pattern_assembler.process_pattern_recursive(outerParameteredFile, pl, 0, null, true);
      var outerParameteredPattern = pattern_assembler.get_pattern_by_key(outerParameteredFile, pl);

      //assert.
      var expectedValue = 'bar <span class="test_base baz"> foo </span> bar bar';
      test.equals(outerParameteredPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    },

    'pattern assembler escapes closing ERB tags written by end-users in templates' : function(test){
      //in order for pattern assembler to recursively include and process partials that have parameters,
      //it must temporarily switch standard Mustache syntax to ERB syntax. this presents a problem if end-
      //users write "%>" in user-facing templates. therefore, such instances must escaped and unescaped.
      //arrange
      var fs = require('fs-extra');
      var path = require('path');
      var object_factory = require('../core/lib/object_factory');
      var pa = require('../core/lib/pattern_assembler');
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
      pl.dataKeys = [];
      pl.config.debug = false;
      pl.patterns = [];

      var atomFile = path.resolve('test/files/_patterns/00-test/01-bar.mustache');
      var styleFile = path.resolve('test/files/_patterns/00-test/03-styled-atom.mustache');
      var innerParameteredFile = path.resolve('test/files/_patterns/00-test/12-parameter-partial.mustache');
      var outerParameteredFile = path.resolve('test/files/_patterns/00-test/14-template-with-erb-tag.mustache');

      pattern_assembler.process_pattern_iterative(atomFile, pl);
      pattern_assembler.process_pattern_iterative(styleFile, pl);
      pattern_assembler.process_pattern_iterative(innerParameteredFile, pl);
      pattern_assembler.process_pattern_iterative(outerParameteredFile, pl);

      //act
      pattern_assembler.process_pattern_recursive(atomFile, pl, 0, null, true);
      pattern_assembler.process_pattern_recursive(styleFile, pl, 0, null, true);
      pattern_assembler.process_pattern_recursive(innerParameteredFile, pl, 0, null, true);
      pattern_assembler.process_pattern_recursive(outerParameteredFile, pl, 0, null, true);
      var outerParameteredPattern = pattern_assembler.get_pattern_by_key(outerParameteredFile, pl);

      //assert.
      var expectedValue = 'bar <span class="test_base baz"> foo </span> bar bar <% erb %>';
      test.equals(outerParameteredPattern.extendedTemplate.replace(/\s\s+/g, ' ').replace(/\n/g, ' ').trim(), expectedValue.trim());
      test.done();
    }
  };
}());
