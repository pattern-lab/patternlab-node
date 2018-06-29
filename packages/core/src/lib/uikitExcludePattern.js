'use strict';

const uikitExcludePattern = (pattern, uikit) => {
  const state = pattern.patternState;
  return uikit.excludedPatternStates.includes(state);
};
module.exports = uikitExcludePattern;
