'use strict';

var tap = require('tap');
var config = require('./util/patternlab-config.json');

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
    data: {
      link: {},
    },
    config: config,
    package: {},
  };

  return fpl;
}

var of = require('../src/lib/object_factory');
var Pattern = require('../src/lib/object_factory').Pattern;
var path = require('path');
var pl = fakePatternLab();
var engineLoader = require('../src/lib/pattern_engines');
engineLoader.loadAllEngines(config);

tap.test('test Pattern initializes correctly', function(test) {
  var p = new Pattern('00-atoms/00-global/00-colors.mustache', { d: 123 });
  test.equals(
    p.relPath,
    '00-atoms' + path.sep + '00-global' + path.sep + '00-colors.mustache'
  );
  test.equals(p.name, '00-atoms-00-global-00-colors');
  test.equals(p.subdir, '00-atoms' + path.sep + '00-global');
  test.equals(p.fileName, '00-colors');
  test.equals(p.fileExtension, '.mustache');
  test.equals(p.jsonFileData.d, 123);
  test.equals(p.patternBaseName, 'colors');
  test.equals(p.patternName, 'Colors');
  test.equals(
    p.getPatternLink(pl),
    '00-atoms-00-global-00-colors' +
      path.sep +
      '00-atoms-00-global-00-colors.rendered.html'
  );
  test.equals(p.patternGroup, 'atoms');
  test.equals(p.patternSubGroup, 'global');
  test.equals(p.flatPatternPath, '00-atoms-00-global');
  test.equals(p.patternPartial, 'atoms-colors');
  test.equals(p.template, '');
  test.equals(p.patternPartialCode, '');
  test.equals(p.lineage.length, 0);
  test.equals(p.lineageIndex.length, 0);
  test.equals(p.lineageR.length, 0);
  test.equals(p.lineageRIndex.length, 0);
  test.equals(p.patternState, '');
  test.end();
});

tap.test(
  'test Pattern initializes correctly with pattern in sepatated directory',
  function(test) {
    var p = new Pattern('00-atoms/00-global/00-colors/colors.mustache', {
      d: 123,
    });
    test.equals(
      p.relPath,
      '00-atoms' +
        path.sep +
        '00-global' +
        path.sep +
        '00-colors' +
        path.sep +
        'colors.mustache'
    );
    test.equals(p.name, '00-atoms-00-global-00-colors');
    test.equals(
      p.subdir,
      '00-atoms' + path.sep + '00-global' + path.sep + '00-colors'
    );
    test.equals(p.fileName, 'colors');
    test.equals(p.fileExtension, '.mustache');
    test.equals(p.jsonFileData.d, 123);
    test.equals(p.patternBaseName, 'colors');
    test.equals(p.patternName, 'Colors');
    test.equals(
      p.getPatternLink(pl),
      '00-atoms-00-global-00-colors' +
        path.sep +
        '00-atoms-00-global-00-colors.rendered.html'
    );
    test.equals(p.patternGroup, 'atoms');
    test.equals(p.patternSubGroup, 'global');
    test.equals(p.flatPatternPath, '00-atoms-00-global');
    test.equals(p.patternPartial, 'atoms-colors');
    test.equals(p.template, '');
    test.equals(p.patternPartialCode, '');
    test.equals(p.lineage.length, 0);
    test.equals(p.lineageIndex.length, 0);
    test.equals(p.lineageR.length, 0);
    test.equals(p.lineageRIndex.length, 0);
    test.equals(p.patternState, '');
    test.end();
  }
);

tap.test('test Pattern name for variants correctly initialzed', function(test) {
  var p1 = new Pattern('00-atoms/00-global/00-colors/colors~variant.mustache', {
    d: 123,
  });
  var p2 = new Pattern(
    '00-atoms/00-global/00-colors/colors~variant-minus.json',
    { d: 123 }
  );
  test.equals(p1.name, '00-atoms-00-global-00-colors-variant');
  test.equals(p2.name, '00-atoms-00-global-00-colors-variant-minus');
  test.end();
});

tap.test('test Pattern with one-directory subdir works as expected', function(
  test
) {
  var p = new Pattern('00-atoms/00-colors.mustache', { d: 123 });
  test.equals(p.relPath, '00-atoms' + path.sep + '00-colors.mustache');
  test.equals(p.name, '00-atoms-00-colors');
  test.equals(p.subdir, '00-atoms');
  test.equals(p.fileName, '00-colors');
  test.equals(p.fileExtension, '.mustache');
  test.equals(p.jsonFileData.d, 123);
  test.equals(p.patternBaseName, 'colors');
  test.equals(p.patternName, 'Colors');
  test.equals(
    p.getPatternLink(pl),
    '00-atoms-00-colors' + path.sep + '00-atoms-00-colors.rendered.html'
  );
  test.equals(p.patternGroup, 'atoms');
  test.equals(p.flatPatternPath, '00-atoms');
  test.equals(p.patternPartial, 'atoms-colors');
  test.equals(p.template, '');
  test.equals(p.lineage.length, 0);
  test.equals(p.lineageIndex.length, 0);
  test.equals(p.lineageR.length, 0);
  test.equals(p.lineageRIndex.length, 0);
  test.end();
});

