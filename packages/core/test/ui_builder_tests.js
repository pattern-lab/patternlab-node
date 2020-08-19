'use strict';

var tap = require('tap');
var rewire = require('rewire');
var _ = require('lodash');
var eol = require('os').EOL;
var Pattern = require('../src/lib/object_factory').Pattern;
var extend = require('util')._extend;
var uiModule = rewire('../src/lib/ui_builder');
var path = require('path');
var config = require('./util/patternlab-config.json');

var engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

//set up a global mocks - we don't want to be writing/rendering any files right now
var fsMock = {
  outputFileSync: function(path, data, cb) {},
  outputFile: function(path, data, cb) {},
};

var renderMock = function(template, data, partials) {
  return Promise.resolve('');
};
var buildFooterMock = function(patternlab, patternPartial) {
  return Promise.resolve('');
};

//set our mocks in place of usual require()
uiModule.__set__({
  fs: fsMock,
  render: renderMock,
  buildFooter: buildFooterMock,
});

const uikit = {
  name: 'uikit-workshop',
  modulePath: '',
  outputDir: 'test/output',
  excludedPatternStates: [],
};

var ui = uiModule();

function createFakePatternLab(customProps) {
  var pl = {
    config: {
      paths: {
        source: {
          patterns: './test/files/_patterns',
        },
        public: {
          patterns: '',
        },
      },
      styleGuideExcludes: ['templates'],
      logLevel: 'quiet',
      outputFileSuffixes: {
        rendered: '.rendered',
        rawTemplate: '',
        markupOnly: '.markup-only',
      },
    },
    data: {},
    uikits: [uikit],
  };
  return extend(pl, customProps);
}

tap.test(
  'isPatternExcluded - returns true when pattern filename starts with underscore',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({});
    var pattern = new Pattern('00-test/_ignored-pattern.mustache');

    //act
    var result = ui.isPatternExcluded(pattern, patternlab, uikit);

    //assert
    test.equals(result, true);
    test.end();
  }
);

tap.test(
  'isPatternExcluded - returns true when pattern is defaultPattern',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({});
    var pattern = new Pattern('00-test/foo.mustache');
    patternlab.config.defaultPattern = 'test-foo';

    //act
    var result = ui.isPatternExcluded(pattern, patternlab, uikit);

    //assert
    test.equals(result, true);
    test.end();
  }
);

tap.test(
  'isPatternExcluded - returns true when pattern within underscored directory - top level',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({});
    var pattern = Pattern.createEmpty({
      relPath:
        path.sep +
        '_hidden' +
        path.sep +
        'patternSubgroup' +
        path.sep +
        'foo.mustache',
      isPattern: true,
      fileName: 'foo.mustache',
      patternPartial: 'hidden-foo',
    });

    //act
    var result = ui.isPatternExcluded(pattern, patternlab, uikit);

    //assert
    test.equals(result, true);
    test.end();
  }
);

tap.test(
  'isPatternExcluded - returns true when pattern within underscored directory - subgroup level',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({});
    var pattern = Pattern.createEmpty({
      relPath:
        'shown' + path.sep + '_patternSubgroup' + path.sep + 'foo.mustache',
      isPattern: true,
      fileName: 'foo.mustache',
      patternPartial: 'shown-foo',
    });

    //act
    var result = ui.isPatternExcluded(pattern, patternlab, uikit);

    //assert
    test.equals(result, true);
    test.end();
  }
);

tap.test(
  'isPatternExcluded - returns true when pattern state found withing uikit exclusions',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({});
    var pattern = Pattern.createEmpty({
      relPath:
        'shown' + path.sep + '_patternSubgroup' + path.sep + 'foo.mustache',
      isPattern: true,
      fileName: 'foo.mustache',
      patternPartial: 'shown-foo',
      patternState: 'complete',
    });

    //act
    var result = ui.isPatternExcluded(pattern, patternlab, {
      excludedPatternStates: 'complete',
    });

    //assert
    test.equals(result, true);
    test.end();
  }
);

