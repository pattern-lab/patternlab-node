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
plugins.mainBowerFiles = require('main-bower-files');

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

/* core tasks */
gulp.task('build:bower', ['clean'], function() {
  return gulp
    .src(plugins.mainBowerFiles())
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('dist/styleguide/bower_components'))
    .pipe(copyPublic('styleguide/bower_components'));
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

gulp.task(
  'criticalcss',
  ['clean', 'build:js-pattern', 'build:css', 'prebuild:html'],
  function(cb) {
    return buildCriticalCSS(cb);
  }
);

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

gulp.task(
  'prebuild:html',
  ['clean', 'build:css', 'copy:js', 'build:js-pattern'],
  function() {
    return gulp
      .src('src/html/index.html')
      .pipe(plugins.fileInclude({ prefix: '@@', basepath: '@file' }))
      .pipe(gulp.dest('dist'))
      .pipe(copyPublic(''));
  }
);

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

gulp.task('build:js-viewer', ['clean'], function() {
  return gulp
    .src(['src/js/*.js', '!src/js/modal-styleguide.js'])
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.jshint.reporter('default'))
    .pipe(
      plugins.resolveDependencies({ pattern: /\* @requires [\s-]*(.*?\.js)/g })
    )
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(plugins.concat('patternlab-viewer.js'))
    .pipe(gulp.dest('dist/styleguide/js'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('dist/styleguide/js'))
    .pipe(copyPublic('styleguide/js'));
});

gulp.task('build:js-pattern', ['clean', 'build:js-viewer'], function() {
  // 'src/js/annotations-pattern.js','src/js/code-pattern.js','src/js/info-panel.js'
  return gulp
    .src([
      'src/js/postmessage.js',
      'src/js/panels-shared.js',
      'src/js/clipboard.min.js',
      'src/js/modal-styleguide.js',
    ])
    .pipe(plugins.jshint('.jshintrc'))
    .pipe(plugins.jshint.reporter('default'))
    .pipe(
      plugins.resolveDependencies({ pattern: /\* @requires [\s-]*(.*?\.js)/g })
    )
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(plugins.concat('patternlab-pattern.js'))
    .pipe(gulp.dest('dist/styleguide/js'))
    .pipe(plugins.rename({ suffix: '.min' }))
    .pipe(plugins.uglify())
    .pipe(gulp.dest('dist/styleguide/js'))
    .pipe(copyPublic('styleguide/js'));
});

// @todo: re-enable once cache busting strategy in place
// gulp.task('service-worker', ['build:html'], function() {
//   return workboxBuild.generateSW({
//     globDirectory: 'dist',
//     globPatterns: ['**/*.{html,json,js,css}'],
//     swDest: 'dist/sw.js',
//     clientsClaim: true,
//     skipWaiting: true,
//   });
// });

gulp.task(
  'default',
  [
    'build:bower',
    'copy:js',
    'build:css',
    'build:js-pattern',
    'build:html',
    'prebuild:html',
    // 'service-worker', // @todo: uncomment once cache-busting strategy in place
  ],
  function() {
    if (args.watch !== undefined) {
      gulp.watch(['src/bower_components/**/*'], ['build:bower']);
      gulp.watch(
        ['src/sass/pattern-lab.scss', 'src/sass/scss/**/*'],
        ['build:css']
      );
      gulp.watch(['src/html/*'], ['build:html']);
      gulp.watch(['src/js/*'], ['build:js-pattern']);
    }
  }
);
