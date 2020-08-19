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
  test.equals(p.patternSubgroup, 'global');
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
    test.equals(p.subdir, path.join('00-atoms', '00-global', '00-colors'));
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
    test.equals(p.patternSubgroup, 'global');
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
    {
      d: 123,
    }
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

tap.test('test Pattern with own-directory gets resetted as expected', function(
  test
) {
  var p = new Pattern('00-atoms/00-button/button.mustache', { d: 123 }, pl);
  p.promoteFromFlatPatternToDirectory(pl);

  test.equals(p.relPath, path.join('00-atoms', '00-button', 'button.mustache'));
  test.equals(p.name, '00-atoms-00-button-button');
  test.equals(p.subdir, path.join('00-atoms', '00-button'));
  test.equals(p.fileName, 'button');
  test.equals(p.fileExtension, '.mustache');
  test.equals(p.jsonFileData.d, 123);
  test.equals(p.patternBaseName, 'button');
  test.equals(p.patternName, 'Button');
  test.equals(
    p.getPatternLink(pl),
    path.join(
      '00-atoms-00-button-button',
      '00-atoms-00-button-button.rendered.html'
    )
  );
  test.equals(p.patternGroup, 'atoms');
  test.equals(p.flatPatternPath, '00-atoms-00-button');
  test.equals(p.patternPartial, 'atoms-button');
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

tap.test('test Pattern get dir level no separated pattern directory', function(
  test
) {
  var p = new Pattern('00-atoms/00-global/00-colors-alt.mustache', { d: 123 });
  console.log(p);
  test.equals(p.getDirLevel(0, { patternHasOwnDir: false }), '00-atoms');
  test.equals(p.getDirLevel(1, { patternHasOwnDir: false }), '00-global');
  test.equals(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third level
  var p = new Pattern('00-atoms/00-colors-alt.mustache', { d: 123 });
  test.equals(p.getDirLevel(0, { patternHasOwnDir: false }), '00-atoms');
  test.equals(p.getDirLevel(1, { patternHasOwnDir: false }), ''); // There is no second level
  test.equals(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third level
  var p = new Pattern('00-colors-alt.mustache', { d: 123 });
  test.equals(p.getDirLevel(0, { patternHasOwnDir: false }), 'root'); // No first level means root
  test.equals(p.getDirLevel(1, { patternHasOwnDir: false }), ''); // There is no second level
  test.equals(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third leveL
  test.end();
});

tap.test(
  'test Pattern get dir level with separated pattern directory',
  function(test) {
    var p = new Pattern(
      '00-atoms/00-global/00-colors-alt/colors-alt.mustache',
      { d: 123 }
    );
    test.equals(p.getDirLevel(0, { patternHasOwnDir: true }), '00-atoms');
    test.equals(p.getDirLevel(1, { patternHasOwnDir: true }), '00-global');
    test.equals(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third level

    var p = new Pattern('00-atoms/00-colors-alt/colors-alt.mustache', {
      d: 123,
    });
    test.equals(p.getDirLevel(0, { patternHasOwnDir: true }), '00-atoms');
    test.equals(p.getDirLevel(1, { patternHasOwnDir: true }), ''); // There is no second level
    test.equals(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third level

    var p = new Pattern('00-colors-alt/colors-alt.mustache', { d: 123 });
    test.equals(p.getDirLevel(0, { patternHasOwnDir: true }), 'root'); // No first level means root
    test.equals(p.getDirLevel(1, { patternHasOwnDir: true }), ''); // There is no second level
    test.equals(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third leveL

    var p = new Pattern(
      '00-atoms/00-global/00-colors-alt/colors-alt~variant.mustache',
      { d: 123 }
    );
    test.equals(p.name, '00-atoms-00-global-00-colors-alt-variant');
    test.equals(p.flatPatternPath, '00-atoms-00-global');
    test.equals(p.patternBaseName, 'colors-alt-variant');

    test.end();
  }
);

tap.test('test Patterns that are nested deeper without own directory', function(
  test
) {
  var p = new Pattern(
    '00-atoms/00-global/00-random-folder/00-colors-alt.mustache',
    {
      d: 123,
    }
  );
  test.equals(p.name, '00-atoms-00-global-00-colors-alt');
  test.equals(p.flatPatternPath, '00-atoms-00-global');

  var p = new Pattern(
    '00-atoms/00-global/00-random-folder/00-another-folder/00-colors-alt.mustache',
    {
      d: 123,
    }
  );
  test.equals(p.name, '00-atoms-00-global-00-colors-alt');
  test.equals(p.flatPatternPath, '00-atoms-00-global');

  var p = new Pattern(
    '00-atoms/00-global/00-random-folder/00-another-folder/00-some-folder/00-colors-alt.mustache',
    { d: 123 }
  );
  test.equals(p.name, '00-atoms-00-global-00-colors-alt');
  test.equals(p.flatPatternPath, '00-atoms-00-global');

  var p = new Pattern(
    '00-atoms/00-global/00-random-folder/00-another-folder/00-colors-alt/colors-alt.mustache',
    { d: 123 }
  );
  test.equals(p.name, '00-atoms-00-global-00-colors-alt');
  test.equals(p.flatPatternPath, '00-atoms-00-global');

  var p = new Pattern(
    '00-atoms/00-global/00-random-folder/00-another-folder/00-some-folder/00-colors-alt~variant.mustache',
    { d: 123 }
  );
  test.equals(p.name, '00-atoms-00-global-00-colors-alt-variant');
  test.equals(p.flatPatternPath, '00-atoms-00-global');
  test.equals(p.patternBaseName, 'colors-alt-variant');
  test.end();
});

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
