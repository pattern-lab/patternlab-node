/*
  TODO
  - Make sure regex match Nunjucks features and syntax
  - Look into if we need to handle partials in the render method
  - Test methods of including files
  - Compare features and syntax with the mustache version so we can document
  - Document and submit to PatternLab
*/

"use strict";

var path = require('path'),
  plPath = process.cwd(),
  plConfig = require(path.join(plPath, 'patternlab-config.json')),
  nunjucks = require('nunjucks'),
  env = nunjucks.configure(plConfig.paths.source.patterns),
  partialRegistry = [];


////////////////////////////
// LOAD ANY USER NUNJUCKS CONFIGURATIONS
////////////////////////////
try {
  var nunjucksConfig = require(path.join(plPath, 'patternlab-nunjucks-config.js'));
  if (typeof nunjucksConfig == 'function') {
    nunjucksConfig(nunjucks, env);
  }
}
catch (err) {
  console.log('Cannot find module \'patternlab-nunjucks-config.js\'');
}


////////////////////////////
// HELPER FUNCTIONS
// https://stackoverflow.com/questions/2116558/fastest-method-to-replace-all-instances-of-a-character-in-a-string
// Might do some research on the solution.
////////////////////////////
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), (ignore ? "gi" : "g")), (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2);
  }
}


////////////////////////////
// NUNJUCKS ENGINE
////////////////////////////
var engine_nunjucks = {
  engine: nunjucks,
  engineName: 'nunjucks',
  engineFileExtension: '.njk',

  //Important! Must be false for Nunjucks' block inheritance to work. Otherwise Nunjucks sees them as being defined more than once.
  expandPartials: false,

  // regexes, stored here so they're only compiled once
  findPartialsRE: /{%\s*(?:extends|include|import|from)\s+(?:.*)\s*%}/g,
  findPartialKeyRE: /{%\s*(?:extends|include|import|from)\s+('[^']+'|"[^"]+")/,

  // render it
  renderPattern: function renderPattern(pattern, data) {
    try {
      // replace pattern names with their full path so Nunjucks can find them.
      pattern.extendedTemplate = this.replacePartials(pattern);
      var result = nunjucks.renderString(pattern.extendedTemplate, data);
      // var result = nunjucks.compile(pattern.extendedTemplate, env).render(data);
      return result;
    }
    catch (err) {
      console.error('Failed to render pattern: ' + pattern.name);
    }
  },

  // find and return any Nunjucks style includes/imports/extends within pattern
  // EXAMPLES OF NUNJUCKS STYLE PARTIAL INCLUDES
  // {% include "atoms-parent" %} [WORKS]
  // {% include 'atoms-parent' %} [WORKS]
  // {% include "atoms-parent" ignore missing %} [WORKS]
  // {% import "atoms-parent" as forms %} [WORKS]
  // {% from "atoms-parent" import field, label as description %} [WORKS]
  // {% extends "atoms-parent" %} [WORKS]
  // {% extends parentTemplate %}
  // {% extends name + ".njk" %}
  findPartials: function findPartials(pattern) {
    var matches = pattern.template.match(this.findPartialsRE);
    return matches;
  },

  // given a pattern, and a partial string, tease out the "pattern key" and return it.
  findPartial: function (partialString) {
    try {
      var partial = partialString.match(this.findPartialKeyRE)[1];
      partial = partial.replace(/["']/g, '');
      return partial;
    }
    catch (err) {
      console.error('Error occured when trying to find partial name in: ' + partialString);
    }
  },

  // keep track of partials and their paths so we can replace the name with the path
  registerPartial: function (pattern) {
    // only register each partial once. Otherwise we'll eat up a ton of memory.
    if (partialRegistry.indexOf(pattern.patternPartial) === -1) {
      partialRegistry[pattern.patternPartial] = pattern.relPath.replace(/\\/g, '/');
    }
  },

  replacePartials: function (pattern) {
    try {
      var partials = this.findPartials(pattern);
      if (partials !== null) {
        for (var i = 0; i < partials.length; i++) { // e.g. {% include "atoms-parent" %}
          var partialName = this.findPartial(partials[i]); // e.g. atoms-parent
          var partialFullPath = partialRegistry[partialName]; // e.g. 00-atoms/01-parent.njk
          var newPartial = partials[i].replaceAll(partialName, partialFullPath, true); // e.g. {% include "00-atoms/01-parent.njk" %}
          pattern.extendedTemplate = pattern.extendedTemplate.replaceAll(partials[i], newPartial, true);
        }
      }
      return pattern.extendedTemplate;
    }
    catch (err) {
      console.error('Error occurred in replacing partial names with paths for patern: ' + pattern.name);
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
