'use strict';

const _ = require('lodash');

const uikitExcludePattern = (pattern, uikit) => {
  const state = pattern.patternState;
  const tags = pattern.tags;

  return (
    _.includes(uikit.excludedPatternStates, state) ||
    _.intersection(uikit.excludedTags, tags).length > 0
  );
};
module.exports = uikitExcludePattern;
