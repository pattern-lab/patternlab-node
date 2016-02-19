/*
 * patternlab-node - v1.1.1 - 2016
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
    var pkg = require('./../package.json'),
        eol = require('os').EOL,
        strip_banner = require('gulp-strip-banner'),
        header = require('gulp-header');

    var banner = [ '/* ',
        ' * <%= pkg.name %> - v<%= pkg.version %> - <%= today %>',
        ' * ',
        ' * <%= pkg.author %>, and the web community.',
        ' * Licensed under the <%= pkg.license %> license.',
        ' * ',
        ' * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.',
        ' * ', ' */', '', ''].join(eol);

    //build the banner
    gulp.task('pl:banner', function(){
        return gulp.src(['./builder/*.js'])
            .pipe(strip_banner())
            .pipe(header(banner, {
                pkg : pkg,
                today : new Date().getFullYear() }
            ))
            .pipe(gulp.dest('./builder'));
    });
};