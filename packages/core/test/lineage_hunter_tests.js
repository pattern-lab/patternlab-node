'use strict';

const tap = require('tap');
const fs = require('fs-extra');
const path = require('path');
const extend = require('util')._extend;

const lh = require('../src/lib/lineage_hunter');
const loadPattern = require('../src/lib/loadPattern');
const of = require('../src/lib/object_factory');
const Pattern = require('../src/lib/object_factory').Pattern;
const PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
const config = require('./util/patternlab-config.json');
const addPattern = require('../src/lib/addPattern');
const getPartial = require('../src/lib/get');

const engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

const lineage_hunter = new lh();

// fake pattern creators
function createFakeEmptyErrorPattern() {
  return new Pattern(
    'molecules/toast/error.mustache', // relative path now
    null // data
  );
}

function createBasePatternLabObject() {
  var patterns_dir = `${__dirname}/files/_patterns/`;
  var pl = {};
  (pl.graph = PatternGraph.empty()),
    (pl.config = {
      paths: {
        source: {
          patterns: patterns_dir,
        },
        public: {
          patterns: `${__dirname}/public/_patterns`,
        },
      },
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only',
      },
      patternStateCascade: ['inprogress', 'inreview', 'complete'],
    });
  pl.data = {};
  pl.data.link = {};
  pl.config.logLevel = 'quiet';
  pl.patterns = [];
  pl.partials = {};
  pl.patternGroups = {};
  pl.subgroupPatterns = {};

  return pl;
}

