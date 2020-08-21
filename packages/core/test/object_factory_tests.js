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
  var p = new Pattern('atoms/global/colors.mustache', { d: 123 });
  test.equals(
    p.relPath,
    'atoms' + path.sep + 'global' + path.sep + 'colors.mustache'
  );
  test.equals(p.name, 'atoms-global-colors');
  test.equals(p.subdir, 'atoms' + path.sep + 'global');
  test.equals(p.fileName, 'colors');
  test.equals(p.fileExtension, '.mustache');
  test.equals(p.jsonFileData.d, 123);
  test.equals(p.patternBaseName, 'colors');
  test.equals(p.patternName, 'Colors');
  test.equals(
    p.getPatternLink(pl),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
  );
  test.equals(p.patternGroup, 'atoms');
  test.equals(p.patternSubgroup, 'global');
  test.equals(p.flatPatternPath, 'atoms-global');
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
    var p = new Pattern('atoms/global/colors/colors.mustache', {
      d: 123,
    });
    test.equals(
      p.relPath,
      'atoms' +
        path.sep +
        'global' +
        path.sep +
        'colors' +
        path.sep +
        'colors.mustache'
    );
    test.equals(p.name, 'atoms-global-colors');
    test.equals(p.subdir, path.join('atoms', 'global', 'colors'));
    test.equals(p.fileName, 'colors');
    test.equals(p.fileExtension, '.mustache');
    test.equals(p.jsonFileData.d, 123);
    test.equals(p.patternBaseName, 'colors');
    test.equals(p.patternName, 'Colors');
    test.equals(
      p.getPatternLink(pl),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
    );
    test.equals(p.patternGroup, 'atoms');
    test.equals(p.patternSubgroup, 'global');
    test.equals(p.flatPatternPath, 'atoms-global');
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
  var p1 = new Pattern('atoms/global/colors/colors~variant.mustache', {
    d: 123,
  });
  var p2 = new Pattern('atoms/global/colors/colors~variant-minus.json', {
    d: 123,
  });
  test.equals(p1.name, 'atoms-global-colors-variant');
  test.equals(p2.name, 'atoms-global-colors-variant-minus');
  test.end();
});

tap.test('test Pattern with one-directory subdir works as expected', function(
  test
) {
  var p = new Pattern('atoms/colors.mustache', { d: 123 });
  test.equals(p.relPath, 'atoms' + path.sep + 'colors.mustache');
  test.equals(p.name, 'atoms-colors');
  test.equals(p.subdir, 'atoms');
  test.equals(p.fileName, 'colors');
  test.equals(p.fileExtension, '.mustache');
  test.equals(p.jsonFileData.d, 123);
  test.equals(p.patternBaseName, 'colors');
  test.equals(p.patternName, 'Colors');
  test.equals(
    p.getPatternLink(pl),
    'atoms-colors' + path.sep + 'atoms-colors.rendered.html'
  );
  test.equals(p.patternGroup, 'atoms');
  test.equals(p.flatPatternPath, 'atoms');
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
  var p = new Pattern('atoms/button/button.mustache', { d: 123 }, pl);
  p.promoteFromFlatPatternToDirectory(pl);

  test.equals(p.relPath, path.join('atoms', 'button', 'button.mustache'));
  test.equals(p.name, 'atoms-button-button');
  test.equals(p.subdir, path.join('atoms', 'button'));
  test.equals(p.fileName, 'button');
  test.equals(p.fileExtension, '.mustache');
  test.equals(p.jsonFileData.d, 123);
  test.equals(p.patternBaseName, 'button');
  test.equals(p.patternName, 'Button');
  test.equals(
    p.getPatternLink(pl),
    path.join('atoms-button-button', 'atoms-button-button.rendered.html')
  );
  test.equals(p.patternGroup, 'atoms');
  test.equals(p.flatPatternPath, 'atoms-button');
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
  var p = new Pattern('atoms/global/colors-alt.mustache', { d: 123 });
  test.equals(p.patternBaseName, 'colors-alt');
  test.equals(p.patternName, 'Colors Alt');
  test.end();
});

