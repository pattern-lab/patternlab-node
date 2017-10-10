/*
  TODO
  - Make sure regex match Nunjucks features and syntax
  - Look into if we need to handle partials in the render method
  - Replace 'source/patterns' string with a config variable from PL if possible
  - Compare features and syntax with the mustache version so we can document
  - Consider using findPartials and replacing them that way instead of a hard search and replace
  - Make sure PL links work
  - Document and submit to PatternLab
*/

"use strict";

var _shuffle = require('lodash/shuffle');
var take = require('lodash/take');
var nunjucks = require('nunjucks');
// var env = new nunjucks.Environment();
var env = nunjucks.configure('source/_patterns/');
var partialRegistry = [];

env.addFilter('shorten', function (str, count) {
  return str.slice(0, count || 5);
});


env.addFilter('shuffle', (arr) => _shuffle(arr));
env.addFilter('take', (arr, number) => take(arr, number));

// console.log(env);
// nunjucks.Environment = env;



var engine_nunjucks = {
  engine: nunjucks,
  engineName: 'nunjucks',
  engineFileExtension: '.njk',

  //Important! Must be false for Nunjucks' block inheritance to work. Otherwise Nunjucks sees them as being defined more than once.
  expandPartials: false,

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{%\s*(?:extends|include|import|from)\s+('[^']+'|"[^"]+").*?%}/g,
  findPartialKeyRE: /"((?:\\.|[^"\\])*)"/,
  findPartialNameRE: /(['"])([^"'\s]*[^"'\s]*)\1/,

  // render it
  renderPattern: function renderPattern(pattern, data) {
    // replace pattern names with their full path so Nunjucks can find them.
    for (var i = 0; i < partialRegistry.length; i++) {
      pattern.extendedTemplate = pattern.extendedTemplate.split(partialRegistry[i].key).join(partialRegistry[i].value);
    }

    var partials = this.findPartials(pattern);

    if (partials !== null) {
      // console.log('Partial: ' + this.findPartial(partials[i]));
      for (var i = 0; i < partials.length; i++) {
        // console.log('Partial: ' + partials[i].match(this.findPartialNameRE)[2]);
        console.log('Partial: ' + this.findPartial(partials[i]));
      }
    }

    var result = nunjucks.renderString(pattern.extendedTemplate, data);

    return result;
  },

  // find and return any {% include|extends|import 'template-name' %} within pattern
  findPartials: function findPartials(pattern) {
    var matches = pattern.template.match(this.findPartialsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and return it.
  findPartial: function (partialString) {
    var partial = partialString.match(this.findPartialKeyRE)[0];
    partial = partial.replace(/"/g, '');
    return partial;
  },

  // keep track of partials and their paths so we can replace the name with the path
  registerPartial: function (pattern) {
    // only register each partial once. Otherwise we'll eat up a ton of memory.
    var found = partialRegistry.find(function (o) {
      return o.key === pattern.patternPartial;
    });

    if (found === undefined) {
      partialRegistry.push({
        key: pattern.patternPartial,
        value: pattern.relPath.split('\\').join('/')
      });
    }
  },

  // handled by nunjucks. This is error to keep PL from erroring
  findListItems: function (pattern) {
    return null;
  },

  // handled by nunjucks. This is error to keep PL from erroring
  findPartialsWithStyleModifiers: function () {
    return null;
  },

  // handled by nunjucks. This is error to keep PL from erroring
  findPartialsWithPatternParameters: function () {
    return null;
  }
};

module.exports = engine_nunjucks;
