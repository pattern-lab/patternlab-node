"use strict";

const path = require('path');
const util = require('./util/test_utils.js');
const tap = require('tap');

const pa = require('../core/lib/pattern_assembler');
const ph = require('../core/lib/parameter_hunter');
const processIterative = require('../core/lib/processIterative');

const pattern_assembler = new pa();
const parameter_hunter = new ph();

const config = require('./util/patternlab-config.json');
const engineLoader = require('../core/lib/pattern_engines');
engineLoader.loadAllEngines(config);

const testPatternsPath = path.resolve(__dirname, 'files', '_patterns');

tap.only('parameter hunter finds and extends templates', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>'));
      test.end();
    }).catch(test.threw);
  }).catch(test.threw);
});

tap.test('parameter hunter finds partials with their own parameters and renders them too', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var aPatternPath = path.join('00-test', '539-a.mustache');
  var aPattern = pattern_assembler.load_pattern_iterative(aPatternPath, pl);

  var bPatternPath = path.join('00-test', '539-b.mustache');
  var bPattern = pattern_assembler.load_pattern_iterative(bPatternPath, pl);

  var cPatternPath = path.join('00-test', '539-c.mustache');
  var cPattern = pattern_assembler.load_pattern_iterative(cPatternPath, pl);

  var p1 = processIterative(aPattern, pl);
  var p2 = processIterative(bPattern, pl);
  var p3 = processIterative(cPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(cPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(cPattern.extendedTemplate),
      util.sanitized(`<b>c</b>
  <b>b</b>
  <i>b!</i>
  <b>a</b>
  <i>a!</i>`));
      test.end();
    });
  });
});


tap.only('parameter hunter finds and extends templates with mixed parameter and global data', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath, {
    data: {
      foo: 'Bar',
      description: 'Baz'
    }
  });

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter finds and extends templates with verbose partials', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment-verbose.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter finds and extends templates with fully-pathed partials', function(test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment-full.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>'));
      test.end();
    });
  });
});

//previous tests were for unquoted parameter keys and single-quoted values.
//test other quoting options.
tap.test('parameter hunter parses parameters with unquoted keys and unquoted values', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(description: true) }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true</p>'));
      test.end();
    });
  });
});



tap.test('parameter hunter parses parameters with unquoted keys and double-quoted values', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(description: \"true\") }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter parses parameters with single-quoted keys and unquoted values', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

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
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true</p>'));
      test.end();
    });
  });
});


tap.test('parameter hunter parses parameters with single-quoted keys and single-quoted values wrapping internal escaped single-quotes', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment('description': 'true not,\\'true\\'') }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true not,&#39;true&#39;</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter parses parameters with single-quoted keys and double-quoted values wrapping internal single-quotes', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment('description': \"true not:'true'\") }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true not:&#39;true&#39;</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter parses parameters with double-unquoted keys and unquoted values', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(\"description\": true) }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter parses parameters with double-quoted keys and single-quoted values wrapping internal double-quotes', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(\"description\": 'true not{\"true\"') }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true not{&quot;true&quot;</p>'));
      test.end();
    });
  });
});


tap.test('parameter hunter parses parameters with double-quoted keys and double-quoted values wrapping internal escaped double-quotes', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(\"description\": \"true not}\\\"true\\\"\") }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>true not}&quot;true&quot;</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter parses parameters with combination of quoting schemes for keys and values', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(description: true, 'foo': false, \"bar\": false, 'single': true, 'singlesingle': 'true', 'singledouble': \"true\", \"double\": true, \"doublesingle\": 'true', \"doubledouble\": \"true\") }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1>false</h1><p>true</p>'));
      test.end();
    });
  });
});



tap.test('parameter hunter parses parameters with values containing a closing parenthesis', function (test) {
  //arrange
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment(description: 'Hello ) World') }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p>Hello ) World</p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter skips malformed parameters', function (test) {

  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the file
  testPattern.template = "{{> test-comment( missing-val: , : missing-key, : , , foo: \"Hello World\") }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      console.log('\nPattern Lab should catch JSON.parse() errors and output useful debugging information...');
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<h1></h1><p></p>'));
      test.end();
    });
  });
});

// From issue #145 https://github.com/pattern-lab/patternlab-node/issues/145
tap.test('parameter hunter parses parameters containing html tags', function (test){

  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the commentTemplate - i dont really want to create another file
  pl.patterns[0].template = "<p>{{{ tag1 }}}</p><p>{{{ tag2 }}}</p><p>{{{ tag3 }}}</p>";
  pl.patterns[0].extendedTemplate = pl.patterns[0].template;

  //override the file
  testPattern.template = "{{> test-comment(tag1: '<strong>Single-quoted</strong>', tag2: \"<em>Double-quoted</em>\", tag3: '<strong class=\\\"foo\\\" id=\\\'bar\\\'>With attributes</strong>') }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<p><strong>Single-quoted</strong></p><p><em>Double-quoted</em></p><p><strong class="foo" id=\'bar\'>With attributes</strong></p>'));
      test.end();
    });
  });
});

tap.test('parameter hunter expands links inside parameters', function (test) {
  const pl = util.fakePatternLab(testPatternsPath);

  var commentPath = path.join('00-test', 'comment.mustache');
  var commentPattern = pattern_assembler.load_pattern_iterative(commentPath, pl);

  var testPatternPath = path.join('00-test', 'sticky-comment.mustache');
  var testPattern = pattern_assembler.load_pattern_iterative(testPatternPath, pl);

  //override the commentTemplate - i dont really want to create another file
  pl.patterns[0].template = '<a href="{{{ url }}}">{{ description }}</a>';
  pl.patterns[0].extendedTemplate = pl.patterns[0].template;

  //override the file
  testPattern.template = "{{> test-comment(url: 'link.test-comment', description: 'Link to single comment') }}";
  testPattern.extendedTemplate = testPattern.template;
  testPattern.parameteredPartials[0] = testPattern.template;

  var p1 = processIterative(commentPattern, pl);
  var p2 = processIterative(testPattern, pl);

  Promise.all([p1, p2]).then(() => {
    //act
    parameter_hunter.find_parameters(testPattern, pl).then(() => {
      //assert
      test.equals(util.sanitized(testPattern.extendedTemplate), util.sanitized('<a href="/patterns/00-test-comment/00-test-comment.rendered.html">Link to single comment</a>'));
      test.end();
    });
  });
});
