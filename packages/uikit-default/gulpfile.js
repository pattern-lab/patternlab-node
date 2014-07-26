/* load the plugins */
var plugins = require('gulp-load-plugins')(scope: ['devDependencies']);

/* clean task */
gulp.task('clean', function () {
	cleanDirs = [];
	cleanDirs.push('dist/bower_components/*.(js|css)');
	cleanDirs.push('../../../public/styleguide/bower_components/*.(js|css)');
	cleanDirs.push('dist/js/*.js');
	cleanDirs.push('../../../public/styleguide/js/*.js');
	return gulp.src(, {read: false}).pipe(plugins.clean());
});

/* core tasks */
gulp.task("bower-files", ['clean'], function(){
	plugins.bowerFiles()
	.pipe(gulp.dest("dist/bower_components"))
	.pipe(gulp.dest("../../../public/styleguide/bower_components"));
});

gulp.task('js', ['clean'], function() {
	return gulp.src('src/js/*.js')
		.pipe(plugins.jshint('.jshintrc'))
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.concat('main.js'))
		.pipe(gulp.dest('dist/assets/js'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('dist/assets/js'))
		.pipe(gulp.dest('../../../public/styleguide/js'))
		.pipe(plugins.notify({ message: 'Scripts task complete' }));
});

gulp.task('styleguide-general', ['clean'], function() {
	return gulp.src(['src/css/styleguide.scss','typeahead.scss'])
		.pipe(plugins.rubySass({ style: 'expanded' }))
		.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('assets/css/app'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.minifyCss())
		.pipe(gulp.dest('assets/css/app'))
		.pipe(gulp.dest('../../../public/styleguide/css'))
		.pipe(plugins.notify({ message: 'Styleguide-general task complete' }));
});

gulp.task('styleguide-specific', ['clean'], function() {
	return gulp.src('src/css/styleguide-specific.scss')
		.pipe(plugins.rubySass({ style: 'expanded' }))
		.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('dist/css/custom'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.minifyCss())
		.pipe(gulp.dest('dist/css/custom'))
		.pipe(gulp.dest('../../../public/styleguide/css'))
		.pipe(plugins.notify({ message: 'Styleguide-specific task complete' }));
});

gulp.task('default', function () {
	gulp.watch(['src/bower_components/**/*'], ['bower']);
	gulp.watch(['src/js/*'], ['js']);
	gulp.watch(['src/css/styleguide.scss'], ['styleguide-general']);
	gulp.watch(['src/css/styleguide-specific.scss'], ['styleguide-specific']);
});
