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
    'parameter hunter parses parameters that follow a non-quoted value' : function(test){
      // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
      var currentPattern = currentPatternClosure();
      var patternlab = patternlabClosure();
      var parameter_hunter = new ph();
      var parameteredPartials = [];

      patternlab.patterns[0].template = "<p>{{foo}}</p><p>{{bar}}</p>";
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
      patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

      currentPattern.template = "{{> molecules-single-comment('silly\\\'key': true, bar: \"Hello World\", \"another\\\"silly-key\": 42 ) }}";
      currentPattern.extendedTemplate = currentPattern.template;
      parameteredPartials[0] = currentPattern.template;

      parameter_hunter.find_parameters(currentPattern, patternlab, parameteredPartials);
      test.equals(currentPattern.extendedTemplate, '<p>true</p><p>Hello World</p><p>42</p>');

      test.done();
    }
  };

}());