tap.test(
  'test Pattern with no numbers in pattern group works as expected',
  function(test) {
    var p = new Pattern('atoms/colors.mustache', { d: 123 });
    test.equals(p.relPath, 'atoms' + path.sep + 'colors.mustache');
    test.equals(p.name, 'atoms-colors');
    test.equals(p.subdir, 'atoms');
    test.equals(p.fileName, 'colors');
    test.equals(
      p.getPatternLink(pl),
      'atoms-colors' + path.sep + 'atoms-colors.rendered.html'
    );
    test.equals(p.patternGroup, 'atoms');
    test.equals(p.flatPatternPath, 'atoms');
    test.equals(p.patternPartial, 'atoms-colors');
    test.end();
  }
);

tap.test('test Pattern capitalizes patternDisplayName correctly', function(
  test
) {
  var p = new Pattern('00-atoms/00-global/00-colors-alt.mustache', { d: 123 });
  test.equals(p.patternBaseName, 'colors-alt');
  test.equals(p.patternName, 'Colors Alt');
  test.end();
});

tap.test('test Pattern get dir level no sepatated pattern directory', function(
  test
) {
  var p = new Pattern('00-atoms/00-global/00-colors-alt.mustache', { d: 123 });
  console.log(p);
  test.equals(p.getDirLevel(0, { hasDir: false, dirLevel: 2 }), '00-atoms');
  test.equals(p.getDirLevel(1, { hasDir: false, dirLevel: 2 }), '00-global');
  test.equals(p.getDirLevel(3, { hasDir: false, dirLevel: 2 }), '');
  var p = new Pattern('00-atoms/00-colors-alt.mustache', { d: 123 });
  test.equals(p.getDirLevel(0, { hasDir: false, dirLevel: 1 }), '00-atoms');
  test.equals(p.getDirLevel(1, { hasDir: false, dirLevel: 1 }), '00-atoms');
  test.equals(p.getDirLevel(3, { hasDir: false, dirLevel: 1 }), '');
  var p = new Pattern('00-colors-alt.mustache', { d: 123 });
  test.equals(p.getDirLevel(0, { hasDir: false, dirLevel: 0 }), '');
  test.equals(p.getDirLevel(1, { hasDir: false, dirLevel: 0 }), '');
  test.equals(p.getDirLevel(3, { hasDir: false, dirLevel: 0 }), '');
  test.end();
});

tap.test(
  'test Pattern get dir level with sepatated pattern directory',
  function(test) {
    var p = new Pattern(
      '00-atoms/00-global/00-colors-alt/colors-alt.mustache',
      { d: 123 }
    );
    test.equals(p.getDirLevel(0, { hasDir: true, dirLevel: 3 }), '00-atoms');
    test.equals(p.getDirLevel(1, { hasDir: true, dirLevel: 3 }), '00-global');
    test.equals(p.getDirLevel(3, { hasDir: true, dirLevel: 3 }), '');
    var p = new Pattern('00-atoms/00-colors-alt/colors-alt.mustache', {
      d: 123,
    });
    test.equals(p.getDirLevel(0, { hasDir: true, dirLevel: 2 }), '00-atoms');
    test.equals(p.getDirLevel(1, { hasDir: true, dirLevel: 2 }), '00-atoms');
    test.equals(p.getDirLevel(3, { hasDir: true, dirLevel: 2 }), '');
    var p = new Pattern('00-colors-alt/colors-alt.mustache', { d: 123 });
    test.equals(p.getDirLevel(0, { hasDir: true, dirLevel: 1 }), '');
    test.equals(p.getDirLevel(1, { hasDir: true, dirLevel: 1 }), '');
    test.equals(p.getDirLevel(3, { hasDir: true, dirLevel: 1 }), '');
    test.end();
  }
);

tap.test('The forms of Pattern.getPatternLink() work as expected', function(
  test
) {
  var p = new Pattern('00-atoms/00-global/00-colors.hbs');
  test.equals(
    p.getPatternLink(pl),
    '00-atoms-00-global-00-colors' +
      path.sep +
      '00-atoms-00-global-00-colors.rendered.html'
  );
  test.equals(
    p.getPatternLink(pl, 'rendered'),
    '00-atoms-00-global-00-colors' +
      path.sep +
      '00-atoms-00-global-00-colors.rendered.html'
  );
  test.equals(
    p.getPatternLink(pl, 'rawTemplate'),
    '00-atoms-00-global-00-colors' +
      path.sep +
      '00-atoms-00-global-00-colors.hbs'
  );
  test.equals(
    p.getPatternLink(pl, 'markupOnly'),
    '00-atoms-00-global-00-colors' +
      path.sep +
      '00-atoms-00-global-00-colors.markup-only.html'
  );
  test.equals(
    p.getPatternLink(pl, 'custom', '.custom-extension'),
    '00-atoms-00-global-00-colors' +
      path.sep +
      '00-atoms-00-global-00-colors.custom-extension'
  );
  test.end();
});
