module.exports = function(grunt) {

	var config = require('./config.json');

	// Load grunt tasks to the current grunt and inject the local configuration
	require('./builder/patternlab_grunt')(grunt, config);
};
