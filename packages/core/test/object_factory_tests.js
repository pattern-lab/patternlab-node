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

tap.test('test Pattern initializes correctly', function (test) {
  var p = new Pattern('atoms/global/colors.mustache', { d: 123 });
  test.equal(
    p.relPath,
    'atoms' + path.sep + 'global' + path.sep + 'colors.mustache'
  );
  test.equal(p.name, 'atoms-global-colors');
  test.equal(p.subdir, 'atoms' + path.sep + 'global');
  test.equal(p.fileName, 'colors');
  test.equal(p.fileExtension, '.mustache');
  test.equal(p.jsonFileData.d, 123);
  test.equal(p.patternBaseName, 'colors');
  test.equal(p.patternName, 'Colors');
  test.equal(
    p.getPatternLink(pl),
    'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
  );
  test.equal(p.patternGroup, 'atoms');
  test.equal(p.patternSubgroup, 'global');
  test.equal(p.flatPatternPath, 'atoms-global');
  test.equal(p.patternPartial, 'atoms-colors');
  test.equal(p.template, '');
  test.equal(p.patternPartialCode, '');
  test.equal(p.lineage.length, 0);
  test.equal(p.lineageIndex.length, 0);
  test.equal(p.lineageR.length, 0);
  test.equal(p.lineageRIndex.length, 0);
  test.equal(p.patternState, '');
  test.end();
});

tap.test(
  'test Pattern initializes correctly with pattern in sepatated directory',
  function (test) {
    var p = new Pattern('atoms/global/colors/colors.mustache', {
      d: 123,
    });
    test.equal(
      p.relPath,
      'atoms' +
        path.sep +
        'global' +
        path.sep +
        'colors' +
        path.sep +
        'colors.mustache'
    );
    test.equal(p.name, 'atoms-global-colors');
    test.equal(p.subdir, path.join('atoms', 'global', 'colors'));
    test.equal(p.fileName, 'colors');
    test.equal(p.fileExtension, '.mustache');
    test.equal(p.jsonFileData.d, 123);
    test.equal(p.patternBaseName, 'colors');
    test.equal(p.patternName, 'Colors');
    test.equal(
      p.getPatternLink(pl),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
    );
    test.equal(p.patternGroup, 'atoms');
    test.equal(p.patternSubgroup, 'global');
    test.equal(p.flatPatternPath, 'atoms-global');
    test.equal(p.patternPartial, 'atoms-colors');
    test.equal(p.template, '');
    test.equal(p.patternPartialCode, '');
    test.equal(p.lineage.length, 0);
    test.equal(p.lineageIndex.length, 0);
    test.equal(p.lineageR.length, 0);
    test.equal(p.lineageRIndex.length, 0);
    test.equal(p.patternState, '');
    test.end();
  }
);

tap.test(
  'test Pattern name for variants correctly initialzed',
  function (test) {
    var p1 = new Pattern('atoms/global/colors/colors~variant.mustache', {
      d: 123,
    });
    var p2 = new Pattern('atoms/global/colors/colors~variant-minus.json', {
      d: 123,
    });
    test.equal(p1.name, 'atoms-global-colors-variant');
    test.equal(p2.name, 'atoms-global-colors-variant-minus');
    test.end();
  }
);

tap.test(
  'test Pattern with one-directory subdir works as expected',
  function (test) {
    var p = new Pattern('atoms/colors.mustache', { d: 123 });
    test.equal(p.relPath, 'atoms' + path.sep + 'colors.mustache');
    test.equal(p.name, 'atoms-colors');
    test.equal(p.subdir, 'atoms');
    test.equal(p.fileName, 'colors');
    test.equal(p.fileExtension, '.mustache');
    test.equal(p.jsonFileData.d, 123);
    test.equal(p.patternBaseName, 'colors');
    test.equal(p.patternName, 'Colors');
    test.equal(
      p.getPatternLink(pl),
      'atoms-colors' + path.sep + 'atoms-colors.rendered.html'
    );
    test.equal(p.patternGroup, 'atoms');
    test.equal(p.flatPatternPath, 'atoms');
    test.equal(p.patternPartial, 'atoms-colors');
    test.equal(p.template, '');
    test.equal(p.lineage.length, 0);
    test.equal(p.lineageIndex.length, 0);
    test.equal(p.lineageR.length, 0);
    test.equal(p.lineageRIndex.length, 0);
    test.end();
  }
);

tap.test(
  'test Pattern with own-directory gets resetted as expected',
  function (test) {
    var p = new Pattern('atoms/button/button.mustache', { d: 123 }, pl);
    p.promoteFromDirectoryToFlatPattern(pl);

    test.equal(p.relPath, path.join('atoms', 'button', 'button.mustache'));
    test.equal(p.name, 'atoms-button');
    test.equal(p.subdir, path.join('atoms', 'button'));
    test.equal(p.fileName, 'button');
    test.equal(p.fileExtension, '.mustache');
    test.equal(p.jsonFileData.d, 123);
    test.equal(p.patternBaseName, 'button');
    test.equal(p.patternName, 'Button');
    test.equal(
      p.getPatternLink(pl),
      path.join('atoms-button', 'atoms-button.rendered.html')
    );
    test.equal(p.patternGroup, 'atoms');
    test.equal(p.flatPatternPath, 'atoms');
    test.equal(p.patternPartial, 'atoms-button');
    test.equal(p.template, '');
    test.equal(p.lineage.length, 0);
    test.equal(p.lineageIndex.length, 0);
    test.equal(p.lineageR.length, 0);
    test.equal(p.lineageRIndex.length, 0);
    test.end();
  }
);