tap.test('groupPatterns - creates pattern groups correctly', function(test) {
  //arrange
  var patternlab = createFakePatternLab({
    patterns: [],
    patternGroups: {},
    subgroupPatterns: {},
  });

  patternlab.patterns.push(
    new Pattern('foobar.mustache'),
    new Pattern('00-test/bar.mustache'),
    new Pattern('00-test/foo.mustache'),
    new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
    new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
    new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
    new Pattern('patternGroup1/patternSubgroup2/black.mustache'),
    new Pattern('patternGroup1/patternSubgroup2/grey.mustache'),
    new Pattern('patternGroup1/patternSubgroup2/white.mustache')
  );
  ui.resetUIBuilderState(patternlab);

  //act
  var result = ui.groupPatterns(patternlab, uikit);

  test.equals(
    result.patternGroups.patternGroup1.patternSubgroup1.blue.patternPartial,
    'patternGroup1-blue'
  );
  test.equals(
    result.patternGroups.patternGroup1.patternSubgroup1.red.patternPartial,
    'patternGroup1-red'
  );
  test.equals(
    result.patternGroups.patternGroup1.patternSubgroup1.yellow.patternPartial,
    'patternGroup1-yellow'
  );
  test.equals(
    result.patternGroups.patternGroup1.patternSubgroup2.black.patternPartial,
    'patternGroup1-black'
  );
  test.equals(
    result.patternGroups.patternGroup1.patternSubgroup2.grey.patternPartial,
    'patternGroup1-grey'
  );
  test.equals(
    result.patternGroups.patternGroup1.patternSubgroup2.white.patternPartial,
    'patternGroup1-white'
  );

  // Flat patterns
  test.equals(
    patternlab.patternGroups[0].patternItems[0].patternPartial,
    'root-foobar',
    'flat pattern foobar on root'
  );
  test.equals(
    patternlab.patternGroups[1].patternItems[0].patternPartial,
    'test-bar',
    'first pattern item should be test-bar'
  );
  test.equals(
    patternlab.patternGroups[1].patternItems[1].patternPartial,
    'test-foo',
    'second pattern item should be test-foo'
  );

  //todo: patternlab.patternGroups[0].patternItems[1] looks malformed

  test.end();
});

tap.test('groupPatterns - orders patterns when provided from md', function(
  test
) {
  //arrange
  var patternlab = createFakePatternLab({
    patterns: [],
    patternGroups: {},
    subgroupPatterns: {},
  });

  // Should be sorted by order and secondly by name
  patternlab.patterns.push(
    new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
    new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
    new Pattern('patternGroup1/patternSubgroup1/blue.mustache')
  );
  ui.resetUIBuilderState(patternlab);

  // Set order of red to 1 to sort it after the others
  patternlab.patterns[1].order = 1;

  //act
  ui.groupPatterns(patternlab, uikit);

  let patternGroup = _.find(patternlab.patternGroups, [
    'patternGroup',
    'patternGroup1',
  ]);
  let patternSubgroup = _.find(patternGroup.patternGroupItems, [
    'patternSubgroup',
    'patternSubgroup1',
  ]);
  var items = patternSubgroup.patternSubgroupItems;

  // Viewall should come last since it shows all patterns that are above
  test.equals(items[0].patternPartial, 'patternGroup1-blue');
  test.equals(items[1].patternPartial, 'patternGroup1-yellow');
  test.equals(items[2].patternPartial, 'patternGroup1-red');

  test.end();
});

tap.test(
  'groupPatterns - retains pattern order from name when order provided from md is malformed',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
    });

    patternlab.patterns.push(
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    patternlab.patterns[1].order = 'notanumber!';

    //act
    ui.groupPatterns(patternlab, uikit);

    let patternGroup = _.find(patternlab.patternGroups, [
      'patternGroup',
      'patternGroup1',
    ]);
    let patternSubgroup = _.find(patternGroup.patternGroupItems, [
      'patternSubgroup',
      'patternSubgroup1',
    ]);
    var items = patternSubgroup.patternSubgroupItems;

    // Viewall should come last since it shows all patterns that are above
    test.equals(items[0].patternPartial, 'patternGroup1-blue');
    test.equals(items[1].patternPartial, 'patternGroup1-red');
    test.equals(items[2].patternPartial, 'patternGroup1-yellow');

    test.end();
  }
);

