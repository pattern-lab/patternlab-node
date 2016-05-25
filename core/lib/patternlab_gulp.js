"use strict";

var patternlab_engine = require('./patternlab.js');

module.exports = function (gulp) {

  gulp.task('patternlab', ['clean'], function (cb) {
    var patternlab = patternlab_engine();
    patternlab.build(false);
    cb();
  });

  gulp.task('patternlab:version', function () {
    var patternlab = patternlab_engine();
    patternlab.version();
  });

  gulp.task('patternlab:only_patterns', ['clean'], function () {
    var patternlab = patternlab_engine();
    patternlab.build_patterns_only(false);
  });

  gulp.task('patternlab:help', function () {
    var patternlab = patternlab_engine();
    patternlab.help();
  });
};
