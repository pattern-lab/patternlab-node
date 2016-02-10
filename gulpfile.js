var gulp = require('gulp'),
    config = require('./config.json');

// Load gulp-build tasks to the current gulp and inject the local configuration
require('./builder/gulp-build')(gulp, config);
// Load gulp-extra tasks to the current gulp and inject the local configuration
require('./builder/gulp-extra')(gulp, config);

gulp.task('default', ['pl:lab']);