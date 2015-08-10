(function () {
	"use strict";

	var pa = require('../builder/pattern_assembler');

	exports['pattern_assembler'] = {
		'find_pattern_partials finds partials' : function(test){

			//setup current pattern from what we would have during execution
			var currentPattern = {
         "template": "<h1>{{> molecules-comment-header}}</h1><div>{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}</div>",
			};

			var pattern_assembler = new pa();

      var results = pattern_assembler.find_pattern_partials(currentPattern);
      test.equals(results.length, 2);
			test.equals(results[0], '{{> molecules-comment-header}}');
			test.equals(results[1], '{{> molecules-single-comment(description: \'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.\') }}');

			test.done();
		}

	};

}());
