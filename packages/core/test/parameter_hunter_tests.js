'use strict';

const path = require('path');
const util = require('./util/test_utils.js');
const tap = require('tap');

const loadPattern = require('../src/lib/loadPattern');
const ph = require('../src/lib/parameter_hunter');
const processIterative = require('../src/lib/processIterative');

const parameter_hunter = new ph();

const config = require('./util/patternlab-config.json');
const engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

const testPatternsPath = path.resolve(__dirname, 'files', '_patterns');

tap.test('parameter hunter finds and extends templates', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('test', 'comment.mustache');
  var commentPattern = loadPattern(commentPath, pl);

  var testPatternPath = path.join('test', 'sticky-comment.mustache');
  var testPattern = loadPattern(testPatternPath, pl);

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2])
    .then(() => {
      //act
      parameter_hunter
        .find_parameters(testPattern, pl)
        .then(() => {
          //assert
          test.equal(
            util.sanitized(testPattern.extendedTemplate),
            util.sanitized(
              '<h1>{{foo}}</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>'
            )
          );
          test.end();
        })
        .catch(test.threw);
    })
    .catch(test.threw);
});

tap.test(
  'parameter hunter finds and extends templates with verbose partials',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment-verbose.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2])
      .then(() => {
        //act
        parameter_hunter
          .find_parameters(testPattern, pl)
          .then(() => {
            //assert
            test.equal(
              util.sanitized(testPattern.extendedTemplate),
              util.sanitized(
                '<h1>{{foo}}</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>'
              )
            );
            test.end();
          })
          .catch(test.threw);
      })
      .catch(test.threw);
  }
);

//previous tests were for unquoted parameter keys and single-quoted values.
//test other quoting options.
tap.test(
  'parameter hunter parses parameters with unquoted keys and unquoted values',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template = '{{> test-comment(description: true) }}';
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>{{foo}}</h1><p>true</p>')
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with unquoted keys and double-quoted values',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template = '{{> test-comment(description: "true") }}';
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>{{foo}}</h1><p>true</p>')
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with single-quoted keys and unquoted values',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template = "{{> test-comment('description': true) }}";
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>{{foo}}</h1><p>true</p>')
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with single-quoted keys and single-quoted values wrapping internal escaped single-quotes',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template =
      "{{> test-comment('description': 'true not,\\'true\\'') }}";
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized(`<h1>{{foo}}</h1><p>true not,'true'</p>`)
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with single-quoted keys and double-quoted values wrapping internal single-quotes',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template =
      "{{> test-comment('description': \"true not:'true'\") }}";
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized(`<h1>{{foo}}</h1><p>true not:'true'</p>`)
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with double-unquoted keys and unquoted values',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template = '{{> test-comment("description": true) }}';
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>{{foo}}</h1><p>true</p>')
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with double-quoted keys and single-quoted values wrapping internal double-quotes',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template =
      '{{> test-comment("description": \'true not{"true"\') }}';
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>{{foo}}</h1><p>true not{"true"</p>')
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with double-quoted keys and double-quoted values wrapping internal escaped double-quotes',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template =
      '{{> test-comment("description": "true not}\\"true\\"") }}';
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>{{foo}}</h1><p>true not}"true"</p>')
        );
        test.end();
      });
    });
  }
);

tap.test(
  'parameter hunter parses parameters with combination of quoting schemes for keys and values',
  function (test) {
    //arrange
    const pl = util.fakePatternLab(testPatternsPath);

    var commentPath = path.join('test', 'comment.mustache');
    var commentPattern = loadPattern(commentPath, pl);

    var testPatternPath = path.join('test', 'sticky-comment.mustache');
    var testPattern = loadPattern(testPatternPath, pl);

    //override the file
    testPattern.template =
      '{{> test-comment(description: true, \'foo\': false, "bar": false, \'single\': true, \'singlesingle\': \'true\', \'singledouble\': "true", "double": true, "doublesingle": \'true\', "doubledouble": "true") }}';
    testPattern.extendedTemplate = testPattern.template;
    testPattern.parameteredPartials[0] = testPattern.template;

    var p1 = processIterative(commentPattern, pl);
    var p2 = processIterative(testPattern, pl);

    Promise.all([p1, p2]).then(() => {
      //act
      parameter_hunter.find_parameters(testPattern, pl).then(() => {
        //assert
        test.equal(
          util.sanitized(testPattern.extendedTemplate),
          util.sanitized('<h1>false</h1><p>true</p>')
        );
        test.end();
      });
    });
  }
);

//todo https://github.com/pattern-lab/patternlab-node/issues/673
// tap.test('parameter hunter parses parameters with values containing a closing parenthesis', function (test) {
//   //arrange
//   const pl = util.fakePatternLab(testPatternsPath);

//   var commentPath = path.join('test', 'comment.mustache');
//   var commentPattern = loadPattern(commentPath, pl);

//   var testPatternPath = path.join('test', 'sticky-comment.mustache');
//   var testPattern = loadPattern(testPatternPath, pl);

//   //override the file
//   testPattern.template = "{{> test-comment(description: 'Hello ) World') }}";
//   testPattern.extendedTemplate = testPattern.template;
//   testPattern.parameteredPartials[0] = testPattern.template;

//   var p1 = processIterative(commentPattern, pl);
//   var p2 = processIterative(testPattern, pl);

//   Promise.all([p1, p2]).then(() => {
//     //act
//     parameter_hunter.find_parameters(testPattern, pl).then(() => {
//       //assert
//       test.equal(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>Hello ) World</p>'));
//       test.end();
//     });
//   });
// });

tap.test('parameter hunter skips malformed parameters', function (test) {
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('test', 'comment.mustache');
  var commentPattern = loadPattern(commentPath, pl);

  var testPatternPath = path.join('test', 'sticky-comment.mustache');
  var testPattern = loadPattern(testPatternPath, pl);

  //override the file
  testPattern.template =
    '{{> test-comment( missing-val: , : missing-key, : , , foo: "Hello World") }}';
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      console.log(
        '\nPattern Lab should catch JSON.parse() errors and output useful debugging information...'
      );
      test.equal(
        util.sanitized(testPattern.extendedTemplate),
        util.sanitized('<h1>{{foo}}</h1><p>{{description}}</p>')
      );
      test.end();
    });
  });
});
