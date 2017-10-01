"use strict";

var tap = require('tap');
var pa = require('../core/lib/pattern_assembler');
var Pattern = require('../core/lib/object_factory').Pattern;
var CompileState = require('../core/lib/object_factory').CompileState;
var PatternGraph = require('../core/lib/pattern_graph').PatternGraph;

var fs = require('fs-extra');
var util = require('./util/test_utils.js');

var ph = require('../core/lib/parameter_hunter');


//setup current pattern from what we would have during execution
function currentPatternClosure() {
  return {
    "relPath": "02-organisms/02-comments/01-sticky-comment.mustache",
    "fileName": "01-sticky-comment",
    "subdir": "02-organisms/02-comments",
    "verbosePartial": "02-organisms/02-comments/01-sticky-comment",
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
        "verbosePartial": "01-molecules/06-components/02-single-comment",
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
      description: 'Not a quote from a smart man',
      link: {}
    },
    partials: {},
    graph: PatternGraph.empty()
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

tap.test('parameter hunter finds partials with their own parameters and renders them too', function(test) {
  //arrange

  var pattern_assembler = new pa();
  var patterns_dir = './test/files/_patterns/';

  var pl = patternlabClosure();


  var aPattern = new Pattern('00-test/539-a.mustache');
  aPattern.template = fs.readFileSync(patterns_dir + '00-test/539-a.mustache', 'utf8');
  aPattern.extendedTemplate = aPattern.template;
  aPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(aPattern);
  aPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(aPattern);

  var bPattern = new Pattern('00-test/539-b.mustache');
  bPattern.template = fs.readFileSync(patterns_dir + '00-test/539-b.mustache', 'utf8');
  bPattern.extendedTemplate = bPattern.template;
  bPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(bPattern);
  bPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(bPattern);

  var cPattern = new Pattern('00-test/539-c.mustache');
  cPattern.template = fs.readFileSync(patterns_dir + '00-test/539-c.mustache', 'utf8');
  cPattern.extendedTemplate = cPattern.template;
  cPattern.stylePartials = pattern_assembler.find_pattern_partials_with_style_modifiers(cPattern);
  cPattern.parameteredPartials = pattern_assembler.find_pattern_partials_with_parameters(cPattern);

  pattern_assembler.addPattern(aPattern, pl);
  pattern_assembler.addPattern(bPattern, pl);
  pattern_assembler.addPattern(cPattern, pl);

  var currentPattern = cPattern;
  var parameter_hunter = new ph();

  //act
  parameter_hunter.find_parameters(currentPattern, pl);

  //assert
  test.equals(util.sanitized(currentPattern.extendedTemplate),
    util.sanitized(`<b>c</b>
<b>b</b>
<i>b!</i>
<b>a</b>
<i>a!</i>`));
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

tap.test('parameter hunter finds and extends templates with mixed template and parameter data', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<h1>{{foo}}</h1><p>{{description}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;
  currentPattern.jsonFileData = {foo: 'Bar'};

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

  test.end();
});

tap.test('parameter hunter finds and extends templates with mixed included template and parameter data', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<h1>{{foo}}</h1><p>{{description}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;
  patternlab.patterns[0].jsonFileData = {foo: 'Bar'};

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

  test.end();
});

tap.test('parameter hunter finds and extends templates with mixed data. Data weights from weakest to strongest: global data < includee data < includer data < parameter data', function(test) {
  var currentPattern = currentPatternClosure();
  var patternlab = patternlabClosure();
  var parameter_hunter = new ph();

  patternlab.patterns[0].template = "<h1>{{h1Text}}</h1><h2>{{h2Text}}</h2><h3>{{h3Text}}</h3><p>{{description}}</p>";
  patternlab.patterns[0].extendedTemplate = patternlab.patterns[0].template;
    
  patternlab.data.h1Text = 'globalH1';
  patternlab.data.h2Text = 'globalH2';
  patternlab.data.h3Text = 'globalH3';
  patternlab.data.description = 'globalDescription';
  
  patternlab.patterns[0].jsonFileData = {
      h2Text: 'includeeH2',
      h3Text: 'includeeH3',
      h4Text: 'includeeH4',
      description: 'includeeDescription'
  };
  
  currentPattern.jsonFileData = {
      h3Text: 'includerH3',
      h4Text: 'includerH4',
      description: 'includerDescription'
  };

  parameter_hunter.find_parameters(currentPattern, patternlab);
  test.equals(currentPattern.extendedTemplate, '<h1>globalH1</h1><h2>includeeH2</h2><h3>includerH3</h3><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>');

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
