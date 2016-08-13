"use strict";

var path = require('path');
var pa = require('../core/lib/pattern_assembler');
var testPatternsPath = path.resolve(__dirname, 'files', '_underscore-test-patterns');
var eol = require('os').EOL;

// fake pattern lab constructor:
// sets up a fake patternlab object, which is needed by the pattern processing
// apparatus.
function fakePatternLab() {
  var fpl = {
    partials: {},
    patterns: [],
    footer: '',
    header: '',
    listitems: {},
    listItemArray: [],
    data: {
      link: {}
    },
    config: require('../patternlab-config.json'),
    package: {}
  };

  // patch the pattern source so the pattern assembler can correctly determine
  // the "subdir"
  fpl.config.paths.source.patterns = testPatternsPath;

  return fpl;
}

exports['engine_underscore'] = {
  'hello world underscore pattern renders': function (test) {
    test.expect(1);

    var patternPath = path.resolve(
      testPatternsPath,
      '00-atoms',
      '00-global',
      '00-helloworld.html'
    );

    // do all the normal processing of the pattern
    var patternlab = new fakePatternLab();
    var assembler = new pa();
    var helloWorldPattern = assembler.process_pattern_iterative(patternPath, patternlab);
    assembler.process_pattern_recursive(patternPath, patternlab);

    test.equals(helloWorldPattern.render(), 'Hello world!' + eol);
    test.done();
  },
  'underscore partials can render JSON values': function (test) {
    test.expect(1);

    // pattern paths
    var pattern1Path = path.resolve(
      testPatternsPath,
      '00-atoms',
      '00-global',
      '00-helloworld-withdata.html'
    );

    // set up environment
    var patternlab = new fakePatternLab(); // environment
    var assembler = new pa();

    // do all the normal processing of the pattern
    var helloWorldWithData = assembler.process_pattern_iterative(pattern1Path, patternlab);
    assembler.process_pattern_recursive(pattern1Path, patternlab);

    // test
    test.equals(helloWorldWithData.render(), 'Hello world!' + eol + 'Yeah, we got the subtitle from the JSON.' + eol);
    test.done();
  },
  'findPartial return the ID of the partial, given a whole partial call': function (test) {
    var engineLoader = require('../core/lib/pattern_engines');
    var underscoreEngine = engineLoader.underscore;

    test.expect(1);

    // do all the normal processing of the pattern
    // test
    test.equals(underscoreEngine.findPartial("<%= _.renderNamedPartial('molecules-details', obj) %>"), 'molecules-details');
    test.done();
  }
};



// don't run these tests unless underscore is installed
var engineLoader = require('../core/lib/pattern_engines');
if (!engineLoader.underscore) {
  console.log("Underscore engine not installed, skipping tests.");
  delete exports.engine_underscore;
}
