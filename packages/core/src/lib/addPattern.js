'use strict';

const logger = require('./log');

module.exports = function (pattern, patternlab) {
  //add the link to the global object
  if (!patternlab.data.link) {
    patternlab.data.link = {};
  }
  patternlab.data.link[pattern.patternPartial] =
    '/patterns/' + pattern.patternLink;

  //only push to array if the array doesn't contain this pattern
  let isNew = true;
  for (let i = 0; i < patternlab.patterns.length; i++) {
    //so we need the identifier to be unique, which patterns[i].relPath is
    if (pattern.relPath === patternlab.patterns[i].relPath) {
      //if relPath already exists, overwrite that element
      patternlab.patterns[i] = pattern;
      patternlab.partials[pattern.patternPartial] =
        pattern.extendedTemplate || pattern.template;
      isNew = false;
      break;
    }
  }

  // if the pattern is new, we must register it with various data structures!
  if (isNew) {
    logger.debug(`found new pattern ${pattern.patternPartial}`);

    // do global registration
    if (pattern.isPattern) {
      patternlab.partials[pattern.patternPartial] =
        pattern.extendedTemplate || pattern.template;

      // do plugin-specific registration
      pattern.registerPartial();
    } else {
      patternlab.partials[pattern.patternPartial] = pattern.patternDesc;
    }

    patternlab.patterns.push(pattern);
    patternlab.graph.add(pattern);
  }
};
