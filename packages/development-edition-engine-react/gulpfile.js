/******************************************************
 * PATTERN LAB NODE
 * EDITION-NODE-GULP
 * The gulp wrapper around patternlab-node core, providing tasks to interact with the core library.
 ******************************************************/
const gulp = require('gulp');
const argv = require('minimist')(process.argv.slice(2));

/******************************************************
 * PATTERN LAB  NODE WRAPPER TASKS with core library
 ******************************************************/
const config = require('./patternlab-config.json');
const patternlab = require('@pattern-lab/core')(config);

function build() {
  return patternlab
    .build({
      watch: argv.watch,
      cleanPublic: config.cleanPublic,
    })
    .then(() => {
      // do something else when this promise resolves
    });
}

function serve() {
  return patternlab
    .serve({
      cleanPublic: config.cleanPublic,
    })
    .then(() => {
      // do something else when this promise resolves
    });
}

gulp.task('patternlab:version', function() {
  patternlab.version();
});

gulp.task('patternlab:help', function() {
  patternlab.help();
});

gulp.task('patternlab:patternsonly', function() {
  patternlab.patternsonly(config.cleanPublic);
});

gulp.task('patternlab:liststarterkits', function() {
  patternlab.liststarterkits();
});

gulp.task('patternlab:loadstarterkit', function() {
  patternlab.loadstarterkit(argv.kit, argv.clean);
});

gulp.task('patternlab:build', function() {
  build().then(() => {
    // do something else when this promise resolves
  });
});

gulp.task('patternlab:serve', function() {
  serve().then(() => {
    // do something else when this promise resolves
  });
});

gulp.task('default', ['patternlab:help']);
