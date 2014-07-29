/* load command line arguments */
var args = require('yargs').argv;

/* load gulp */
var gulp = require('gulp');

/* load the plugins */
var gulpLoadPlugins    = require('gulp-load-plugins');
var plugins            = gulpLoadPlugins({ scope: ['devDependencies'] });
plugins.mainBowerFiles = require("main-bower-files");
plugins.pngcrush       = require('imagemin-pngcrush');

/* clean tasks */
gulp.task('clean:bower', function () {
	return gulp.src('dist/bower_components/*', { read: false }).pipe(plugins.rimraf());
});

gulp.task('clean:css-patternlab', function () {
	return gulp.src('dist/css/patternlab/*', { read: false }).pipe(plugins.rimraf());
});

gulp.task('clean:css-custom', function () {
	return gulp.src('dist/css/custom/*', { read: false }).pipe(plugins.rimraf());
});

gulp.task('clean:fonts', function () {
	return gulp.src('dist/fonts/*', { read: false }).pipe(plugins.rimraf());
});

gulp.task('clean:html', function () {
	return gulp.src('dist/html/index.html', { read: false }).pipe(plugins.rimraf());
});

gulp.task('clean:images', function () {
	return gulp.src('dist/images/*', { read: false }).pipe(plugins.rimraf());
});

gulp.task('clean:js', function () {
	return gulp.src('dist/js/*', { read: false }).pipe(plugins.rimraf());
});

/* core tasks */
gulp.task('build:bower', ['clean:bower'], function(){
	return gulp.src(plugins.mainBowerFiles())
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.uglify())
		.pipe(gulp.dest("dist/bower_components"))
		.pipe(gulp.dest("../../../public/styleguide/bower_components"));
});

gulp.task('build:css-general', function() {
	return gulp.src(['src/css/prism-okaidia.css','src/css/typeahead.css'])
		.pipe(plugins.concat('prism-typeahead.css'))
		.pipe(gulp.dest('dist/css/patternlab'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.minifyCss())
		.pipe(gulp.dest('dist/css/patternlab'))
		.pipe(gulp.dest('../../../public/styleguide/css'));
});

gulp.task('build:css-patternlab', ['clean:css-patternlab', 'build:css-general'], function() {
	return gulp.src('src/sass/styleguide.scss')
		.pipe(plugins.rubySass({ style: 'expanded' }))
		.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('dist/css/patternlab'))
		.pipe(gulp.dest('dist/css/patternlab'))
		.pipe(gulp.dest('../../../public/styleguide/css'));
});

gulp.task('build:css-custom', ['clean:css-custom', 'build:css-patternlab'], function() {
	return gulp.src('src/sass/styleguide-specific.scss')
		.pipe(plugins.rubySass({ style: 'expanded' }))
		.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('dist/css/custom'))
		.pipe(gulp.dest('dist/css/custom'))
		.pipe(gulp.dest('../../../source/styleguide/css'));
});

gulp.task('build:fonts', ['clean:fonts'], function() {
	return gulp.src('src/fonts/*')
		.pipe(gulp.dest('dist/fonts'))
		.pipe(gulp.dest('../../../public/styleguide/fonts'));
});

gulp.task('build:html', ['clean:html'], function() {
	return gulp.src('src/html/index.html')
		.pipe(gulp.dest('dist/html'))
		.pipe(gulp.dest('../../../public'));
});

gulp.task('build:images', ['clean:images'], function() {
	return gulp.src('src/images/*')
		.pipe(plugins.imagemin({
		          progressive: true,
		          svgoPlugins: [{removeViewBox: false}],
		          use: [plugins.pngcrush()]
		 }))
		.pipe(gulp.dest('dist/images'))
		.pipe(gulp.dest('../../../public/styleguide/images'));
});

gulp.task('build:js-viewer', ['clean:js'], function() {
	return gulp.src(['src/js/*.js','!src/js/annotations-pattern.js','!src/js/code-pattern.js']) 
		.pipe(plugins.jshint('.jshintrc'))
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.resolveDependencies( { pattern: /\* @requires [\s-]*(.*?\.js)/g } ))
		.on('error', function(err) { console.log(err.message); })
		.pipe(plugins.concat('patternlab-viewer.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(gulp.dest('../../../public/styleguide/js'));
});

gulp.task('build:js-pattern', ['build:js-viewer'], function() {
	return gulp.src(['src/js/postmessage.js','src/js/annotations-pattern.js','src/js/code-pattern.js'])
		.pipe(plugins.jshint('.jshintrc'))
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.resolveDependencies( { pattern: /\* @requires [\s-]*(.*?\.js)/g } ))
		.on('error', function(err) { console.log(err.message); })
		.pipe(plugins.concat('patternlab-pattern.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(gulp.dest('../../../public/styleguide/js'));
});

gulp.task('default', ['build:bower', 'build:css-custom', 'build:fonts', 'build:html', 'build:images', 'build:js-pattern'], function () {
	
	if (args.watch !== undefined) {
		gulp.watch(['src/bower_components/**/*'], ['build:bower']);
		gulp.watch(['src/css/prism-okaidia.css','src/css/typeahead.css'],['build:css-general']);
		gulp.watch(['src/sass/styleguide.scss'], ['build:css-patternlab']);
		gulp.watch(['src/sass/styleguide-specific.scss'], ['build:css-custom']);
		gulp.watch(['src/fonts/*'], ['build:fonts'])
		gulp.watch(['src/html/index.html'], ['build:html']);
		gulp.watch(['src/images/*'], ['build:images']);
		gulp.watch(['src/js/*'], ['build:js-pattern']);
	}
	
});
