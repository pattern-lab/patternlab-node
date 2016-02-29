(function () {
  "use strict";

  var ph = require('../builder/parameter_hunter');

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
      "extendedTemplate": "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
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
          "extendedTemplate": "<p>{{description}}</p>"
        }
      ],
      config: {
        debug: false
      },
      data: {
        description: 'Not a quote from a smart man'
      },
      partials: {}
    }
  };

  exports['parameter_hunter'] = {
    'parameter hunter finds and extends templates' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'parameter hunter finds and extends templates with mixed parameter and global data' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      patternlab.patterns[0].template = "<h1>{{foo}}</h1><p>{{description}}</p>";
      patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;
      patternlab.data.foo = 'Bar';
      patternlab.data.description = 'Baz';

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'parameter hunter finds and extends templates with verbose partials' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = "{{> 01-molecules/06-components/02-single-comment(description: 'We are all in the gutter, but some of us are looking at the stars.') }}";
      currentPattern.parameteredPartials[1] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'parameter hunter finds and extends templates with fully-pathed partials' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'We are all in the gutter, but some of us are looking at the stars.') }}";
      currentPattern.parameteredPartials[1] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    //previous tests were for unquoted parameter keys and single-quoted values.
    //test other quoting options.
    'parameter hunter parses parameters with unquoted keys and unquoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment(description: true) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with unquoted keys and double-quoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment(description: \"true\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with single-quoted keys and unquoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment('description': true) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with single-quoted keys and single-quoted values wrapping internal escaped single-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment('description': 'true not,\\'true\\'') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true not,&#39;true&#39;</p>');

      test.done();
    },

    'parameter hunter parses parameters with single-quoted keys and double-quoted values wrapping internal single-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment('description': \"true not:'true'\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true not:&#39;true&#39;</p>');

      test.done();
    },

    'parameter hunter parses parameters with double-unquoted keys and unquoted values' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment(\"description\": true) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true</p>');

      test.done();
    },

    'parameter hunter parses parameters with double-quoted keys and single-quoted values wrapping internal double-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment(\"description\": 'true not{\"true\"') }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true not{&quot;true&quot;</p>');

      test.done();
    },

    'parameter hunter parses parameters with double-quoted keys and double-quoted values wrapping internal escaped double-quotes' : function(test){
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();

      currentPattern.template = "{{> molecules-single-comment(\"description\": \"true not}\\\"true\\\"\") }}";
      currentPattern.extendedTemplate = currentPattern.template;
      currentPattern.parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>true not}&quot;true&quot;</p>');

      test.done();
    }
  };

}());