tap.test(
  'groupPatterns - sorts viewall subgroup pattern to the beginning',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
    });

    patternlab.patterns.push(
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    patternlab.patterns[0].order = 1;
    patternlab.patterns[1].order = 3;
    patternlab.patterns[2].order = 2;

    //act
    ui.groupPatterns(patternlab, uikit);

    let patternGroup = _.find(patternlab.patternGroups, [
      'patternGroup',
      'patternGroup1',
    ]);
    let patternSubgroup = _.find(patternGroup.patternGroupItems, [
      'patternSubgroup',
      'patternSubgroup1',
    ]);
    var items = patternSubgroup.patternSubgroupItems;

    // Viewall should come last since it shows all patterns that are above
    test.equals(
      items[3].patternPartial,
      'viewall-patternGroup1-patternSubgroup1'
    );
    test.equals(items[0].patternPartial, 'patternGroup1-blue');
    test.equals(items[1].patternPartial, 'patternGroup1-yellow');
    test.equals(items[2].patternPartial, 'patternGroup1-red');

    test.end();
  }
);

tap.test(
  'groupPatterns - creates documentation patterns for each type and subgroup if not exists',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
    });

    patternlab.patterns.push(
      new Pattern('00-test/foo.mustache'),
      new Pattern('00-test/bar.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/black.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/grey.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/white.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    //act
    var result = ui.groupPatterns(patternlab, uikit);

    //assert
    test.equals(
      result.patternGroups.patternGroup1.patternSubgroup1[
        'viewall-patternGroup1-patternSubgroup1'
      ].patternPartial,
      'viewall-patternGroup1-patternSubgroup1'
    );
    test.equals(
      result.patternGroups.patternGroup1.patternSubgroup2[
        'viewall-patternGroup1-patternSubgroup2'
      ].patternPartial,
      'viewall-patternGroup1-patternSubgroup2'
    );

    test.end();
  }
);

tap.test(
  'groupPatterns - adds each pattern to the patternPaths object',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
    });

    patternlab.patterns.push(
      new Pattern('00-test/foo.mustache'),
      new Pattern('00-test/bar.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/black.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/grey.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/white.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    //act
    var result = ui.groupPatterns(patternlab, uikit);

    //assert
    test.equals(patternlab.patternPaths['test']['foo'], '00-test-foo');
    test.equals(patternlab.patternPaths['test']['bar'], '00-test-bar');
    test.equals(
      patternlab.patternPaths['patternGroup1']['blue'],
      'patternGroup1-patternSubgroup1-blue'
    );
    test.equals(
      patternlab.patternPaths['patternGroup1']['red'],
      'patternGroup1-patternSubgroup1-red'
    );
    test.equals(
      patternlab.patternPaths['patternGroup1']['yellow'],
      'patternGroup1-patternSubgroup1-yellow'
    );
    test.equals(
      patternlab.patternPaths['patternGroup1']['black'],
      'patternGroup1-patternSubgroup2-black'
    );
    test.equals(
      patternlab.patternPaths['patternGroup1']['grey'],
      'patternGroup1-patternSubgroup2-grey'
    );
    test.equals(
      patternlab.patternPaths['patternGroup1']['white'],
      'patternGroup1-patternSubgroup2-white'
    );

    test.end();
  }
);

tap.test(
  'groupPatterns - adds each pattern to the view all paths object',
  function(test) {
    //arrange
    var patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
    });

    patternlab.patterns.push(
      new Pattern('00-test/foo.mustache'),
      new Pattern('00-test/bar.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/black.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/grey.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/white.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    //act
    var result = ui.groupPatterns(patternlab, uikit);

    //assert
    test.equals('todo', 'todo');

    test.end();
  }
);

tap.test('resetUIBuilderState - reset global objects', function(test) {
  //arrange
  var patternlab = createFakePatternLab({
    patternPaths: { foo: 1 },
    viewAllPaths: { bar: 2 },
    patternGroups: ['baz'],
  });

  //act
  ui.resetUIBuilderState(patternlab);

  //assert
  test.equals(patternlab.patternPaths.foo, undefined);
  test.equals(patternlab.viewAllPaths.bar, undefined);
  test.equals(patternlab.patternGroups.length, 0);

  test.end();
});

