(function () {
	"use strict";

	var ph = require('../builder/parameter_hunter');

	exports['parameter_hunter'] = {
		'pattern hunter finds and extends templates' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
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
			var patternlab = {
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
        partials: {},
			};

			var parameter_hunter = new ph();

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

			test.done();
		},

    'pattern hunter finds and extends templates with mixed parameter and global data' : function(test){

      //setup current pattern from what we would have during execution
      var currentPattern = {
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
      var patternlab = {
        partials: {},
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
             "template": "<h1>{{foo}}</h1><p>{{description}}</p>",
             "extendedTemplate": "<h1>{{foo}}</h1><p>{{description}}</p>"
          }
        ],
        config: {
          debug: false
        },
        data: {
          foo: 'Bar',
          description: 'Baz'
        }
      };

      var parameter_hunter = new ph();

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'pattern hunter finds and extends templates with verbose partials' : function(test){

      //setup current pattern from what we would have during execution
      var currentPattern = {
         "fileName": "01-sticky-comment",
         "subdir": "02-organisms/02-comments",
         "name": "02-organisms-02-comments-01-sticky-comment",
         "patternName": "sticky-comment",
         "patternLink": "02-organisms-02-comments-01-sticky-comment/02-organisms-02-comments-01-sticky-comment.html",
         "patternGroup": "organisms",
         "patternSubGroup": "comments",
         "flatPatternPath": "02-organisms-02-comments",
         "key": "organisms-sticky-comment",
         "template": "{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
         "extendedTemplate": "{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
				 "parameteredPartials": [
						"{{> 01-molecules/06-components/02-single-comment(description: 'We are all in the gutter, but some of us are looking at the stars.') }}",
						"{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}"
				 ]
      };
      var patternlab = {
          partials: {},
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
        }
      };

      var parameter_hunter = new ph();

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    },

    'pattern hunter finds and extends templates with fully-pathed partials' : function(test){

      //setup current pattern from what we would have during execution
      var currentPattern = {
         "fileName": "01-sticky-comment",
         "subdir": "02-organisms/02-comments",
         "name": "02-organisms-02-comments-01-sticky-comment",
         "patternName": "sticky-comment",
         "patternLink": "02-organisms-02-comments-01-sticky-comment/02-organisms-02-comments-01-sticky-comment.html",
         "patternGroup": "organisms",
         "patternSubGroup": "comments",
         "flatPatternPath": "02-organisms-02-comments",
         "key": "organisms-sticky-comment",
         "template": "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
         "extendedTemplate": "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
				 "parameteredPartials": [
						"{{> 01-molecules/06-components/02-single-comment.mustache(description: 'We are all in the gutter, but some of us are looking at the stars.') }}",
						"{{> 01-molecules/06-components/02-single-comment.mustache(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}"
				 ]
      };
      var patternlab = {
          partials: {},
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
        }
      };

      var parameter_hunter = new ph();

      parameter_hunter.find_parameters(currentPattern, patternlab);
      test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

      test.done();
    }

  };

}());
