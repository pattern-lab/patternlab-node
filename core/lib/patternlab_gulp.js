/* 
 * patternlab-node - v1.2.2 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

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
