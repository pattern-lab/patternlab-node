'use strict';

var _ = require('lodash');

const uikitExcludePattern = (pattern, uikit) => {
  const state = pattern.patternState;
  const tags = pattern.tags;

  return uikit.excludedPatternStates.includes(state) || _.intersection(uikit.excludedTags, tags).length > 0;
};
module.exports = uikitExcludePattern;
