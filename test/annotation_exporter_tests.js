"use strict";

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

exports['annotaton_exporter'] = {

  'converts old JS annotations into new format': function (test) {
    //arrange
    var patternlab = createFakePatternLab({
      "patterns": [
        {
          "template": "{{ title }}",
          "extendedTemplate": "{{ title }}",
          "patternPartial": "test-simple",
          "jsonFileData": {}
        }

      ]
    });
    var ae = require('../core/lib/annotation_exporter')(patternlab);

    //act
    var annotations = ae.gatherJS();

    console.log(annotations);

    //assert
    test.equals(annotations.length, 2);
    test.equals(annotations[1].el, '.logo');
    test.equals(annotations[1].title, 'Logo');
    test.equals(annotations[1].comment, "The logo image is an SVG file, which ensures that the logo displays crisply even on high resolution displays. A PNG fallback is provided for browsers that don't support SVG images.</p><p>Further reading: <a href=\"http://bradfrostweb.com/blog/mobile/hi-res-optimization/\">Optimizing Web Experiences for High Resolution Screens</a></p>");

    test.done();
  }
};
