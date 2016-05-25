"use strict";

var eol = require('os').EOL;
var Pattern = require('../core/lib/object_factory').Pattern;
var extend = require('util')._extend;

function createFakePatternLab(customProps) {
  var pl = {
    "config": {
      "paths": {
        "source": {
          "annotations": './test/files/'
        }
      }
    }
  };

  return extend(pl, customProps);
}

var patternlab = createFakePatternLab();
var ae = require('../core/lib/annotation_exporter')(patternlab);

exports['annotaton_exporter'] = {

  'converts old JS annotations into new format': function (test) {
    //arrange
    //act
    var annotations = ae.gatherJS();

    //assert
    test.equals(annotations.length, 2);
    test.equals(annotations[1].el, '.logo');
    test.equals(annotations[1].title, 'Logo');
    test.equals(annotations[1].comment, "The logo image is an SVG file, which ensures that the logo displays crisply even on high resolution displays. A PNG fallback is provided for browsers that don't support SVG images.</p><p>Further reading: <a href=\"http://bradfrostweb.com/blog/mobile/hi-res-optimization/\">Optimizing Web Experiences for High Resolution Screens</a></p>");

    test.done();
  },

  'converts new markdown annotations into an array': function (test) {
    //arrange
    //act
    var annotations = ae.gatherMD();

    //assert
    test.equals(annotations.length, 3);
    test.equals(annotations[1].el, '.logo');
    test.equals(annotations[1].title, 'Logo');
    test.equals(annotations[1].comment.replace(/\r?\n|\r/gm, ""), '<p>The <em>logo image</em> is an SVG file.</p>');

    test.done();
  },

  'merges both annotation methods into one array' : function (test) {
    //arrange

    //act
    var annotations = ae.gather();

    //assert
    test.equals(annotations.length, 3);
    test.equals(annotations[2].el, '#nav');
    test.equals(annotations[2].title, 'Navigation');
    test.equals(annotations[2].comment.replace(/\r?\n|\r/gm, ""), '<p>Navigation for adaptive web experiences can be tricky. Refer to <a href="https://bradfrost.github.io/this-is-responsive/patterns.html#navigation">these repsonsive patterns</a> when evaluating solutions.</p>');

    test.done();

  }
};
