"use strict";

var annotations_exporter = function (pl) {
  var path = require('path'),
    fs = require('fs-extra'),
    JSON5 = require('json5'),
    paths = pl.config.paths;

  // HELPER FUNCTIONS
  function parseAnnotationsJS() {
    //attempt to read the file
    try {
      var oldAnnotations = fs.readFileSync(path.resolve(paths.source.annotations, 'annotations.js'), 'utf8');
    } catch (ex) {
      console.log(ex, 'This may be expected.');
    }

    //parse as JSON by removing the old wrapping js syntax. comments and the trailing semi-colon
    oldAnnotations = oldAnnotations.replace('var comments = ', '');
    try {
      var oldAnnotationsJSON = JSON5.parse(oldAnnotations.trim().slice(0, -1));
    } catch (ex) {
      console.log('There was an error parsing JSON for ' + paths.source.annotations + 'annotations.js');
      console.log(ex);
    }
    return oldAnnotationsJSON;
  }

  function gatherAnnotations() {
    //todo: merge markdown too https://github.com/pattern-lab/patternlab-php-core/blob/c2c4bc6a8bda2b2f9c08b197669ebc94c025e7c6/src/PatternLab/Annotations.php
    return parseAnnotationsJS();
  }

  return {
    gather: function () {
      return gatherAnnotations();
    }
  };

};

module.exports = annotations_exporter;
