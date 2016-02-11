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
    var path = require('path'),
        browserSync = require('browser-sync').create();

    // Load CORE tasks
    require('./gulp-core')(gulp, config);

    // COPY TASKS

    // JS copy
    gulp.task('pl:cp:js', function(){
        return gulp.src('**/*.js', {cwd: path.resolve(config.paths.source.js)} )
            .pipe(gulp.dest(path.resolve(config.paths.public.js)));
    });

    // Images copy
    gulp.task('pl:cp:img', function(){
        return gulp.src(
            [ '**/*.gif', '**/*.png', '**/*.jpg', '**/*.jpeg'  ],
            {cwd: path.resolve(config.paths.source.images)} )
            .pipe(gulp.dest(path.resolve(config.paths.public.images)));
    });

    // Fonts copy
    gulp.task('pl:cp:font', function(){
        return gulp.src('*', {cwd: path.resolve(config.paths.source.fonts)})
            .pipe(gulp.dest(path.resolve(config.paths.public.images)));
    });

    // Data copy
    gulp.task('pl:cp:data', function(){
        return gulp.src('annotations.js', {cwd: path.resolve(config.paths.source.data)})
            .pipe(gulp.dest(path.resolve(config.paths.public.data)));
    });

    // CSS Copy
    gulp.task('pl:cp:css', function(){
        return gulp.src(path.resolve(config.paths.source.css, 'style.css'))
            .pipe(gulp.dest(path.resolve(config.paths.public.css)))
            .pipe(browserSync.stream());
    });

    // Styleguide Copy
    gulp.task('pl:cp:styleguide', function(){
        return gulp.src(
            [ '**/*'],
            {cwd: path.resolve(config.paths.source.styleguide)} )
            .pipe(gulp.dest(path.resolve(config.paths.public.styleguide)))
            .pipe(browserSync.stream());
    });

    //server and watch tasks
    gulp.task('pl:connect', ['pl:lab'], function(){
        browserSync.init({
            server: {
                baseDir: path.resolve(config.paths.public.root)
            }
        });
        gulp.watch(path.resolve(config.paths.source.css, '**/*.css'), ['pl:cp:css']);

        gulp.watch(path.resolve(config.paths.source.styleguide, '**/*.*'), ['pl:cp:styleguide']);

        gulp.watch(
            [
                path.resolve(config.paths.source.patterns, '**/*.mustache'),
                path.resolve(config.paths.source.patterns, '**/*.json'),
                path.resolve(config.paths.source.data, '*.json'),
                path.resolve(config.paths.source.fonts + '/*'),
                path.resolve(config.paths.source.images + '/*'),
                path.resolve(config.paths.source.data + '*.json')
            ],
            ['pl:lab-pipe'],
            function () { browserSync.reload(); }
        );

    });

    gulp.task('pl:lab-pipe', ['pl:lab'], function(cb){
        cb();
        browserSync.reload();
    });

    gulp.task('pl:assets', ['pl:cp:js', 'pl:cp:img', 'pl:cp:font', 'pl:cp:data', 'pl:cp:css', 'pl:cp:styleguide' ]);
    gulp.task('pl:prelab', ['pl:clean', 'pl:assets']);
    gulp.task('pl:lab', ['pl:prelab', 'patternlab'], function(cb){cb();});
    gulp.task('pl:patterns', ['patternlab:only_patterns']);
    gulp.task('pl:serve', ['pl:lab', 'pl:connect']);
};