tap.test('find_lineage - finds lineage', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = new Pattern(
    'organisms/global/header.mustache', // relative path now
    null // data
  );
  extend(currentPattern, {
    template:
      '<!-- Begin .header -->\r\n<header class="header cf" role="banner">\r\n\t{{> atoms-logo }}\r\n\t<a href="#" class="nav-toggle nav-toggle-search icon-search"><span class="is-vishidden">Search</span></a>\r\n\t<a href="#" class="nav-toggle nav-toggle-menu icon-menu"><span class="is-vishidden">Menu</span></a>\r\n\t{{> molecules-primary-nav }}\r\n\t{{> molecules-search }}\r\n</header>\r\n<!-- End .header -->\r\n',
    patternPartialCode:
      '<!-- Begin .header -->\r\n<header class="header cf" role="banner">\r\n<a href="/"><img src="../../images/logo.png" class="logo" alt="Logo Alt Text" /></a>\t<a href="#" class="nav-toggle nav-toggle-search icon-search"><span class="is-vishidden">Search</span></a>\r\n\t<a href="#" class="nav-toggle nav-toggle-menu icon-menu"><span class="is-vishidden">Menu</span></a>\r\n<nav id="nav" class="nav">\r\n\t<ul>\r\n\t\t<li><a href="#">Home</a></li>\r\n\t\t<li><a href="#">About</a></li>\r\n\t\t<li><a href="#">Blog</a></li>\r\n\t\t<li><a href="#">Contact</a></li>\r\n\t</ul>\r\n</nav><!--end .nav-->\r\n<form action="#" method="post" class="inline-form search-form">           \r\n    <fieldset>\r\n\t    <legend class="is-vishidden">Search</legend>\r\n\t    <label for="search-field" class="is-vishidden">Search</label>\r\n\t    <input type="search" placeholder="Search" id="search-field" class="search-field" />\r\n\t    <button class="search-submit" type="submit">\r\n\t    \t<span class="icon-search" aria-hidden="true"></span>\r\n\t    \t<span class="is-vishidden">Search</span>\r\n\t    </button>\r\n    </fieldset>\r\n</form></header>\r\n<!-- End .header -->\r\n',
  });

  var patternlab = {
    graph: new PatternGraph(null, 0),
    patterns: [
      Pattern.createEmpty({
        name: 'atoms-images-logo',
        subdir: 'atoms\\images',
        filename: 'logo.mustache',
        data: null,
        template:
          '<a href="/"><img src="../../images/logo.png" class="logo" alt="Logo Alt Text" /></a>',
        patternPartialCode:
          '<a href="/"><img src="../../images/logo.png" class="logo" alt="Logo Alt Text" /></a>',
        patternBaseName: 'logo',
        patternLink: 'atoms-images-logo/atoms-images-logo.html',
        patternGroup: 'atoms',
        patternSubgroup: 'atoms\\images',
        flatPatternPath: 'atoms\\images',
        patternPartial: 'atoms-logo',
        patternState: '',
        lineage: [],
        lineageIndex: [],
        lineageR: [],
        lineageRIndex: [],
      }),
      Pattern.createEmpty({
        name: 'molecules-navigation-primary-nav',
        subdir: 'molecules\\navigation',
        filename: 'primary-nav.mustache',
        data: null,
        template:
          '<nav id="nav" class="nav">\r\n\t<ul>\r\n\t\t<li><a href="#">Home</a></li>\r\n\t\t<li><a href="#">About</a></li>\r\n\t\t<li><a href="#">Blog</a></li>\r\n\t\t<li><a href="#">Contact</a></li>\r\n\t</ul>\r\n</nav><!--end .nav-->\r\n',
        patternPartialCode:
          '<nav id="nav" class="nav">\r\n\t<ul>\r\n\t\t<li><a href="#">Home</a></li>\r\n\t\t<li><a href="#">About</a></li>\r\n\t\t<li><a href="#">Blog</a></li>\r\n\t\t<li><a href="#">Contact</a></li>\r\n\t</ul>\r\n</nav><!--end .nav-->\r\n',
        patternBaseName: 'primary-nav',
        patternLink:
          'molecules-navigation-primary-nav/molecules-navigation-primary-nav.html',
        patternGroup: 'molecules',
        patternSubgroup: 'molecules\\navigation',
        flatPatternPath: 'molecules\\navigation',
        patternPartial: 'molecules-primary-nav',
        patternState: '',
        lineage: [],
        lineageIndex: [],
        lineageR: [],
        lineageRIndex: [],
      }),
      Pattern.createEmpty({
        name: 'molecules-forms-search',
        subdir: 'molecules\\forms',
        filename: 'search.mustache',
        data: null,
        template:
          '<form action="#" method="post" class="inline-form search-form">           \r\n    <fieldset>\r\n\t    <legend class="is-vishidden">Search</legend>\r\n\t    <label for="search-field" class="is-vishidden">Search</label>\r\n\t    <input type="search" placeholder="Search" id="search-field" class="search-field" />\r\n\t    <button class="search-submit" type="submit">\r\n\t    \t<span class="icon-search" aria-hidden="true"></span>\r\n\t    \t<span class="is-vishidden">Search</span>\r\n\t    </button>\r\n    </fieldset>\r\n</form>',
        patternPartialCode:
          '<form action="#" method="post" class="inline-form search-form">           \r\n    <fieldset>\r\n\t    <legend class="is-vishidden">Search</legend>\r\n\t    <label for="search-field" class="is-vishidden">Search</label>\r\n\t    <input type="search" placeholder="Search" id="search-field" class="search-field" />\r\n\t    <button class="search-submit" type="submit">\r\n\t    \t<span class="icon-search" aria-hidden="true"></span>\r\n\t    \t<span class="is-vishidden">Search</span>\r\n\t    </button>\r\n    </fieldset>\r\n</form>',
        patternBaseName: 'search',
        patternLink: 'molecules-forms-search/molecules-forms-search.html',
        patternGroup: 'molecules',
        patternSubgroup: 'molecules\\forms',
        flatPatternPath: 'molecules\\forms',
        patternPartial: 'molecules-search',
        patternState: '',
        lineage: [],
        lineageIndex: [],
        lineageR: [],
        lineageRIndex: [],
      }),
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only',
      },
    },
  };
  // BAD: This "patches" the relative path which is unset when using "createEmpty"
  patternlab.patterns.forEach((p) => (p.relPath = p.patternLink));

  lineage_hunter.find_lineage(currentPattern, patternlab);

  var graphLineageIndex = patternlab.graph.lineageIndex(currentPattern);

  // Ensure compatibility
  for (let i of [currentPattern.lineageIndex, graphLineageIndex]) {
    test.equal(i.length, 3);
    test.equal(i[0], 'atoms-logo');
    test.equal(i[1], 'molecules-primary-nav');
    test.equal(i[2], 'molecules-search');
  }

  test.end();
});

