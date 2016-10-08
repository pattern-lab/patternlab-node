"use strict";

var tap = require('tap');

var ph = require('../core/lib/parameter_hunter');

//setup current pattern from what we would have during execution
function currentPatternClosure() {
  return {
    "relPath": "02-organisms/02-comments/01-sticky-comment.mustache",
    "fileName": "01-sticky-comment",
    "subdir": "02-organisms/02-comments",
    "name": "02-organisms-02-comments-01-sticky-comment",
    "patternBaseName": "sticky-comment",
    "patternLink": "02-organisms-02-comments-01-sticky-comment/02-organisms-02-comments-01-sticky-comment.html",
    "patternGroup": "organisms",
    "patternSubGroup": "comments",
    "flatPatternPath": "02-organisms-02-comments",
    "patternPartial": "organisms-sticky-comment",
    "template": "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
    "extendedTemplate": "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}",
    "parameteredPartials": [
      "{{> molecules-single-comment(description: 'We are all in the gutter, but some of us are looking at the stars.') }}",
      "{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}"
    ]
  };
}

function patternlabClosure() {
  return {
    patterns: [
      {
        "relPath": "01-molecules/06-components/02-single-comment.mustache",
        "fileName": "02-single-comment",
        "subdir": "01-molecules/06-components",
        "name": "01-molecules-06-components-02-single-comment",
        "patternBaseName": "single-comment",
        "patternLink": "01-molecules-06-components-02-single-comment/01-molecules-06-components-02-single-comment.html",
        "patternGroup": "molecules",
        "patternSubGroup": "components",
        "flatPatternPath": "01-molecules-06-components",
        "patternPartial": "molecules-single-comment",
        "template": "<p>{{description}}</p>",
        "extendedTemplate": "<p>{{description}}</p>"
      }
    ],
    config: {
      debug: false
    },
    data: {
      description: 'Not a quote from a smart man'
    },
    partials: {}
  }
};

tap.test('parameter hunter finds and extends templates', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

  test.end();
});

tap.test('parameter hunter finds and extends templates with mixed parameter and global data', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<h1>{{foo}}</h1><p>{{description}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;
  patternlab.data.foo = 'Bar';
  patternlab.data.description = 'Baz';

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

  test.end();
});

tap.test('parameter hunter finds and extends templates with verbose partials', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> 01-molecules/06-components/02-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = "{{> 01-molecules/06-components/02-single-comment(description: 'We are all in the gutter, but some of us are looking at the stars.') }}";
  currentPattern.parameteredPartials[1] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

  test.end();
});

tap.test('parameter hunter finds and extends templates with fully-pathed partials', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = "{{> 01-molecules/06-components/02-single-comment.mustache(description: 'We are all in the gutter, but some of us are looking at the stars.') }}";
  currentPattern.parameteredPartials[1] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

  test.end();
});

//previous tests were for unquoted parameter keys and single-quoted values.
//test other quoting options.
tap.test('parameter hunter parses parameters with unquoted keys and unquoted values', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(description: true) }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with unquoted keys and double-quoted values', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(description: \"true\") }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with single-quoted keys and unquoted values', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment('description': true) }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with single-quoted keys and single-quoted values wrapping internal escaped single-quotes', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment('description': 'true not,\\'true\\'') }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true not,&#39;true&#39;</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with single-quoted keys and double-quoted values wrapping internal single-quotes', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment('description': \"true not:'true'\") }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true not:&#39;true&#39;</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with double-unquoted keys and unquoted values', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(\"description\": true) }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with double-quoted keys and single-quoted values wrapping internal double-quotes', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(\"description\": 'true not{\"true\"') }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true not{&quot;true&quot;</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with double-quoted keys and double-quoted values wrapping internal escaped double-quotes', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(\"description\": \"true not}\\\"true\\\"\") }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true not}&quot;true&quot;</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with combination of quoting schemes for keys and values', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(description: true, 'foo': false, \"bar\": false, 'single': true, 'singlesingle': 'true', 'singledouble': \"true\", \"double\": true, \"doublesingle\": 'true', \"doubledouble\": \"true\") }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p>');

  test.end();
});

tap.test('parameter hunter parses parameters with values containing a closing parenthesis', function(test) {
  // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  currentPattern.template = "{{> molecules-single-comment(description: 'Hello ) World') }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>Hello ) World</p>');

  test.end();
});

tap.test('parameter hunter parses parameters that follow a non-quoted value', function(test) {
  // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<p>{{foo}}</p><p>{{bar}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

  currentPattern.template = "{{> molecules-single-comment(foo: true, bar: \"Hello World\") }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p><p>Hello World</p>');

  test.end();
});

tap.test('parameter hunter parses parameters whose keys contain escaped quotes', function(test) {
  // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<p>{{ silly'key }}</p><p>{{bar}}</p><p>{{ another\"silly-key }}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

  currentPattern.template = "{{> molecules-single-comment('silly\\\'key': true, bar: \"Hello World\", \"another\\\"silly-key\": 42 ) }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p>true</p><p>Hello World</p><p>42</p>');

  test.end();
});

tap.test('parameter hunter skips malformed parameters', function(test) {
  // From issue #291 https://github.com/pattern-lab/patternlab-node/issues/291
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<p>{{foo}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

  currentPattern.abspath = __filename;
  currentPattern.template = "{{> molecules-single-comment( missing-val: , : missing-key, : , , foo: \"Hello World\") }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  console.log('\nPattern Lab should catch JSON.parse() errors and output useful debugging information...');
  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p></p>');

  test.end();
});

tap.test('parameter hunter parses parameters containing html tags', function(test){
  // From issue #145 https://github.com/pattern-lab/patternlab-node/issues/145
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<p>{{{ tag1 }}}</p><p>{{{ tag2 }}}</p><p>{{{ tag3 }}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;

  currentPattern.template = "{{> molecules-single-comment(tag1: '<strong>Single-quoted</strong>', tag2: \"<em>Double-quoted</em>\", tag3: '<strong class=\\\"foo\\\" id=\\\'bar\\\'>With attributes</strong>') }}";
  currentPattern.extendedTemplate = currentPattern.template;
  currentPattern.parameteredPartials[0] = currentPattern.template;

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<p><strong>Single-quoted</strong></p><p><em>Double-quoted</em></p><p><strong class="foo" id=\'bar\'>With attributes</strong></p>');

  test.end();
});
