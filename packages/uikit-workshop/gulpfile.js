/* load command line arguments */
const args = require('yargs').argv;

/* load gulp */
const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const inlinesource = require('gulp-inline-source');
const path = require('path');
const { buildCriticalCSS } = require('./penthouse');

// @todo: uncomment once cache-busting strategy in place.
// const workboxBuild = require('workbox-build');

/* load the plugins */
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins({ scope: ['devDependencies'] });
plugins.del = require('del');

/* copy the dist folder into the designated public folder */
function copyPublic(suffix) {
  if (args['copy-dist'] !== undefined) {
    return gulp.dest(args['copy-dist'] + '/' + suffix);
  } else {
    return plugins.util.noop();
  }
}

/* clean tasks */
gulp.task('clean', function(cb) {
  return plugins.del(['dist'], cb);
});

gulp.task('build:css', ['clean'], function() {
  return gulp
    .src([
      'src/sass/pattern-lab.scss',
      'src/sass/pattern-lab--iframe-loader.scss',
    ])

    .pipe(
      plugins
        .sass({
          outputStyle: 'expanded',
          sourceMap: false,
        })
        .on('error', plugins.sass.logError)
    )
    .pipe(
      plugins.autoprefixer(
        {
          browsers: [
            'last 2 version',
            'safari 5',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'android 4',
          ],
        },
        { map: false }
      )
    )
    .pipe(
      cleanCSS({
        compatibility: 'ie9',
        level: 1,
        inline: ['remote'],
      })
    )
    .pipe(gulp.dest('dist/styleguide/css'))
    .pipe(copyPublic('styleguide/css'));
});

gulp.task('criticalcss', ['clean', 'build:css', 'prebuild:html'], function(cb) {
  return buildCriticalCSS(cb);
});

gulp.task('copy:js', ['clean'], function() {
  return gulp
    .src([
      // @todo: remove once improved JS build is in place
      'node_modules/fg-loadcss/dist/cssrelpreload.min.js',
      'node_modules/whendefined/dist/whendefined.min.js',
      'node_modules/fg-loadjs/loadJS.js',
    ])
    .pipe(gulp.dest('dist/styleguide/js'))
    .pipe(copyPublic(''));
});

gulp.task('prebuild:html', ['clean', 'build:css', 'copy:js'], function() {
  return gulp
    .src('src/html/index.html')
    .pipe(plugins.fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(gulp.dest('dist'))
    .pipe(copyPublic(''));
});

gulp.task('build:html', ['clean', 'criticalcss', 'prebuild:html'], function() {
  return gulp
    .src('dist/index.html')
    .pipe(
      inlinesource({
        rootpath: path.resolve('dist'),
        compress: true,
      })
    )
    .pipe(gulp.dest('dist'))
    .pipe(copyPublic(''));
});

gulp.task('build:images', ['clean'], function() {
  return gulp
    .src('src/images/*')
    .pipe(
      plugins.imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [plugins.pngcrush()],
      })
    )
    .pipe(gulp.dest('dist/styleguide/images'))
    .pipe(copyPublic('styleguide/images'));
});

gulp.task(
  'default',
  [
    'build:css',
    'build:html',
    'copy:js',
    'prebuild:html',
    // 'service-worker', // @todo: uncomment once cache-busting strategy in place
  ],
  function() {
    if (args.watch !== undefined) {
      gulp.watch(
        ['src/sass/pattern-lab.scss', 'src/sass/scss/**/*'],
        ['build:css']
      );
      gulp.watch(['src/html/*'], ['build:html']);
    }
  }
);