tap.test(
  'find_lineage - finds lineage with spaced pattern parameters',
  function (test) {
    //setup current pattern from what we would have during execution
    var currentPattern = createFakeEmptyErrorPattern();
    extend(currentPattern, {
      template: "{{> atoms-error(message: 'That\\'s no moon...') }}",
      extendedTemplate: "{{> atoms-error(message: 'That\\'s no moon...') }}",
    });

    var patternlab = {
      graph: new PatternGraph(null, 0),
      patterns: [
        Pattern.create('atoms/alerts/error.mustache', null, {
          template: '<h1> {{message}} </h1>',
          extendedTemplate: '<h1> {{message}} </h1>',
        }),
      ],
      config: {
        outputFileSuffixes: {
          rendered: '.rendered',
          rawTemplate: '',
          markupOnly: '.markup-only',
        },
      },
    };

    lineage_hunter.find_lineage(currentPattern, patternlab);

    test.equal(currentPattern.lineageIndex.length, 1);
    test.equal(currentPattern.lineageIndex[0], 'atoms-error');
    test.equal(patternlab.patterns[0].lineageRIndex.length, 1);
    test.equal(
      patternlab.patterns[0].lineageR[0].lineagePattern,
      'molecules-error'
    );

    // Same as above, but as graph based variant
    var graph = patternlab.graph;
    // Test if there is an edge from molecule-toast-error to atoms-alerts-error
    test.same(
      graph.hasLink(currentPattern, patternlab.patterns[0]),
      true,
      'There is an edge from the test-error molecule to the alerts-error atom'
    );
    var currentPatternLineageIndex = graph.lineageIndex(currentPattern);

    test.equal(currentPatternLineageIndex.length, 1);
    test.equal(currentPatternLineageIndex[0], 'atoms-error');

    var patternlabPattern0_lineageRIndex = graph.lineageRIndex(
      patternlab.patterns[0]
    );
    test.equal(patternlabPattern0_lineageRIndex.length, 1);
    test.equal(patternlabPattern0_lineageRIndex[0], 'molecules-error');

    test.end();
  }
);

tap.test(
  'cascade_pattern_states promotes a lower pattern state up to the consumer',
  function (test) {
    //arrange
    var pl = createBasePatternLabObject();

    var atomPattern = new of.Pattern('test/bar.mustache');
    atomPattern.template = fs.readFileSync(
      pl.config.paths.source.patterns + 'test/bar.mustache',
      'utf8'
    );
    atomPattern.extendedTemplate = atomPattern.template;
    atomPattern.patternState = 'inreview';

    addPattern(atomPattern, pl);

    var consumerPattern = new of.Pattern('test/foo.mustache');
    consumerPattern.template = fs.readFileSync(
      pl.config.paths.source.patterns + 'test/foo.mustache',
      'utf8'
    );
    consumerPattern.extendedTemplate = consumerPattern.template;
    consumerPattern.patternState = 'complete';
    addPattern(consumerPattern, pl);

    lineage_hunter.find_lineage(consumerPattern, pl);

    //act
    lineage_hunter.cascade_pattern_states(pl);

    //assert
    var consumerPatternReturned = getPartial('test-foo', pl);
    test.equal(consumerPatternReturned.patternState, 'inreview');
    test.end();
  }
);

tap.test(
  'cascade_pattern_states promotes a lower pattern state up to the consumers lineage',
  function (test) {
    //arrange
    var pl = createBasePatternLabObject();

    var atomPattern = new of.Pattern('test/bar.mustache');
    atomPattern.template = fs.readFileSync(
      pl.config.paths.source.patterns + 'test/bar.mustache',
      'utf8'
    );
    atomPattern.extendedTemplate = atomPattern.template;
    atomPattern.patternState = 'inreview';

    addPattern(atomPattern, pl);

    var consumerPattern = new of.Pattern('test/foo.mustache');
    consumerPattern.template = fs.readFileSync(
      pl.config.paths.source.patterns + 'test/foo.mustache',
      'utf8'
    );
    consumerPattern.extendedTemplate = consumerPattern.template;
    consumerPattern.patternState = 'complete';
    addPattern(consumerPattern, pl);

    lineage_hunter.find_lineage(consumerPattern, pl);

    //act
    lineage_hunter.cascade_pattern_states(pl);

    //assert
    var consumerPatternReturned = getPartial('test-foo', pl);
    const lineage = pl.graph.lineage(consumerPatternReturned);
    test.equal(lineage[0].lineageState, 'inreview');
    test.end();
  }
);