tap.test(
  'test Pattern with no numbers in pattern group works as expected',
  function (test) {
    var p = new Pattern('atoms/colors.mustache', { d: 123 });
    test.equal(p.relPath, 'atoms' + path.sep + 'colors.mustache');
    test.equal(p.name, 'atoms-colors');
    test.equal(p.subdir, 'atoms');
    test.equal(p.fileName, 'colors');
    test.equal(
      p.getPatternLink(pl),
      'atoms-colors' + path.sep + 'atoms-colors.rendered.html'
    );
    test.equal(p.patternGroup, 'atoms');
    test.equal(p.flatPatternPath, 'atoms');
    test.equal(p.patternPartial, 'atoms-colors');
    test.end();
  }
);

tap.test(
  'test Pattern capitalizes patternDisplayName correctly',
  function (test) {
    var p = new Pattern('atoms/global/colors-alt.mustache', { d: 123 });
    test.equal(p.patternBaseName, 'colors-alt');
    test.equal(p.patternName, 'Colors Alt');
    test.end();
  }
);

tap.test(
  'test Pattern get dir level no separated pattern directory',
  function (test) {
    var p = new Pattern('atoms/global/colors-alt.mustache', { d: 123 });
    console.log(p);
    test.equal(p.getDirLevel(0, { patternHasOwnDir: false }), 'atoms');
    test.equal(p.getDirLevel(1, { patternHasOwnDir: false }), 'global');
    test.equal(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third level
    var p = new Pattern('atoms/colors-alt.mustache', { d: 123 });
    test.equal(p.getDirLevel(0, { patternHasOwnDir: false }), 'atoms');
    test.equal(p.getDirLevel(1, { patternHasOwnDir: false }), ''); // There is no second level
    test.equal(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third level
    var p = new Pattern('colors-alt.mustache', { d: 123 });
    test.equal(p.getDirLevel(0, { patternHasOwnDir: false }), 'root'); // No first level means root
    test.equal(p.getDirLevel(1, { patternHasOwnDir: false }), ''); // There is no second level
    test.equal(p.getDirLevel(2, { patternHasOwnDir: false }), ''); // There is no third leveL
    test.end();
  }
);

tap.test(
  'test Pattern get dir level with separated pattern directory',
  function (test) {
    var p = new Pattern('atoms/global/colors-alt/colors-alt.mustache', {
      d: 123,
    });
    test.equal(p.getDirLevel(0, { patternHasOwnDir: true }), 'atoms');
    test.equal(p.getDirLevel(1, { patternHasOwnDir: true }), 'global');
    test.equal(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third level

    var p = new Pattern('atoms/colors-alt/colors-alt.mustache', {
      d: 123,
    });
    test.equal(p.getDirLevel(0, { patternHasOwnDir: true }), 'atoms');
    test.equal(p.getDirLevel(1, { patternHasOwnDir: true }), ''); // There is no second level
    test.equal(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third level

    var p = new Pattern('colors-alt/colors-alt.mustache', { d: 123 });
    test.equal(p.getDirLevel(0, { patternHasOwnDir: true }), 'root'); // No first level means root
    test.equal(p.getDirLevel(1, { patternHasOwnDir: true }), ''); // There is no second level
    test.equal(p.getDirLevel(2, { patternHasOwnDir: true }), ''); // There is no third leveL

    var p = new Pattern('atoms/global/colors-alt/colors-alt~variant.mustache', {
      d: 123,
    });
    test.equal(p.name, 'atoms-global-colors-alt-variant');
    test.equal(p.flatPatternPath, 'atoms-global');
    test.equal(p.patternBaseName, 'colors-alt-variant');

    test.end();
  }
);

tap.test(
  'test Patterns that are nested deeper without own directory',
  function (test) {
    var p = new Pattern('atoms/global/random-folder/colors-alt.mustache', {
      d: 123,
    });
    test.equal(p.name, 'atoms-global-colors-alt');
    test.equal(p.flatPatternPath, 'atoms-global');

    var p = new Pattern(
      'atoms/global/random-folder/another-folder/colors-alt.mustache',
      {
        d: 123,
      }
    );
    test.equal(p.name, 'atoms-global-colors-alt');
    test.equal(p.flatPatternPath, 'atoms-global');

    var p = new Pattern(
      'atoms/global/random-folder/another-folder/some-folder/colors-alt.mustache',
      { d: 123 }
    );
    test.equal(p.name, 'atoms-global-colors-alt');
    test.equal(p.flatPatternPath, 'atoms-global');

    var p = new Pattern(
      'atoms/global/random-folder/another-folder/colors-alt/colors-alt.mustache',
      { d: 123 }
    );
    test.equal(p.name, 'atoms-global-colors-alt');
    test.equal(p.flatPatternPath, 'atoms-global');

    var p = new Pattern(
      'atoms/global/random-folder/another-folder/some-folder/colors-alt~variant.mustache',
      { d: 123 }
    );
    test.equal(p.name, 'atoms-global-colors-alt-variant');
    test.equal(p.flatPatternPath, 'atoms-global');
    test.equal(p.patternBaseName, 'colors-alt-variant');
    test.end();
  }
);

tap.test(
  'The forms of Pattern.getPatternLink() work as expected',
  function (test) {
    var p = new Pattern('atoms/global/colors.hbs');
    test.equal(
      p.getPatternLink(pl),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
    );
    test.equal(
      p.getPatternLink(pl, 'rendered'),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.rendered.html'
    );
    test.equal(
      p.getPatternLink(pl, 'rawTemplate'),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.hbs'
    );
    test.equal(
      p.getPatternLink(pl, 'markupOnly'),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.markup-only.html'
    );
    test.equal(
      p.getPatternLink(pl, 'custom', '.custom-extension'),
      'atoms-global-colors' + path.sep + 'atoms-global-colors.custom-extension'
    );
    test.end();
  }
);
