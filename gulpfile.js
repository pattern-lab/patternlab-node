// Special thanks to oscar-g (https://github.com/oscar-g) for starting this at https://github.com/oscar-g/patternlab-node/tree/dev-gulp

var
  gulp = require('gulp'),
  del = require('del'),
  nodeunit = require('gulp-nodeunit'),
  sass = require('gulp-sass'),
  nodeSassGlobbing = require('node-sass-globbing'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create();

gulp.task('deployAws', require('./deploy/tasks/deployAws'));
gulp.task('notifyAboutNewVersion', require('./deploy/tasks/notifyAboutNewVersion'));

require('gulp-load')(gulp);

//clean patterns dir
gulp.task('clean', function (cb) {
  del.sync(['./public/patterns/*'], {force: true});
  cb();
});

//load patternlab-node tasks
gulp.loadTasks(__dirname + '/builder/patternlab_gulp.js');

//copy tasks
gulp.task('cp:js', function () {
  return gulp.src(['**/*.js', '!**/scripts.js'], {cwd: './source/js'})
    .pipe(gulp.dest('./public/js'))
});
gulp.task('cp:img', function () {
  var imagemin = require('gulp-imagemin');
  return gulp.src('./source/images/**/*.{gif,png,jpg,jpeg,svg}')
    .pipe(imagemin())
    .pipe(gulp.dest('./public/images'))
});
gulp.task('cp:font', function () {
  return gulp.src('*.*', {cwd: './source/fonts'})
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
    bulkify    = require('bulkify'),
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

//unit test
gulp.task('nodeunit', function () {
  return gulp.src('./test/**/*_tests.js')
    .pipe(nodeunit());
});

//sass tasks, turn on if you want to use
gulp.task('sass:style', function () {
  var base64Inline = require('gulp-base64-inline')

  return gulp.src(['./source/css/*.scss', './source/css/wip/*.scss'], { base : './source/css' })
    .pipe(sass({
      importer: nodeSassGlobbing,
      outputStyle: 'expanded',
      precision: 8
    }))
    .pipe(base64Inline(''))
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

gulp.task('iconfont', function() {
  var iconfont = require('gulp-iconfont'),
    iconfontCss = require('gulp-iconfont-css'),
    fs = require('fs');

  return gulp.src('./source/_patterns/00-atoms/03-images/_icons/**/*.svg')
    .pipe(iconfontCss({
      fontName: 'horizn-icons',
      path: 'scss',
      targetPath: '../../source/_patterns/00-atoms/03-images/05-icons.scss',
      fontPath: '../fonts/'
    }))
    .pipe(iconfont({
      fontName: 'horizn-icons',
      appendUnicode: true,
      normalize:true,
      formats: ['ttf', 'woff', 'woff2', 'svg'],
      timestamp: new Date().getTime()
    }))
    .on('glyphs', function(glyphs) {
      var html = '<!-- This file is generated, don\'t change! -->\n\n<div class="icons patternlab">\n' + glyphs.map(function(glyph) {
          return '\t<span class="icon-' + glyph.name + '"></span>\n\t<div class="icons__description">icon-' + glyph.name + '</div>';
        }).join('\n\n') + '\n</div>';
      fs.writeFile('source/_patterns/00-atoms/03-images/05-icons.mustache', html);
    })
    .pipe(gulp.dest('public/fonts'))
    ;
});

gulp.task('assets', gulp.series('iconfont', 'cp:img', gulp.parallel('cp:js', 'cp:font', 'cp:data', 'sass:style', 'sass:styleguide', 'js')));
gulp.task('prelab', gulp.series('clean', 'assets'));
gulp.task('lab', gulp.series('prelab', 'patternlab'));

//server and watch tasks
gulp.task('serve', gulp.series('lab', function serve() {
  browserSync.init({
    socket: {
      domain: 'localhost:3000'
    },
    server: {
      baseDir: './public/',
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    },
    ghostMode: false,
    notify : false
  });

  gulp.watch('source/css/style.css', gulp.series('cp:css'));
  gulp.watch(['source/**/*.scss', '!./source/_patterns/**/*icons.scss'], gulp.series('sass:style'));
  gulp.watch('public/styleguide/*.scss', gulp.series('sass:styleguide'));
  gulp.watch('source/_patterns/**/*.js', gulp.series('js'));
  gulp.watch('source/fonts/icon-source/**/*.svg', gulp.series('iconfont'));
  gulp.watch([
      '!source/_patterns/00-atoms/03-images/05-icons.mustache',
      'source/_patterns/**/*.mustache',
      'source/_patterns/**/*.json',
      'source/_data/*.json'],
    gulp.series('cp:data', 'patterns', function reload(cb) {
      browserSync.reload();
      cb();
    }));
  gulp.watch('./source/images/**/*.{gif,png,jpg,jpeg,svg}', gulp.series('cp:img', 'sass:style'));
}));

gulp.task('default', gulp.series('lab'));
gulp.task('patterns', gulp.series('patternlab:only_patterns'));
gulp.task('travis', gulp.series('lab', 'nodeunit'));
gulp.task('version', gulp.series('patternlab:version'));
gulp.task('help', gulp.series('patternlab:help'));
gulp.task('deploy', gulp.series('lab', 'deployAws', 'notifyAboutNewVersion'));