tap.test(
  'cascade_pattern_states sets the pattern state on any lineage patterns reverse lineage',
  function (test) {
    //arrange
    var pl = createBasePatternLabObject();

    var atomPattern = loadPattern('test/bar.mustache', pl);
    var consumerPattern = loadPattern('test/foo.mustache', pl);

    lineage_hunter.find_lineage(consumerPattern, pl);

    //act
    lineage_hunter.cascade_pattern_states(pl);

    //assert
    var consumedPatternReturned = getPartial('test-bar', pl);
    let lineageR = pl.graph.lineageR(consumedPatternReturned);
    test.equal(lineageR[0].lineageState, 'inreview');

    test.end();
  }
);

tap.test(
  'cascade_pattern_states promotes lower pattern state when consumer does not have its own state',
  function (test) {
    //arrange
    var pl = createBasePatternLabObject();

    var atomPattern = new of.Pattern('test/bar.mustache');
    atomPattern.template = fs.readFileSync(
      path.resolve(pl.config.paths.source.patterns, 'test/bar.mustache'),
      'utf8'
    );
    atomPattern.extendedTemplate = atomPattern.template;
    atomPattern.patternState = 'inreview';

    addPattern(atomPattern, pl);

    var consumerPattern = new of.Pattern('test/foo.mustache');
    consumerPattern.template = fs.readFileSync(
      path.resolve(pl.config.paths.source.patterns, 'test/foo.mustache'),
      'utf8'
    );
    consumerPattern.extendedTemplate = consumerPattern.template;
    addPattern(consumerPattern, pl);

    lineage_hunter.find_lineage(consumerPattern, pl);

    //act
    lineage_hunter.cascade_pattern_states(pl);

    //assert
    var consumerPatternReturned = getPartial('test-foo', pl);
    test.equal(consumerPatternReturned.lineage.length, 1);
    test.equal(consumerPatternReturned.lineage[0].lineageState, 'inreview');
    test.equal(consumerPatternReturned.patternState, 'inreview');
    test.end();
  }
);

tap.test(
  'find_lineage - finds lineage with unspaced pattern parameters',
  function (test) {
    //setup current pattern from what we would have during execution
    var currentPattern = createFakeEmptyErrorPattern();
    extend(currentPattern, {
      template: "{{>atoms-error(message: 'That\\'s no moon...')}}",
      extendedTemplate: "{{>atoms-error(message: 'That\\'s no moon...')}}",
    });

    var patternlab = {
      graph: PatternGraph.empty(),
      patterns: [
        Pattern.createEmpty({
          name: 'atoms-alerts-error',
          subdir: 'atoms\\alerts',
          filename: 'error.mustache',
          data: null,
          template: '<h1> {{message}} </h1>',
          extendedTemplate: '<h1> {{message}} </h1>',
          patternBaseName: 'error',
          patternLink: 'atoms-alerts-error/atoms-alerts-error.html',
          patternGroup: 'atoms',
          patternSubgroup: 'atoms\\alerts',
          flatPatternPath: 'atoms\\alerts',
          patternPartial: 'atoms-error',
          patternState: '',
          lineage: [],
          currentPatternLineageIndex: [],
          lineageR: [],
          lineageRIndex: [],
        }),
      ],
      config: {
        outputFileSuffixes: {
          rendered: '.rendered',
          rawTemplate: '',
          markupOnly: '.markup-only',
        },
      },
    };

    lineage_hunter.find_lineage(currentPattern, patternlab);

    test.equal(currentPattern.lineageIndex.length, 1);
    test.equal(currentPattern.lineageIndex[0], 'atoms-error');
    test.equal(patternlab.patterns[0].lineageRIndex.length, 1);
    test.equal(
      patternlab.patterns[0].lineageR[0].lineagePattern,
      'molecules-error'
    );

    var currentPatternLineageIndex = patternlab.graph.lineageIndex(
      currentPattern
    );
    test.equal(currentPatternLineageIndex.length, 1);
    test.equal(currentPatternLineageIndex[0], 'atoms-error');

    var pattern0LineageRIndex = patternlab.graph.lineageRIndex(
      patternlab.patterns[0]
    );
    test.equal(pattern0LineageRIndex.length, 1);
    test.equal(pattern0LineageRIndex[0], 'molecules-error');

    test.end();
  }
);

