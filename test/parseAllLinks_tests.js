'use strict';

const tap = require('tap');

var loadPattern = require('../core/lib/loadPattern');
const addPattern = require('../core/lib/addPattern');
const parseAllLinks = require('../core/lib/parseAllLinks');

var Pattern = require('../core/lib/object_factory').Pattern;
var PatternGraph = require('../core/lib/pattern_graph').PatternGraph;

var plMain = require('../core/lib/patternlab');
var config = require('./util/patternlab-config.json');

tap.test(
  'parseDataLinks - replaces found link.* data for their expanded links',
  function(test) {
    //arrange
    var patternlab = new plMain(config);
    patternlab.graph = PatternGraph.empty();

    patternlab.patterns = [
      Pattern.createEmpty({ patternPartial: 'twitter-brad' }, patternlab),
      Pattern.createEmpty({ patternPartial: 'twitter-dave' }, patternlab),
      Pattern.createEmpty({ patternPartial: 'twitter-brian' }, patternlab),
    ];
    patternlab.data.link = {};

    var navPattern = loadPattern('00-test/nav.mustache', patternlab);
    addPattern(navPattern, patternlab);

    //for the sake of the test, also imagining I have the following pages...
    patternlab.data.link['twitter-brad'] = 'https://twitter.com/brad_frost';
    patternlab.data.link['twitter-dave'] = 'https://twitter.com/dmolsen';
    patternlab.data.link['twitter-brian'] = 'https://twitter.com/bmuenzenmeyer';

    patternlab.data.brad = { url: 'link.twitter-brad' };
    patternlab.data.dave = { url: 'link.twitter-dave' };
    patternlab.data.brian = { url: 'link.twitter-brian' };

    var pattern;
    for (var i = 0; i < patternlab.patterns.length; i++) {
      if (patternlab.patterns[i].patternPartial === 'test-nav') {
        pattern = patternlab.patterns[i];
      }
    }

    //assert before
    test.equals(
      pattern.jsonFileData.brad.url,
      'link.twitter-brad',
      'brad pattern data should be found'
    );
    test.equals(
      pattern.jsonFileData.dave.url,
      'link.twitter-dave',
      'dave pattern data should be found'
    );
    test.equals(
      pattern.jsonFileData.brian.url,
      'link.twitter-brian',
      'brian pattern data should be found'
    );

    //act
    parseAllLinks(patternlab);

    //assert after
    test.equals(
      pattern.jsonFileData.brad.url,
      'https://twitter.com/brad_frost',
      'brad pattern data should be replaced'
    );
    test.equals(
      pattern.jsonFileData.dave.url,
      'https://twitter.com/dmolsen',
      'dave pattern data should be replaced'
    );
    test.equals(
      pattern.jsonFileData.brian.url,
      'https://twitter.com/bmuenzenmeyer',
      'brian pattern data should be replaced'
    );

    test.equals(
      patternlab.data.brad.url,
      'https://twitter.com/brad_frost',
      'global brad data should be replaced'
    );
    test.equals(
      patternlab.data.dave.url,
      'https://twitter.com/dmolsen',
      'global dave data should be replaced'
    );
    test.equals(
      patternlab.data.brian.url,
      'https://twitter.com/bmuenzenmeyer',
      'global brian data should be replaced'
    );
    test.end();
  }
);