tap.test(
  'buildViewAllPages - adds viewall page for each type and subgroup NOT! for flat patterns',
  function(test) {
    //arrange
    const mainPageHeadHtml = '<head></head>';
    const patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
      footer: {},
      userFoot: {},
      cacheBuster: 1234,
    });

    patternlab.patterns.push(
      //this flat pattern is found and causes trouble for the rest of the crew
      new Pattern('00-test/foo.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/black.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/grey.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/white.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    const styleguidePatterns = ui.groupPatterns(patternlab, uikit);

    //act
    ui.buildViewAllPages(
      mainPageHeadHtml,
      patternlab,
      styleguidePatterns,
      uikit
    ).then(allPatterns => {
      // assert
      // this was a nuanced one. buildViewAllPages() had return false; statements
      // within _.forOwn(...) loops, causing premature termination of the entire loop
      // when what was intended was a continue
      // we expect 10 here because:
      //   - foo.mustache is flat and therefore does not have a viewall page
      //   - the colors.mustache files make 6
      //   - patternSubgroup1 and patternSubgroup2 make 8
      //   - the general view all page make 9
      // while most of that heavy lifting occurs inside groupPatterns and not buildViewAllPages,
      // it's important to ensure that this method does not get prematurely terminated
      // we choose to do that by checking it's return number of patterns

      const uniquePatterns = ui.uniqueAllPatterns(allPatterns, patternlab);

      /**
       * - view-patternGroup1-all
       * -- viewall-patternGroup1-patternSubgroup1
       * --- blue
       * --- red
       * --- yellow
       * -- viewall-patternGroup1-patternSubgroup2
       * --- black
       * --- grey
       * --- white
       */
      test.equals(uniquePatterns.length, 9, '3 viewall pages should be added');

      test.end();
    });
  }
);

tap.test(
  'buildViewAllPages - adds viewall page for each type and subgroup FOR! flat patterns',
  function(test) {
    //arrange
    const mainPageHeadHtml = '<head></head>';
    const patternlab = createFakePatternLab({
      patterns: [],
      patternGroups: {},
      subgroupPatterns: {},
      footer: {},
      userFoot: {},
      cacheBuster: 1234,
    });

    patternlab.config.renderFlatPatternsOnViewAllPages = true;

    patternlab.patterns.push(
      //this flat pattern is found and causes trouble for the rest of the crew
      new Pattern('00-test/foo.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/blue.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/red.mustache'),
      new Pattern('patternGroup1/patternSubgroup1/yellow.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/black.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/grey.mustache'),
      new Pattern('patternGroup1/patternSubgroup2/white.mustache')
    );
    ui.resetUIBuilderState(patternlab);

    const styleguidePatterns = ui.groupPatterns(patternlab, uikit);

    //act
    ui.buildViewAllPages(
      mainPageHeadHtml,
      patternlab,
      styleguidePatterns,
      uikit
    ).then(allPatterns => {
      // assert
      // this was a nuanced one. buildViewAllPages() had return false; statements
      // within _.forOwn(...) loops, causing premature termination of the entire loop
      // when what was intended was a continue
      // we expect 8 here because:
      //   - foo.mustache is flat and therefore does not have a viewall page
      //   - the colors.mustache files make 6
      //   - patternSubgroup1 and patternSubgroup2 make 8
      //   - the general view all page make 9
      //   - the view-all page of test and test-foo make 11
      // while most of that heavy lifting occurs inside groupPatterns and not buildViewAllPages,
      // it's important to ensure that this method does not get prematurely terminated
      // we choose to do that by checking it's return number of patterns

      const uniquePatterns = ui.uniqueAllPatterns(allPatterns, patternlab);

      /**
       * - viewall-test-all
       * -- test-foo
       * - view-patternGroup1-all
       * -- viewall-patternGroup1-patternSubgroup1
       * --- blue
       * --- red
       * --- yellow
       * -- viewall-patternGroup1-patternSubgroup2
       * --- black
       * --- grey
       * --- white
       */
      test.equals(uniquePatterns.length, 11, '4 viewall pages should be added');

      test.end();
    });
  }
);