tap.test(
  'find_lineage - finds lineage with spaced styleModifier',
  function (test) {
    //setup current pattern from what we would have during execution
    var currentPattern = Pattern.createEmpty({
      name: 'molecules-toast-error',
      subdir: 'molecules\\toast',
      filename: 'error.mustache',
      data: null,
      template: '{{> atoms-error:foo }}',
      extendedTemplate: '{{> atoms-error:foo }}',
      patternBaseName: 'error',
      patternLink: 'molecules-toast-error/molecules-toast-error.html',
      patternGroup: 'molecules',
      patternSubgroup: 'molecules\\toast',
      flatPatternPath: 'molecules\\toast',
      patternPartial: 'molecules-error',
      patternState: '',
      lineage: [],
      lineageIndex: [],
      lineageR: [],
      lineageRIndex: [],
    });
    var patternlab = {
      graph: new PatternGraph(null, 0),
      patterns: [
        Pattern.createEmpty({
          name: 'atoms-alerts-error',
          subdir: 'atoms\\alerts',
          filename: 'error.mustache',
          data: null,
          template: '<h1> {{message}} </h1>',
          extendedTemplate: '<h1> {{message}} </h1>',
          patternBaseName: 'error',
          patternLink: 'atoms-alerts-error/atoms-alerts-error.html',
          patternGroup: 'atoms',
          patternSubgroup: 'atoms\\alerts',
          flatPatternPath: 'atoms\\alerts',
          patternPartial: 'atoms-error',
          patternState: '',
          lineage: [],
          lineageIndex: [],
          lineageR: [],
          lineageRIndex: [],
        }),
      ],
      config: {
        outputFileSuffixes: {
          rendered: '.rendered',
          rawTemplate: '',
          markupOnly: '.markup-only',
        },
      },
    };

    lineage_hunter.find_lineage(currentPattern, patternlab);

    test.equal(currentPattern.lineageIndex.length, 1);
    test.equal(currentPattern.lineageIndex[0], 'atoms-error');

    test.end();
  }
);

tap.test(
  'find_lineage - finds lineage with unspaced styleModifier',
  function (test) {
    //setup current pattern from what we would have during execution
    var currentPattern = Pattern.createEmpty({
      name: 'molecules-toast-error',
      subdir: 'molecules\\toast',
      filename: 'error.mustache',
      data: null,
      template: '{{> atoms-error:foo }}',
      extendedTemplate: '{{>atoms-error:foo}}',
      patternBaseName: 'error',
      patternLink: 'molecules-toast-error/molecules-toast-error.html',
      patternGroup: 'molecules',
      patternSubgroup: 'molecules\\toast',
      flatPatternPath: 'molecules\\toast',
      patternPartial: 'molecules-error',
      patternState: '',
      lineage: [],
      lineageIndex: [],
      lineageR: [],
      lineageRIndex: [],
    });
    var patternlab = {
      graph: PatternGraph.empty(),
      patterns: [
        Pattern.createEmpty({
          name: 'atoms-alerts-error',
          subdir: 'atoms\\alerts',
          filename: 'error.mustache',
          data: null,
          template: '<h1> {{message}} </h1>',
          extendedTemlpate: '<h1> {{message}} </h1>',
          patternBaseName: 'error',
          patternLink: 'atoms-alerts-error/atoms-alerts-error.html',
          patternGroup: 'atoms',
          patternSubgroup: 'atoms\\alerts',
          flatPatternPath: 'atoms\\alerts',
          patternPartial: 'atoms-error',
          patternState: '',
          lineage: [],
          lineageIndex: [],
          lineageR: [],
          lineageRIndex: [],
        }),
      ],
      config: {
        outputFileSuffixes: {
          rendered: '.rendered',
          rawTemplate: '',
          markupOnly: '.markup-only',
        },
      },
    };

    lineage_hunter.find_lineage(currentPattern, patternlab);

    test.equal(currentPattern.lineageIndex.length, 1);
    test.equal(currentPattern.lineageIndex[0], 'atoms-error');

    test.end();
  }
);

