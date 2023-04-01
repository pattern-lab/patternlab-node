'use strict';

const path = require('path');
const tap = require('tap');
const fs = require('fs-extra');

const addPattern = require('../src/lib/addPattern');
const parseAllLinks = require('../src/lib/parseAllLinks');

const Pattern = require('../src/lib/object_factory').Pattern;
const PatternGraph = require('../src/lib/pattern_graph').PatternGraph;
const da = require('../src/lib/data_loader');
const dataLoader = new da();

const util = require('./util/test_utils.js');
const patterns_dir = './test/files/_patterns';

tap.test(
  'parseDataLinks - replaces found link.* data for their expanded links',
  function (test) {
    //arrange
    const patternlab = util.fakePatternLab(patterns_dir);
    patternlab.graph = PatternGraph.empty();

    addPattern(new Pattern('twitter/brad.hbs', {}, patternlab), patternlab);
    addPattern(new Pattern('twitter/dave.hbs', {}, patternlab), patternlab);
    addPattern(new Pattern('twitter/brian.hbs', {}, patternlab), patternlab);
    addPattern(
      new Pattern('twitter/people/someone.hbs', {}, patternlab),
      patternlab
    );
    // Test with pattern prefix
    addPattern(
      new Pattern('facebook/people/someone2.hbs', {}, patternlab),
      patternlab
    );

    // copies essential logic from loadPattern
    const navPattern = new Pattern('test/nav.hbs', {}, patternlab);
    const patternData = dataLoader.loadDataFromFile(
      path.resolve(
        __dirname,
        'files/_patterns',
        navPattern.subdir,
        navPattern.fileName
      ),
      fs
    );
    navPattern.jsonFileData = patternData;
    addPattern(navPattern, patternlab);

    patternlab.data.brad = { url: 'link.twitter-brad' };
    patternlab.data.dave = { url: 'link.twitter-dave' };
    patternlab.data.brian = { url: 'link.twitter-brian' };
    patternlab.data.someone = { url: 'link.twitter-someone' };
    patternlab.data.someone2 = { url: 'link.facebook-someone2' };

    let pattern = patternlab.patterns.find(
      (p) => p.patternPartial === 'test-nav'
    );

    //assert before
    test.equal(
      pattern.jsonFileData.brad.url,
      'link.twitter-brad',
      'brad pattern data should be found'
    );
    test.equal(
      pattern.jsonFileData.dave.url,
      'link.twitter-dave',
      'dave pattern data should be found'
    );
    test.equal(
      pattern.jsonFileData.brian.url,
      'link.twitter-brian',
      'brian pattern data should be found'
    );
    test.equal(
      pattern.jsonFileData.someone.url,
      'link.twitter-someone',
      'brian pattern data should be found'
    );
    test.equal(
      pattern.jsonFileData.someone2.url,
      'link.facebook-someone2',
      'brian pattern data should be found'
    );
    test.equal(
      pattern.jsonFileData['viewall-twitter'].url,
      'link.viewall-twitter-all',
      'view all twitter link should be found'
    );
    test.equal(
      pattern.jsonFileData['viewall-twitter-people'].url,
      'link.viewall-twitter-people',
      'view all twitter people link should be found'
    );
    test.equal(
      pattern.jsonFileData['viewall-facebook'].url,
      'link.viewall-facebook-all',
      'view all facebook link should be found'
    );
    test.equal(
      pattern.jsonFileData['viewall-facebook-people'].url,
      'link.viewall-facebook-people',
      'view all facebook people link should be found'
    );

    //act
    parseAllLinks(patternlab);

    //assert after
    test.equal(
      pattern.jsonFileData.brad.url,
      '/patterns/twitter-brad/twitter-brad.rendered.html',
      'brad pattern data should be replaced'
    );
    test.equal(
      pattern.jsonFileData.dave.url,
      '/patterns/twitter-dave/twitter-dave.rendered.html',
      'dave pattern data should be replaced'
    );
    test.equal(
      pattern.jsonFileData.brian.url,
      '/patterns/twitter-brian/twitter-brian.rendered.html',
      'brian pattern data should be replaced'
    );
    test.equal(
      pattern.jsonFileData.someone.url,
      '/patterns/twitter-people-someone/twitter-people-someone.rendered.html',
      'twitter people someone pattern data should be replaced'
    );
    test.equal(
      pattern.jsonFileData.someone2.url,
      '/patterns/facebook-people-someone2/facebook-people-someone2.rendered.html',
      'facebook people someone2 pattern data should be replaced with prefix pattern'
    );
    test.equal(
      pattern.jsonFileData['viewall-twitter'].url,
      '/patterns/twitter/index.html',
      'view all twitter link should be replaced'
    );
    test.equal(
      pattern.jsonFileData['viewall-twitter-people'].url,
      '/patterns/twitter-people/index.html',
      'view all twitter people link should be replaced'
    );
    test.equal(
      pattern.jsonFileData['viewall-facebook'].url,
      '/patterns/facebook/index.html',
      'view all facebook link should be replaced'
    );
    test.equal(
      pattern.jsonFileData['viewall-facebook-people'].url,
      '/patterns/facebook-people/index.html',
      'view all facebook people link should be replaced'
    );

    test.equal(
      patternlab.data.brad.url,
      '/patterns/twitter-brad/twitter-brad.rendered.html',
      'global brad data should be replaced'
    );
    test.equal(
      patternlab.data.dave.url,
      '/patterns/twitter-dave/twitter-dave.rendered.html',
      'global dave data should be replaced'
    );
    test.equal(
      patternlab.data.brian.url,
      '/patterns/twitter-brian/twitter-brian.rendered.html',
      'global brian data should be replaced'
    );
    test.equal(
      patternlab.data.someone.url,
      '/patterns/twitter-people-someone/twitter-people-someone.rendered.html',
      'twitter people someone pattern data should be replaced'
    );
    test.equal(
      patternlab.data.someone2.url,
      '/patterns/facebook-people-someone2/facebook-people-someone2.rendered.html',
      'facebook people someone2 pattern data should be replaced with prefix pattern'
    );
    test.end();
  }
);