tap.test('test Pattern get dir level no separated pattern directory', function(
  test
) {
  var p = new Pattern('atoms/global/colors-alt.mustache', { d: 123 });
  console.log(p);
  test.equals(p.getDirLevel(0, { patternHasOwnDir: false }), 'atoms');
  test.equals(p.getDirLevel(1, { patternHasOwnDir: false }), 'global');
  test.equals(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third level
  var p = new Pattern('atoms/colors-alt.mustache', { d: 123 });
  test.equals(p.getDirLevel(0, { patternHasOwnDir: false }), 'atoms');
  test.equals(p.getDirLevel(1, { patternHasOwnDir: false }), ''); // There is no second level
  test.equals(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third level
  var p = new Pattern('colors-alt.mustache', { d: 123 });
  test.equals(p.getDirLevel(0, { patternHasOwnDir: false }), 'root'); // No first level means root
  test.equals(p.getDirLevel(1, { patternHasOwnDir: false }), ''); // There is no second level
  test.equals(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third leveL
  test.end();
});

tap.test(
  'test Pattern get dir level with separated pattern directory',
  function(test) {
    var p = new Pattern('atoms/global/colors-alt/colors-alt.mustache', {
      d: 123,
    });
    test.equals(p.getDirLevel(0, { patternHasOwnDir: true }), 'atoms');
    test.equals(p.getDirLevel(1, { patternHasOwnDir: true }), 'global');
    test.equals(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third level

    var p = new Pattern('atoms/colors-alt/colors-alt.mustache', {
      d: 123,
    });
    test.equals(p.getDirLevel(0, { patternHasOwnDir: true }), 'atoms');
    test.equals(p.getDirLevel(1, { patternHasOwnDir: true }), ''); // There is no second level
    test.equals(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third level

    var p = new Pattern('colors-alt/colors-alt.mustache', { d: 123 });
    test.equals(p.getDirLevel(0, { patternHasOwnDir: true }), 'root'); // No first level means root
    test.equals(p.getDirLevel(1, { patternHasOwnDir: true }), ''); // There is no second level
    test.equals(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third leveL

    var p = new Pattern('atoms/global/colors-alt/colors-alt~variant.mustache', {
      d: 123,
    });
    test.equals(p.name, 'atoms-global-colors-alt-variant');
    test.equals(p.flatPatternPath, 'atoms-global');
    test.equals(p.patternBaseName, 'colors-alt-variant');

    test.end();
  }
);

tap.test('test Patterns that are nested deeper without own directory', function(
  test
) {
  var p = new Pattern('atoms/global/random-folder/colors-alt.mustache', {
    d: 123,
  });
  test.equals(p.name, 'atoms-global-colors-alt');
  test.equals(p.flatPatternPath, 'atoms-global');

  var p = new Pattern(
    'atoms/global/random-folder/another-folder/colors-alt.mustache',
    {
      d: 123,
    }
  );
  test.equals(p.name, 'atoms-global-colors-alt');
  test.equals(p.flatPatternPath, 'atoms-global');

  var p = new Pattern(
    'atoms/global/random-folder/another-folder/some-folder/colors-alt.mustache',
    { d: 123 }
  );
  test.equals(p.name, 'atoms-global-colors-alt');
  test.equals(p.flatPatternPath, 'atoms-global');

  var p = new Pattern(
    'atoms/global/random-folder/another-folder/colors-alt/colors-alt.mustache',
    { d: 123 }
  );
  test.equals(p.name, 'atoms-global-colors-alt');
  test.equals(p.flatPatternPath, 'atoms-global');

  var p = new Pattern(
    'atoms/global/random-folder/another-folder/some-folder/colors-alt~variant.mustache',
    { d: 123 }
  );
  test.equals(p.name, 'atoms-global-colors-alt-variant');
  test.equals(p.flatPatternPath, 'atoms-global');
  test.equals(p.patternBaseName, 'colors-alt-variant');
  test.end();
});

tap.test('The forms of Pattern.getPatternLink() work as expected', function(
  test
) {
  var p = new Pattern('atoms/global/colors.hbs');
  test.equals(
    p.getPatternLink(pl),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
  );
  test.equals(
    p.getPatternLink(pl, 'rendered'),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
  );
  test.equals(
    p.getPatternLink(pl, 'rawTemplate'),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.hbs'
  );
  test.equals(
    p.getPatternLink(pl, 'markupOnly'),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.markup-only.html'
  );
  test.equals(
    p.getPatternLink(pl, 'custom', '.custom-extension'),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.custom-extension'
  );
  test.end();
});
