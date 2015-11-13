// Special thanks to oscar-g (https://github.com/oscar-g) for starting this at https://github.com/oscar-g/patternlab-node/tree/dev-gulp

var
  pkg = require('./package.json'),
  gulp = require('gulp'),
  eol = require('os').EOL,
  del = require('del'),
  strip_banner = require('gulp-strip-banner'),
  header = require('gulp-header'),
  nodeunit = require('gulp-nodeunit'),
  sass = require('gulp-sass'),
  nodeSassGlobbing = require('node-sass-globbing'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  sequence = require('run-sequence');

gulp.task('deployAws', require('./deploy/tasks/deployAws'));
gulp.task('notifyAboutNewVersion', require('./deploy/tasks/notifyAboutNewVersion'));

require('gulp-load')(gulp);
var banner = ['/** ',
  ' * <%= pkg.name %> - v<%= pkg.version %> - <%= today %>',
  ' * ',
  ' * <%= pkg.author %>, and the web community.',
  ' * Licensed under the <%= pkg.license %> license.',
  ' * ',
  ' * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.',
  ' * ', ' **/'].join(eol);

//load patternlab-node tasks
gulp.loadTasks(__dirname + '/builder/patternlab_gulp.js');

//clean patterns dir
gulp.task('clean', function (cb) {
  del.sync(['./public/patterns/*'], {force: true});
  cb();
});

//build the banner
gulp.task('banner', function () {
  return gulp.src([
    './builder/patternlab.js',
    './builder/object_factory.js',
    './builder/lineage_hunter.js',
    './builder/media_hunter.js',
    './builder/patternlab_grunt.js',
    './builder/patternlab_gulp.js',
    './builder/parameter_hunter.js',
    './builder/pattern_exporter.js',
    './builder/pattern_assembler.js',
    './builder/pseudopattern_hunter.js',
    './builder/list_item_hunter.js'
  ])
    .pipe(strip_banner())
    .pipe(header(banner, {
        pkg: pkg,
        today: new Date().getFullYear()
      }
    ))
    .pipe(gulp.dest('./builder'));
});

//copy tasks
gulp.task('cp:js', function () {
  return gulp.src(['**/*.js', '!**/scripts.js'], {cwd: './source/js'})
    .pipe(gulp.dest('./public/js'))
});
gulp.task('cp:img', function () {
  return gulp.src(
    ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.jpeg'],
    {cwd: './source/images'})
    .pipe(gulp.dest('./public/images'))
});
gulp.task('cp:font', function () {
  return gulp.src('*', {cwd: './source/fonts'})
    .pipe(gulp.dest('./public/fonts'))
});
gulp.task('cp:data', function () {
  return gulp.src('annotations.js', {cwd: './source/_data'})
    .pipe(gulp.dest('./public/data'))
});
gulp.task('cp:css', function () {
  return gulp.src('./source/css/style.css')
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
});

//script task
gulp.task('js', function () {
  var
    browserify = require('browserify'),
    source     = require('vinyl-source-stream'),
    buffer     = require('vinyl-buffer'),
    bulkify    = require('bulkify')
    gutil      = require('gutil');

  return browserify({ entries : './source/js/scripts.js' })
    .transform(bulkify)
    .bundle()
    .on('error', gutil.log)
    .pipe(source('scripts.js'))
    .pipe(buffer())
    .pipe(gulp.dest('./public/js'))
    .pipe(browserSync.stream());
});

//server and watch tasks
gulp.task('connect', ['lab'], function () {
  browserSync.init({
    server: {
      baseDir: './public/'
    }
  });
  gulp.watch('./source/css/style.css', ['cp:css']);

  //suggested watches if you use scss
  gulp.watch('./source/**/*.scss', ['sass:style']);
  gulp.watch('./public/styleguide/*.scss', ['sass:styleguide']);

  gulp.watch('./source/_patterns/**/*.js', ['js']);

  gulp.watch([
      './source/_patterns/**/*.mustache',
      './source/_patterns/**/*.json',
      './source/_data/*.json'],
    ['lab-pipe'], function () {
      browserSync.reload();
    });

});

//unit test
gulp.task('nodeunit', function () {
  return gulp.src('./test/**/*_tests.js')
    .pipe(nodeunit());
});

//sass tasks, turn on if you want to use
gulp.task('sass:style', function () {
  return gulp.src(['./source/css/*.scss', './source/css/wip/*.scss'], { base : './source/css' })
    .pipe(sass({
      importer: nodeSassGlobbing,
      outputStyle: 'expanded',
      precision: 8
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
});

gulp.task('sass:styleguide', function () {
  return gulp.src('./public/styleguide/css/*.scss')
    .pipe(sass({
      importer: nodeSassGlobbing,
      outputStyle: 'expanded',
      precision: 8
    }))
    .pipe(gulp.dest('./public/styleguide/css'))
    .pipe(browserSync.stream());
});

gulp.task('lab-pipe', ['lab'], function (cb) {
  cb();
  browserSync.reload();
});

gulp.task('default', ['lab']);

gulp.task('assets', ['cp:js', 'cp:img', 'cp:font', 'cp:data', 'sass:style', 'sass:styleguide', 'js']);
gulp.task('prelab', ['clean', 'banner', 'assets']);
gulp.task('lab', ['prelab', 'patternlab'], function (cb) {
  cb();
});
gulp.task('patterns', ['patternlab:only_patterns']);
gulp.task('serve', ['lab', 'connect']);
gulp.task('travis', ['lab', 'nodeunit']);

gulp.task('version', ['patternlab:version']);
gulp.task('help', ['patternlab:help']);

gulp.task('deploy', function (done) {
  sequence(
    'lab',
    'deployAws',
    'notifyAboutNewVersion',
    done
  )
});