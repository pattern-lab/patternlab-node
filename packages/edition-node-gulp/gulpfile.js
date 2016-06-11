/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library and move supporting frontend assets.
******************************************************/
var pkg = require('./package.json'),
    gulp = require('gulp'),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    argv = require('minimist')(process.argv.slice(2));;

/******************************************************
 * PATTERN LAB CONFIGURATION
******************************************************/
//read all paths from our namespaced config file
var config = require('./patternlab-config.json'),
    pl = require('patternlab-node')(config);

function paths() {
  return config.paths;
}

function getConfiguredCleanOption() {
  return config.cleanPublic;
}

gulp.task('patternlab', ['pl-prelab'], function (done) {
  pl.build(getConfiguredCleanOption());
  done();
});

gulp.task('patternlab:version', function (done) {
  pl.version();
  done();
});

gulp.task('patternlab:help', function (done) {
  console.log(getConfiguredCleanOption());
  pl.help();
  done();
});


gulp.task('patternlab:patternsonly', function (done) {
  pl.patternsonly(getConfiguredCleanOption());
  done();
});

gulp.task('patternlab:starterkit-list', function (done) {
  pl.liststarterkits();
  done();
});

gulp.task('patternlab:starterkit-load', function (done) {
  pl.loadstarterkit(argv.kit);
  done();
});

/******************************************************
 * COPY TASKS
******************************************************/
// JS copy
gulp.task('pl-copy:js', function(){
  return gulp.src('**/*.js', {cwd: path.resolve(paths().source.js)} )
    .pipe(gulp.dest(path.resolve(paths().public.js)));
});

// Images copy
gulp.task('pl-copy:img', function(){
  return gulp.src(
    [ '**/*.gif', '**/*.png', '**/*.jpg', '**/*.jpeg'  ],
    {cwd: path.resolve(paths().source.images)} )
    .pipe(gulp.dest(path.resolve(paths().public.images)));
});

// Favicon copy
gulp.task('pl-copy:favicon', function(){
  return gulp.src('favicon.ico', {cwd: path.resolve(paths().source.root)} )
    .pipe(gulp.dest(path.resolve(paths().public.root)));
});

// Fonts copy
gulp.task('pl-copy:font', function(){
  return gulp.src('*', {cwd: path.resolve(paths().source.fonts)})
    .pipe(gulp.dest(path.resolve(paths().public.fonts)));
});

// Data copy
gulp.task('pl-copy:data', function(){
  return gulp.src('annotations.js', {cwd: path.resolve(paths().source.data)})
    .pipe(gulp.dest(path.resolve(paths().public.data)));
});

// CSS Copy
gulp.task('pl-copy:css', function(){
  return gulp.src(path.resolve(paths().source.css, '*.css'))
    .pipe(gulp.dest(path.resolve(paths().public.css)))
    .pipe(browserSync.stream());
});

// Styleguide Copy everything but css
gulp.task('pl-copy:styleguide', function(){
  return gulp.src(path.resolve(paths().source.styleguide, '**/!(*.css)'))
    .pipe(gulp.dest(path.resolve(paths().public.root)))
    .pipe(browserSync.stream());
});

// Styleguide Copy and flatten css
gulp.task('pl-copy:styleguide-css', function(){
  return gulp.src(path.resolve(paths().source.styleguide, '**/*.css'))
    .pipe(gulp.dest(function(file){
      //flatten anything inside the styleguide into a single output dir per http://stackoverflow.com/a/34317320/1790362
      file.path = path.join(file.base, path.basename(file.path));
      return path.resolve(path.join(paths().public.styleguide, 'css'));
    }))
    .pipe(browserSync.stream());
});


/******************************************************
 * SERVER AND WATCH TASKS
******************************************************/
// watch task utility functions
function getSupportedTemplateExtensions() {
  var engines = require('./node_modules/patternlab-node/core/lib/pattern_engines');
  return engines.getSupportedFileExtensions();
}
function getTemplateWatches() {
  return getSupportedTemplateExtensions().map(function (dotExtension) {
    return path.resolve(paths().source.patterns, '**/*' + dotExtension);
  });
}

gulp.task('pl-connect', ['pl-build'], function() {
  browserSync.init({
    server: {
      baseDir: path.resolve(paths().public.root)
    },
    snippetOptions: {
      // Ignore all HTML files within the templates folder
      blacklist: ['/index.html', '/', '/?*']
    },
    notify: {
      styles: [
        'display: none',
        'padding: 15px',
        'font-family: sans-serif',
        'position: fixed',
        'font-size: 1em',
        'z-index: 9999',
        'bottom: 0px',
        'right: 0px',
        'border-top-left-radius: 5px',
        'background-color: #1B2032',
        'opacity: 0.4',
        'margin: 0',
        'color: white',
        'text-align: center'
      ]
    }
  });
  gulp.watch(path.resolve(paths().source.css, '**/*.css'), ['pl-copy:css']);

  gulp.watch(path.resolve(paths().source.styleguide, '**/*.*'), ['pl-copy:styleguide', 'pl-copy:styleguide-css']);

  var patternWatches = [
    path.resolve(paths().source.patterns, '**/*.json'),
    path.resolve(paths().source.patterns, '**/*.md'),
    path.resolve(paths().source.data, '*.json'),
    path.resolve(paths().source.fonts + '/*'),
    path.resolve(paths().source.images + '/*'),
    path.resolve(paths().source.meta, '*'),
    path.resolve(paths().source.annotations + '/*')
  ].concat(getTemplateWatches());

  gulp.watch(patternWatches, ['pl-pipe'], function () { browserSync.reload(); });
});

gulp.task('pl-pipe', ['pl-build'], function(cb){
  cb();
  browserSync.reload();
});

/******************************************************
 * COMPOUND AND ALIASED TASKS
******************************************************/
gulp.task('default', ['pl-build']);

gulp.task('pl-assets', ['pl-copy:js', 'pl-copy:img', 'pl-copy:favicon', 'pl-copy:font', 'pl-copy:data', 'pl-copy:css', 'pl-copy:styleguide', 'pl-copy:styleguide-css' ]);
gulp.task('pl-prelab', ['pl-assets']);
gulp.task('pl-build', ['pl-prelab', 'patternlab'], function(cb){cb();});
gulp.task('pl-serve', ['pl-build', 'pl-connect']);

//Aliases
gulp.task('pl-help', ['patternlab:help']);
gulp.task('pl-patterns', ['patternlab:patternsonly']);
