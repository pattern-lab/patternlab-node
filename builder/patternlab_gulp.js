/** 
 * patternlab-node - v0.13.0 - 2015
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 * 
 **/var patternlab_engine = require('./patternlab.js');

module.exports = function(gulp) {

  gulp.task('patternlab', function(cb) {
    var patternlab = patternlab_engine();
    patternlab.build(false);
    cb();
  });

  gulp.task('patternlab:version', function(cb) {
    var patternlab = patternlab_engine();
    patternlab.version();
    cb();
  });

  gulp.task('patternlab:only_patterns', function(cb) {
    var patternlab = patternlab_engine();
    patternlab.build_patterns_only(false);
    cb();
  });

  gulp.task('patternlab:help', function(cb) {
    var patternlab = patternlab_engine();
    patternlab.help();
    cb();
  });
};
