module.exports = function(grunt) {

	var config = require('./config.json');

	grunt.initConfig({});

	// Load grunt tasks to the current grunt and inject the local configuration
	require('./builder/grunt-build')(grunt, config);

	grunt.registerTask('default', ['patternlab', 'copy:pl_main', 'copy:pl_styleguide']);
};
