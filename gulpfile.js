var gulp = require('gulp'),
    config = require('./config.json');

// Load gulp tasks to the current gulp and inject the local configuration
require('./builder/patternlab_gulp')(gulp, config);
