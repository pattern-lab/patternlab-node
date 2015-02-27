/* 
 * patternlab-node - v0.8.1 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

var patternlab_engine = require('./patternlab.js');

module.exports = function(grunt) {
	grunt.registerTask('patternlab', 'create design systems with atomic design', function(arg) {

		var patternlab = patternlab_engine();

		if(arguments.length === 0){
			patternlab.build();
		}

		if(arg && arg === 'v'){
			patternlab.version();
		}

		if(arg && arg === "only_patterns"){
			patternlab.build_patterns_only();
		}

		if(arg && arg === "help"){
			patternlab.help();
		}

		if(arg && (arg !== "v" && arg !=="only_patterns" && arg !=="help")){
			patternlab.help();
		}

	});

};