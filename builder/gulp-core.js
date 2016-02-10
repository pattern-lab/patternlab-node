/*
 * patternlab-node - v1.1.0 - 2016
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

// IMPORTANT: Remember that `./` matches the root of the gulp file that requires this one!
// However, this does not apply to the `require('...')`
module.exports = function(gulp, config) {
    var patternlab = require('./patternlab.js')(config),
        del = require('del'),
        path = require('path');

    //clean patterns dir
    gulp.task('pl:clean', function(cb) {
        del.sync([path.resolve(config.paths.public.patterns, '*')], {force: true});
        cb();
    });

    gulp.task('patternlab', ['pl:clean'], function(cb) {
        patternlab.build(false);
        cb();
    });

    gulp.task('patternlab:v', function() {
        patternlab.version();
    });

    gulp.task('patternlab:only_patterns', ['pl:clean'], function(cb) {
        patternlab.build_patterns_only(false);
        cb();
    });

    gulp.task('patternlab:help', function() {
        patternlab.help();
    });
};