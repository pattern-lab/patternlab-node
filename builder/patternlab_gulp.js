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
  var patternlab_engine = require('./patternlab.js'),
      pkg = require('./../package.json'),
      path = require('path'),
      eol = require('os').EOL,
      del = require('del'),
      strip_banner = require('gulp-strip-banner'),
      header = require('gulp-header'),
      nodeunit = require('gulp-nodeunit'),
      browserSync = require('browser-sync').create();

  // Patternlab tasks
  gulp.task('patternlab', ['clean'], function(cb){
    var patternlab = patternlab_engine();
    patternlab.build(false);
    cb();
  });

  gulp.task('patternlab:version', function(){
    var patternlab = patternlab_engine();
    patternlab.version();
  });

  gulp.task('patternlab:only_patterns', ['clean'], function(){
    var patternlab = patternlab_engine();
    patternlab.build_patterns_only(false);
  });

  gulp.task('patternlab:help', function(){
    var patternlab = patternlab_engine();
    patternlab.help();
  });

  var banner = [ '/** ',
    ' * <%= pkg.name %> - v<%= pkg.version %> - <%= today %>',
    ' * ',
    ' * <%= pkg.author %>, and the web community.',
    ' * Licensed under the <%= pkg.license %> license.',
    ' * ',
    ' * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.',
    ' * ', ' **/'].join(eol);

  //clean patterns dir
  gulp.task('clean', function(cb){
    del.sync([path.resolve(config.paths.public.patterns, '*')], {force: true});
    cb();
  });

  //build the banner
  gulp.task('banner', function(){
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
      './builder/list_item_hunter.js',
      './builder/style_modifier_hunter.js'
    ])
      .pipe(strip_banner())
      .pipe(header( banner, {
        pkg : pkg,
        today : new Date().getFullYear() }
      ))
      .pipe(gulp.dest('./builder'));
  });


  // COPY TASKS

  // JS copy
  gulp.task('cp:js', function(){
    return gulp.src('**/*.js', {cwd: path.resolve(config.paths.source.js)} )
      .pipe(gulp.dest(path.resolve(config.paths.public.js)));
  });

  // Images copy
  gulp.task('cp:img', function(){
    return gulp.src(
      [ '**/*.gif', '**/*.png', '**/*.jpg', '**/*.jpeg'  ],
      {cwd: path.resolve(config.paths.source.images)} )
      .pipe(gulp.dest(path.resolve(config.paths.public.images)));
  });

  // Fonts copy
  gulp.task('cp:font', function(){
    return gulp.src('*', {cwd: path.resolve(config.paths.source.fonts)})
      .pipe(gulp.dest(path.resolve(config.paths.public.images)));
  });

  // Data copy
  gulp.task('cp:data', function(){
    return gulp.src('annotations.js', {cwd: path.resolve(config.paths.source.data)})
      .pipe(gulp.dest(path.resolve(config.paths.public.data)));
  });

  // CSS Copy
  gulp.task('cp:css', function(){
    return gulp.src(path.resolve(config.paths.source.css, 'style.css'))
      .pipe(gulp.dest(path.resolve(config.paths.public.css)))
      .pipe(browserSync.stream());
  });

  // Styleguide Copy
  gulp.task('cp:styleguide', function(){
    return gulp.src(
        [ '**/*'],
        {cwd: path.resolve(config.paths.source.styleguide)} )
        .pipe(gulp.dest(path.resolve(config.paths.public.styleguide)))
        .pipe(browserSync.stream());;
  });

  //server and watch tasks
  gulp.task('connect', ['lab'], function(){
    browserSync.init({
      server: {
        baseDir: path.resolve(config.paths.public.root)
      }
    });
    gulp.watch(path.resolve(config.paths.source.css, '**/*.css'), ['cp:css']);

    gulp.watch(path.resolve(config.paths.source.styleguide, '**/*.*'), ['cp:styleguide']);

    gulp.watch(
      [
        path.resolve(config.paths.source.patterns, '**/*.mustache'),
        path.resolve(config.paths.source.patterns, '**/*.json'),
        path.resolve(config.paths.source.data, '*.json'),
        path.resolve(config.paths.source.fonts + '/*'),
        path.resolve(config.paths.source.images + '/*'),
        path.resolve(config.paths.source.data + '*.json'),
      ],
      ['lab-pipe'],
      function () { browserSync.reload(); }
    );

  });

  //unit test
  gulp.task('nodeunit', function(){
    return gulp.src('./test/**/*_tests.js')
      .pipe(nodeunit());
  });


  gulp.task('lab-pipe', ['lab'], function(cb){
    cb();
    browserSync.reload();
  });

  gulp.task('default', ['lab']);

  gulp.task('assets', ['cp:js', 'cp:img', 'cp:font', 'cp:data', 'cp:css', 'cp:styleguide' ]);
  gulp.task('prelab', ['clean', 'assets']);
  gulp.task('lab', ['prelab', 'patternlab'], function(cb){cb();});
  gulp.task('patterns', ['patternlab:only_patterns']);
  gulp.task('serve', ['lab', 'connect']);
  gulp.task('travis', ['lab', 'nodeunit']);

  gulp.task('version', ['patternlab:version']);
  gulp.task('help', ['patternlab:help']);

};
