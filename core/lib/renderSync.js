"use strict";

const Pattern = require('./object_factory').Pattern;
const patternEngines = require('./pattern_engines');

module.exports = function (pattern, data, partials) {
  // if we've been passed a full Pattern, it knows what kind of template it
  // is, and how to render itself, so we just call its render method
  if (pattern instanceof Pattern) {
    return pattern.renderSync(data, partials);
  }

  // otherwise, assume it's a plain mustache template string, and we
  // therefore just need to create a dummpy pattern to be able to render
  // it
  var dummyPattern = Pattern.createEmpty({extendedTemplate: pattern});
  return patternEngines.mustache.renderPattern(dummyPattern, data, partials);
};
