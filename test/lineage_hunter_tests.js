"use strict";

var tap = require('tap');

var lh = require('../core/lib/lineage_hunter');
var pa = require('../core/lib/pattern_assembler');
var of = require('../core/lib/object_factory');
var Pattern = require('../core/lib/object_factory').Pattern;

var fs = require('fs-extra');
var path = require('path');
var patterns_dir = './test/files/_patterns/';

var extend = require('util')._extend;
var pattern_assembler = new pa();
var lineage_hunter = new lh();

// fake pattern creators
function createFakeEmptyErrorPattern() {
  return new Pattern(
    patterns_dir,
    '01-molecules/01-toast/00-error.mustache', // relative path now
    null // data
  );
}

function createBasePatternLabObject() {
  var pl = {};
  pl.config = {
    paths: {
      source: {
        patterns: patterns_dir
      }
    },
    outputFileSuffixes: {
      rendered: '.rendered',
      rawTemplate: '',
      markupOnly: '.markup-only'
    },
    patternStateCascade: ["inprogress", "inreview", "complete"]
  };
  pl.data = {};
  pl.data.link = {};
  pl.config.debug = false;
  pl.patterns = [];
  pl.partials = {};

  return pl;
}

tap.test('find_lineage - finds lineage', function (test) {

  //setup current pattern from what we would have during execution
  var currentPattern = new Pattern(
    patterns_dir,
    '02-organisms/00-global/00-header.mustache', // relative path now
    null // data
  );
  extend(currentPattern, {
    "template": "<!-- Begin .header -->\r\n<header class=\"header cf\" role=\"banner\">\r\n\t{{> atoms-logo }}\r\n\t<a href=\"#\" class=\"nav-toggle nav-toggle-search icon-search\"><span class=\"is-vishidden\">Search</span></a>\r\n\t<a href=\"#\" class=\"nav-toggle nav-toggle-menu icon-menu\"><span class=\"is-vishidden\">Menu</span></a>\r\n\t{{> molecules-primary-nav }}\r\n\t{{> molecules-search }}\r\n</header>\r\n<!-- End .header -->\r\n",
    "patternPartialCode": "<!-- Begin .header -->\r\n<header class=\"header cf\" role=\"banner\">\r\n<a href=\"/\"><img src=\"../../images/logo.png\" class=\"logo\" alt=\"Logo Alt Text\" /></a>\t<a href=\"#\" class=\"nav-toggle nav-toggle-search icon-search\"><span class=\"is-vishidden\">Search</span></a>\r\n\t<a href=\"#\" class=\"nav-toggle nav-toggle-menu icon-menu\"><span class=\"is-vishidden\">Menu</span></a>\r\n<nav id=\"nav\" class=\"nav\">\r\n\t<ul>\r\n\t\t<li><a href=\"#\">Home</a></li>\r\n\t\t<li><a href=\"#\">About</a></li>\r\n\t\t<li><a href=\"#\">Blog</a></li>\r\n\t\t<li><a href=\"#\">Contact</a></li>\r\n\t</ul>\r\n</nav><!--end .nav-->\r\n<form action=\"#\" method=\"post\" class=\"inline-form search-form\">           \r\n    <fieldset>\r\n\t    <legend class=\"is-vishidden\">Search</legend>\r\n\t    <label for=\"search-field\" class=\"is-vishidden\">Search</label>\r\n\t    <input type=\"search\" placeholder=\"Search\" id=\"search-field\" class=\"search-field\" />\r\n\t    <button class=\"search-submit\">\r\n\t    \t<span class=\"icon-search\" aria-hidden=\"true\"></span>\r\n\t    \t<span class=\"is-vishidden\">Search</span>\r\n\t    </button>\r\n    </fieldset>\r\n</form></header>\r\n<!-- End .header -->\r\n"
  });

  var patternlab = {
    patterns: [
      Pattern.createEmpty({
        "name": "00-atoms-03-images-00-logo",
        "subdir": "00-atoms\\03-images",
        "filename": "00-logo.mustache",
        "data": null,
        "template": "<a href=\"/\"><img src=\"../../images/logo.png\" class=\"logo\" alt=\"Logo Alt Text\" /></a>",
        "patternPartialCode": "<a href=\"/\"><img src=\"../../images/logo.png\" class=\"logo\" alt=\"Logo Alt Text\" /></a>",
        "patternBaseName": "logo",
        "patternLink": "00-atoms-03-images-00-logo/00-atoms-03-images-00-logo.html",
        "patternGroup": "atoms",
        "patternSubGroup": "atoms\\03-images",
        "flatPatternPath": "00-atoms\\03-images",
        "patternPartial": "atoms-logo",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      }),
      Pattern.createEmpty({
        "name": "01-molecules-05-navigation-00-primary-nav",
        "subdir": "01-molecules\\05-navigation",
        "filename": "00-primary-nav.mustache",
        "data": null,
        "template": "<nav id=\"nav\" class=\"nav\">\r\n\t<ul>\r\n\t\t<li><a href=\"#\">Home</a></li>\r\n\t\t<li><a href=\"#\">About</a></li>\r\n\t\t<li><a href=\"#\">Blog</a></li>\r\n\t\t<li><a href=\"#\">Contact</a></li>\r\n\t</ul>\r\n</nav><!--end .nav-->\r\n",
        "patternPartialCode": "<nav id=\"nav\" class=\"nav\">\r\n\t<ul>\r\n\t\t<li><a href=\"#\">Home</a></li>\r\n\t\t<li><a href=\"#\">About</a></li>\r\n\t\t<li><a href=\"#\">Blog</a></li>\r\n\t\t<li><a href=\"#\">Contact</a></li>\r\n\t</ul>\r\n</nav><!--end .nav-->\r\n",
        "patternBaseName": "primary-nav",
        "patternLink": "01-molecules-05-navigation-00-primary-nav/01-molecules-05-navigation-00-primary-nav.html",
        "patternGroup": "molecules",
        "patternSubGroup": "molecules\\05-navigation",
        "flatPatternPath": "01-molecules\\05-navigation",
        "patternPartial": "molecules-primary-nav",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      }),
      Pattern.createEmpty({
        "name": "01-molecules-04-forms-00-search",
        "subdir": "01-molecules\\04-forms",
        "filename": "00-search.mustache",
        "data": null,
        "template": "<form action=\"#\" method=\"post\" class=\"inline-form search-form\">           \r\n    <fieldset>\r\n\t    <legend class=\"is-vishidden\">Search</legend>\r\n\t    <label for=\"search-field\" class=\"is-vishidden\">Search</label>\r\n\t    <input type=\"search\" placeholder=\"Search\" id=\"search-field\" class=\"search-field\" />\r\n\t    <button class=\"search-submit\">\r\n\t    \t<span class=\"icon-search\" aria-hidden=\"true\"></span>\r\n\t    \t<span class=\"is-vishidden\">Search</span>\r\n\t    </button>\r\n    </fieldset>\r\n</form>",
        "patternPartialCode": "<form action=\"#\" method=\"post\" class=\"inline-form search-form\">           \r\n    <fieldset>\r\n\t    <legend class=\"is-vishidden\">Search</legend>\r\n\t    <label for=\"search-field\" class=\"is-vishidden\">Search</label>\r\n\t    <input type=\"search\" placeholder=\"Search\" id=\"search-field\" class=\"search-field\" />\r\n\t    <button class=\"search-submit\">\r\n\t    \t<span class=\"icon-search\" aria-hidden=\"true\"></span>\r\n\t    \t<span class=\"is-vishidden\">Search</span>\r\n\t    </button>\r\n    </fieldset>\r\n</form>",
        "patternBaseName": "search",
        "patternLink": "01-molecules-04-forms-00-search/01-molecules-04-forms-00-search.html",
        "patternGroup": "molecules",
        "patternSubGroup": "molecules\\04-forms",
        "flatPatternPath": "01-molecules\\04-forms",
        "patternPartial": "molecules-search",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 3);
  test.equals(currentPattern.lineageIndex[0], "atoms-logo");
  test.equals(currentPattern.lineageIndex[1], "molecules-primary-nav");
  test.equals(currentPattern.lineageIndex[2], "molecules-search");

  test.end();
});

tap.test('find_lineage - finds lineage with spaced pattern parameters', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = createFakeEmptyErrorPattern();
  extend(currentPattern, {
    "template": "{{> atoms-error(message: 'That\\'s no moon...') }}",
    "extendedTemplate": "{{> atoms-error(message: 'That\\'s no moon...') }}"
  });

  var patternlab = {
    patterns: [
      Pattern.create(
        patterns_dir,
        '00-atoms/05-alerts/00-error.mustache',
        null,
        {
          "template": "<h1> {{message}} </h1>",
          "extendedTemplate": "<h1> {{message}} </h1>"
        })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 1);
  test.equals(currentPattern.lineageIndex[0], "atoms-error");
  test.equals(patternlab.patterns[0].lineageRIndex.length, 1);
  test.equals(patternlab.patterns[0].lineageR[0].lineagePattern, 'molecules-error');

  test.end();
});

tap.test('cascade_pattern_states promotes a lower pattern state up to the consumer', function (test) {
  //arrange
  var pl = createBasePatternLabObject();

  var atomPattern = new of.Pattern(patterns_dir, '00-test/01-bar.mustache');
  atomPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '00-test/01-bar.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.patternState = "inreview";

  pattern_assembler.addPattern(atomPattern, pl);

  var consumerPattern = new of.Pattern(patterns_dir, '00-test/00-foo.mustache');
  consumerPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '00-test/00-foo.mustache', 'utf8');
  consumerPattern.extendedTemplate = consumerPattern.template;
  consumerPattern.patternState = "complete";
  pattern_assembler.addPattern(consumerPattern, pl);

  lineage_hunter.find_lineage(consumerPattern, pl);

  //act
  lineage_hunter.cascade_pattern_states(pl);

  //assert
  var consumerPatternReturned = pattern_assembler.getPartial('test-foo', pl);
  test.equals(consumerPatternReturned.patternState, 'inreview');
  test.end();
});

tap.test('cascade_pattern_states promotes a lower pattern state up to the consumers lineage', function (test) {
  //arrange
  var pl = createBasePatternLabObject();

  var atomPattern = new of.Pattern(patterns_dir, '00-test/01-bar.mustache');
  atomPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '00-test/01-bar.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.patternState = "inreview";

  pattern_assembler.addPattern(atomPattern, pl);

  var consumerPattern = new of.Pattern(patterns_dir, '00-test/00-foo.mustache');
  consumerPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '00-test/00-foo.mustache', 'utf8');
  consumerPattern.extendedTemplate = consumerPattern.template;
  consumerPattern.patternState = "complete";
  pattern_assembler.addPattern(consumerPattern, pl);

  lineage_hunter.find_lineage(consumerPattern, pl);

  //act
  lineage_hunter.cascade_pattern_states(pl);

  //assert
  var consumerPatternReturned = pattern_assembler.getPartial('test-foo', pl);
  test.equals(consumerPatternReturned.lineage[0].lineageState, 'inreview');
  test.end();
});

tap.test('cascade_pattern_states sets the pattern state on any lineage patterns reverse lineage', function (test) {
  //arrange
  var pl = createBasePatternLabObject();

  var atomPattern = new of.Pattern(patterns_dir, '00-test/01-bar.mustache');
  atomPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '00-test/01-bar.mustache', 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.patternState = "inreview";
  pattern_assembler.addPattern(atomPattern, pl);

  var consumerPattern = new of.Pattern(patterns_dir, '00-test/00-foo.mustache');
  consumerPattern.template = fs.readFileSync(pl.config.paths.source.patterns + '00-test/00-foo.mustache', 'utf8');
  consumerPattern.extendedTemplate = consumerPattern.template;
  consumerPattern.patternState = "complete";
  pattern_assembler.addPattern(consumerPattern, pl);

  lineage_hunter.find_lineage(consumerPattern, pl);

  //act
  lineage_hunter.cascade_pattern_states(pl);

  //assert
  var consumedPatternReturned = pattern_assembler.getPartial('test-bar', pl);
  test.equals(consumedPatternReturned.lineageR[0].lineageState, 'inreview');

  test.end();
});

tap.test('cascade_pattern_states promotes lower pattern state when consumer does not have its own state', function (test) {
  //arrange
  var pl = createBasePatternLabObject();

  var atomPattern = new of.Pattern(patterns_dir, '00-test/01-bar.mustache');
  atomPattern.template = fs.readFileSync(path.resolve(pl.config.paths.source.patterns, '00-test/01-bar.mustache'), 'utf8');
  atomPattern.extendedTemplate = atomPattern.template;
  atomPattern.patternState = "inreview";

  pattern_assembler.addPattern(atomPattern, pl);

  var consumerPattern = new of.Pattern(patterns_dir, '00-test/00-foo.mustache');
  consumerPattern.template = fs.readFileSync(path.resolve(pl.config.paths.source.patterns, '00-test/00-foo.mustache'), 'utf8');
  consumerPattern.extendedTemplate = consumerPattern.template;
  pattern_assembler.addPattern(consumerPattern, pl);

  lineage_hunter.find_lineage(consumerPattern, pl);

  //act
  lineage_hunter.cascade_pattern_states(pl);

  //assert
  var consumerPatternReturned = pattern_assembler.getPartial('test-foo', pl);
  test.equals(consumerPatternReturned.lineage.length, 1);
  test.equals(consumerPatternReturned.lineage[0].lineageState, 'inreview');
  test.equals(consumerPatternReturned.patternState, 'inreview');
  test.end();
});

tap.test('find_lineage - finds lineage with unspaced pattern parameters', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = createFakeEmptyErrorPattern();
  extend(currentPattern, {
    "template": "{{>atoms-error(message: 'That\\'s no moon...')}}",
    "extendedTemplate": "{{>atoms-error(message: 'That\\'s no moon...')}}"
  });

  var patternlab = {
    patterns: [
      Pattern.createEmpty({
        "name": "01-atoms-05-alerts-00-error",
        "subdir": "01-atoms\\05-alerts",
        "filename": "00-error.mustache",
        "data": null,
        "template": "<h1> {{message}} </h1>",
        "extendedTemplate": "<h1> {{message}} </h1>",
        "patternBaseName": "error",
        "patternLink": "01-atoms-05-alerts-00-error/01-atoms-05-alerts-00-error.html",
        "patternGroup": "atoms",
        "patternSubGroup": "atoms\\05-alerts",
        "flatPatternPath": "01-atoms\\05-alerts",
        "patternPartial": "atoms-error",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 1);
  test.equals(currentPattern.lineageIndex[0], "atoms-error");
  test.equals(patternlab.patterns[0].lineageRIndex.length, 1);
  test.equals(patternlab.patterns[0].lineageR[0].lineagePattern, 'molecules-error');

  test.end();
});

tap.test('find_lineage - finds lineage with spaced styleModifier', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = Pattern.createEmpty({
    "name": "01-molecules-01-toast-00-error",
    "subdir": "01-molecules\\01-toast",
    "filename": "00-error.mustache",
    "data": null,
    "template": "{{> atoms-error:foo }}",
    "extendedTemplate": "{{> atoms-error:foo }}",
    "patternBaseName": "error",
    "patternLink": "01-molecules-01-toast-00-error/01-molecules-01-toast-00-error.html",
    "patternGroup": "molecules",
    "patternSubGroup": "molecules\\01-toast",
    "flatPatternPath": "01-molecules\\01-toast",
    "patternPartial": "molecules-error",
    "patternState": "",
    "lineage": [],
    "lineageIndex": [],
    "lineageR": [],
    "lineageRIndex": []
  });
  var patternlab = {
    patterns: [
      Pattern.createEmpty({
        "name": "01-atoms-05-alerts-00-error",
        "subdir": "01-atoms\\05-alerts",
        "filename": "00-error.mustache",
        "data": null,
        "template": "<h1> {{message}} </h1>",
        "extendedTemplate": "<h1> {{message}} </h1>",
        "patternBaseName": "error",
        "patternLink": "01-atoms-05-alerts-00-error/01-atoms-05-alerts-00-error.html",
        "patternGroup": "atoms",
        "patternSubGroup": "atoms\\05-alerts",
        "flatPatternPath": "01-atoms\\05-alerts",
        "patternPartial": "atoms-error",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 1);
  test.equals(currentPattern.lineageIndex[0], "atoms-error");

  test.end();
});

tap.test('find_lineage - finds lineage with unspaced styleModifier', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = Pattern.createEmpty({
    "name": "01-molecules-01-toast-00-error",
    "subdir": "01-molecules\\01-toast",
    "filename": "00-error.mustache",
    "data": null,
    "template": "{{> atoms-error:foo }}",
    "extendedTemplate": "{{>atoms-error:foo}}",
    "patternBaseName": "error",
    "patternLink": "01-molecules-01-toast-00-error/01-molecules-01-toast-00-error.html",
    "patternGroup": "molecules",
    "patternSubGroup": "molecules\\01-toast",
    "flatPatternPath": "01-molecules\\01-toast",
    "patternPartial": "molecules-error",
    "patternState": "",
    "lineage": [],
    "lineageIndex": [],
    "lineageR": [],
    "lineageRIndex": []
  });
  var patternlab = {
    patterns: [
      Pattern.createEmpty({
        "name": "01-atoms-05-alerts-00-error",
        "subdir": "01-atoms\\05-alerts",
        "filename": "00-error.mustache",
        "data": null,
        "template": "<h1> {{message}} </h1>",
        "extendedTemlpate": "<h1> {{message}} </h1>",
        "patternBaseName": "error",
        "patternLink": "01-atoms-05-alerts-00-error/01-atoms-05-alerts-00-error.html",
        "patternGroup": "atoms",
        "patternSubGroup": "atoms\\05-alerts",
        "flatPatternPath": "01-atoms\\05-alerts",
        "patternPartial": "atoms-error",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 1);
  test.equals(currentPattern.lineageIndex[0], "atoms-error");

  test.end();
});

tap.test('find_lineage - finds lineage with fuzzy partial with styleModifier', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = Pattern.createEmpty({
    "name": "01-molecules-01-toast-00-error",
    "subdir": "01-molecules\\01-toast",
    "filename": "00-error.mustache",
    "data": null,
    "template": "{{> atoms-e:foo }}",
    "extendedTemplate": "{{>atoms-e:foo}}",
    "patternBaseName": "error",
    "patternLink": "01-molecules-01-toast-00-error/01-molecules-01-toast-00-error.html",
    "patternGroup": "molecules",
    "patternSubGroup": "molecules\\01-toast",
    "flatPatternPath": "01-molecules\\01-toast",
    "patternPartial": "molecules-error",
    "patternState": "",
    "lineage": [],
    "lineageIndex": [],
    "lineageR": [],
    "lineageRIndex": []
  });
  var patternlab = {
    patterns: [
      Pattern.createEmpty({
        "name": "01-atoms-05-alerts-00-error",
        "subdir": "01-atoms\\05-alerts",
        "filename": "00-error.mustache",
        "data": null,
        "template": "<h1> {{message}} </h1>",
        "extendedTemplate": "<h1> {{message}} </h1>",
        "patternBaseName": "error",
        "patternLink": "01-atoms-05-alerts-00-error/01-atoms-05-alerts-00-error.html",
        "patternGroup": "atoms",
        "patternSubGroup": "atoms\\05-alerts",
        "flatPatternPath": "01-atoms\\05-alerts",
        "patternPartial": "atoms-error",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 1);
  test.equals(currentPattern.lineageIndex[0], "atoms-error");

  test.end();
});

tap.test('find_lineage - does not apply lineage twice', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = createFakeEmptyErrorPattern();
  extend(currentPattern, {
    "template": "{{>atoms-error(message: 'That\\'s no moon...')}}",
    "extendedTemplate": "{{>atoms-error(message: 'That\\'s no moon...')}}"
  });
  var patternlab = {
    patterns: [
      Pattern.createEmpty({
        "name": "01-atoms-05-alerts-00-error",
        "subdir": "01-atoms\\05-alerts",
        "filename": "00-error.mustache",
        "data": null,
        "template": "<h1> {{message}} </h1>",
        "extendedTemplate": "<h1> {{message}} </h1>",
        "patternBaseName": "error",
        "patternLink": "01-atoms-05-alerts-00-error/01-atoms-05-alerts-00-error.html",
        "patternGroup": "atoms",
        "patternSubGroup": "atoms\\05-alerts",
        "flatPatternPath": "01-atoms\\05-alerts",
        "patternPartial": "atoms-error",
        "patternState": "",
        "lineage": [],
        "lineageIndex": [],
        "lineageR": [],
        "lineageRIndex": []
      })
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only'
      }
    }
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equals(currentPattern.lineageIndex.length, 1);
  test.equals(currentPattern.lineageIndex[0], "atoms-error");
  test.equals(patternlab.patterns[0].lineageRIndex.length, 1);
  test.equals(patternlab.patterns[0].lineageR[0].lineagePattern, 'molecules-error');

  test.end();
});
