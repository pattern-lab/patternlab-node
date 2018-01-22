const tap = require('tap');
const rewire = require('rewire');
const _ = require('lodash');
const fs = require('fs-extra');
const get = require('../core/lib/get');

const util = require('./util/test_utils.js');
const entry = rewire('../core/index');
const defaultConfig = require('../patternlab-config.json');
var testConfig = require('./util/patternlab-config.json');

//set up a global mocks - we don't want to be writing/rendering any files right now

const assetCopierMock = function() {
  return { copyAssets: function() {} };
};

const uiBuilderMock = function() {
  return {
    buildFrontend: function() {
      return Promise.resolve();
    },
  };
};

const fsMock = {
  outputFileSync: function(path, content) {
    /* INTENTIONAL NOOP */
  },
  readJSONSync: function(path, encoding) {
    return fs.readJSONSync(path, encoding);
  },
  emptyDir: function(path) {
    return fs.emptyDir(path);
  },
  readFileSync: function(path, encoding) {
    return fs.readFileSync(path, encoding);
  },
};

//set our mocks in place of usual require()
entry.__set__({
  ui_builder: uiBuilderMock,
  fs: fsMock,
  assetCopier: assetCopierMock,
});

tap.test('getDefaultConfig - should return the default config object', function(
  test
) {
  const requestedConfig = entry.getDefaultConfig();
  test.type(requestedConfig, 'object');
  test.equals(requestedConfig, defaultConfig);
  test.end();
});

tap.test('buildPatterns', function() {
  //arrange

  var patternExporterMock = {
    /*
     In this suite, we actually take advantage of the pattern export functionality post-build to inspect what
     the contents of the patterns look like. This, coupled with a mocking of fs and the ui_builder, allow us to focus
     only on the order of events within build.
     */
    export_patterns: function(patternlab) {
      tap.test(
        'replace data link even when pattern parameter present',
        function(test) {
          var pattern = get('test-paramParent', patternlab);
          test.equals(
            util.sanitized(pattern.extendedTemplate),
            '<div class="foo"> <a href="{{url}}">Cool Dude</a> </div>',
            'partial inclusion completes'
          );
          test.equals(
            pattern.patternPartialCode.indexOf('00-test-00-foo.rendered.html') >
              -1,
            true,
            'data link should be replaced properly'
          );
          test.end();
        }
      );

      tap.test(
        'finds partials with their own parameters and renders them too',
        function(test) {
          var pattern = get('test-c', patternlab);
          test.equals(
            util.sanitized(pattern.patternPartialCode),
            util.sanitized(`<b>c</b>
        <b>b</b>
        <i>b!</i>
        <b>a</b>
        <i>a!</i>`)
          );
          test.end();
        }
      );

      tap.test(
        'finds and extends templates with mixed parameter and global data',
        function(test) {
          var pattern = get('test-sticky-comment', patternlab);
          test.equals(
            util.sanitized(pattern.patternPartialCode),
            util.sanitized(
              `<h1>Bar</h1><p>A life is like a garden. Perfect moments can be had, but not preserved, except in memory.</p>`
            )
          );
          test.end();
        }
      );

      tap.test('expands links inside parameters', function(test) {
        var pattern = get('test-linkInParameter', patternlab);
        test.equals(
          util.sanitized(pattern.patternPartialCode),
          util.sanitized(
            `<a href="/patterns/00-test-comment/00-test-comment.rendered.html">Cool Dude</a>`
          )
        );
        test.end();
      });

      tap.test('uses global listItem property', test => {
        var pattern = get('test-listWithPartial', patternlab);
        console.log(pattern.patternPartialCode);
        let assertionCount = 0;
        ['dA', 'dB', 'dC'].forEach(d => {
          if (pattern.patternPartialCode.indexOf(d) > -1) {
            assertionCount++;
          }
        });
        test.ok(assertionCount === 2);
        test.end();
      });

      tap.test(
        'overwrites listItem property if that property is in local .listitem.json',
        test => {
          var pattern = get('test-listWithListItems', patternlab);
          test.ok(pattern.patternPartialCode.indexOf('tX') > -1);
          test.ok(pattern.patternPartialCode.indexOf('tY') > -1);
          test.ok(pattern.patternPartialCode.indexOf('tZ') > -1);

          test.end();
        }
      );

      tap.test(
        'uses global listItem property after merging local .listitem.json',
        test => {
          var pattern = get('test-listWithListItems', patternlab);
          test.ok(pattern.patternPartialCode.indexOf('dA') > -1);
          test.ok(pattern.patternPartialCode.indexOf('dB') > -1);
          test.ok(pattern.patternPartialCode.indexOf('dC') > -1);
          test.end();
        }
      );

      tap.test(
        'correctly ignores bookended partials without a style modifier when the same partial has a style modifier between',
        test => {
          var pattern = get('test-bookend-listitem', patternlab);
          test.equals(
            util.sanitized(pattern.extendedTemplate),
            util.sanitized(`<div class="test_group">
          {{#listItems-two}}
            <span class="test_base {{styleModifier}}">
            {{message}}
        </span>

            <span class="test_base test_1">
            {{message}}
        </span>

            <span class="test_base {{styleModifier}}">
            {{message}}
        </span>

          {{/listItems-two}}
        </div>
        `)
          );
          test.end();
        }
      );

      tap.test(
        'listItems keys (`one` through `twelve`) can be used more than once per pattern',
        test => {
          var pattern = get('test-repeatedListItems', patternlab);
          test.equals(
            util.sanitized(pattern.patternPartialCode),
            util.sanitized(`AAA BBB`)
          );
          test.end();
        }
      );

      /////////////// FAILING ///////////////////
      // todo
      // From issue #145 https://github.com/pattern-lab/patternlab-node/issues/145
      // tap.test(' parses parameters containing html tags', function (test) {
      //   var pattern = get('test-parameterTags', patternlab);
      //   test.equals(util.sanitized(pattern.patternPartialCode), util.sanitized(`<p><strong>Single-quoted</strong></p><p><em>Double-quoted</em></p><p><strong class="foo" id=\'bar\'>With attributes</strong></p>`));
      //   test.end();
      // });
    },
  };

  entry.__set__({
    pattern_exporter: patternExporterMock,
  });

  testConfig.patternExportPatternPartials = ['test-paramParent'];
  var pl = new entry(testConfig);

  //act
  return pl.build({
    cleanPublic: true,
    data: {
      foo: 'Bar',
      description: 'Baz',
    },
  });
});