tap.test(
  'find_lineage - finds lineage with fuzzy partial with styleModifier',
  function (test) {
    //setup current pattern from what we would have during execution
    var currentPattern = Pattern.createEmpty({
      name: 'molecules-toast-error',
      subdir: 'molecules\\toast',
      filename: 'error.mustache',
      data: null,
      template: '{{> atoms-e:foo }}',
      extendedTemplate: '{{>atoms-e:foo}}',
      patternBaseName: 'error',
      patternLink: 'molecules-toast-error/molecules-toast-error.html',
      patternGroup: 'molecules',
      patternSubgroup: 'molecules\\toast',
      flatPatternPath: 'molecules\\toast',
      patternPartial: 'molecules-error',
      patternState: '',
      lineage: [],
      lineageIndex: [],
      lineageR: [],
      lineageRIndex: [],
    });
    var patternlab = {
      graph: PatternGraph.empty(),
      patterns: [
        Pattern.createEmpty({
          name: 'atoms-alerts-error',
          subdir: 'atoms\\alerts',
          filename: 'error.mustache',
          data: null,
          template: '<h1> {{message}} </h1>',
          extendedTemplate: '<h1> {{message}} </h1>',
          patternBaseName: 'error',
          patternLink: 'atoms-alerts-error/atoms-alerts-error.html',
          patternGroup: 'atoms',
          patternSubgroup: 'atoms\\alerts',
          flatPatternPath: 'atoms\\alerts',
          patternPartial: 'atoms-error',
          patternState: '',
          lineage: [],
          lineageIndex: [],
          lineageR: [],
          lineageRIndex: [],
        }),
      ],
      config: {
        outputFileSuffixes: {
          rendered: '.rendered',
          rawTemplate: '',
          markupOnly: '.markup-only',
        },
      },
    };

    var lineage_hunter = new lh();
    lineage_hunter.find_lineage(currentPattern, patternlab);

    test.equal(currentPattern.lineageIndex.length, 1);
    test.equal(currentPattern.lineageIndex[0], 'atoms-error');

    test.end();
  }
);

tap.test('find_lineage - does not apply lineage twice', function (test) {
  //setup current pattern from what we would have during execution
  var currentPattern = createFakeEmptyErrorPattern();
  extend(currentPattern, {
    template: "{{>atoms-error(message: 'That\\'s no moon...')}}",
    extendedTemplate: "{{>atoms-error(message: 'That\\'s no moon...')}}",
  });
  var patternlab = {
    graph: PatternGraph.empty(),
    patterns: [
      Pattern.createEmpty({
        name: 'atoms-alerts-error',
        subdir: 'atoms\\alerts',
        filename: 'error.mustache',
        data: null,
        template: '<h1> {{message}} </h1>',
        extendedTemplate: '<h1> {{message}} </h1>',
        patternBaseName: 'error',
        patternLink: 'atoms-alerts-error/atoms-alerts-error.html',
        patternGroup: 'atoms',
        patternSubgroup: 'atoms\\alerts',
        flatPatternPath: 'atoms\\alerts',
        patternPartial: 'atoms-error',
        patternState: '',
        lineage: [],
        lineageIndex: [],
        lineageR: [],
        lineageRIndex: [],
      }),
    ],
    config: {
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only',
      },
    },
  };

  var lineage_hunter = new lh();
  lineage_hunter.find_lineage(currentPattern, patternlab);
  lineage_hunter.find_lineage(currentPattern, patternlab);

  test.equal(currentPattern.lineageIndex.length, 1);
  test.equal(currentPattern.lineageIndex[0], 'atoms-error');
  test.equal(patternlab.patterns[0].lineageRIndex.length, 1);
  test.equal(
    patternlab.patterns[0].lineageR[0].lineagePattern,
    'molecules-error'
  );

  var graph = patternlab.graph;

  var currentPatternLineageIndex = graph.lineageIndex(currentPattern);
  test.equal(currentPatternLineageIndex.length, 1);
  test.equal(currentPatternLineageIndex[0], 'atoms-error');
  var patternZeroLineageR = graph.lineageR(patternlab.patterns[0]);
  test.equal(patternZeroLineageR.length, 1);
  test.equal(patternZeroLineageR[0].patternPartial, 'molecules-error');

  test.end();
});
