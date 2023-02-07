'use strict';

const logger = require('./log');
const jsonCopy = require('./json_copy');
const getPartial = require('./get');

// TODO: remove when removing mustache
module.exports = function (currentPattern, patternlab) {
  const processRecursive = require('./processRecursive');

  //find how many partials there may be for the given pattern
  const foundPatternPartials = currentPattern.findPartials();

  // expand any partials present in this pattern; that is, drill down into
  // the template and replace their calls in this template with rendered
  // results
  if (
    currentPattern.engine.expandPartials &&
    foundPatternPartials !== null &&
    foundPatternPartials.length > 0
  ) {
    logger.debug(`found partials for ${currentPattern.patternPartial}`);

    //do something with the regular old partials
    foundPatternPartials.forEach((foundPartial) => {
      const partial = currentPattern.findPartial(foundPartial);
      const partialPattern = getPartial(partial, patternlab);

      //recurse through nested partials to fill out this extended template.
      return processRecursive(partialPattern.relPath, patternlab)
        .then(() => {
          //eslint-disable-line no-loop-func

          //complete assembly of extended template
          //create a copy of the partial so as to not pollute it after the getPartial call.
          const cleanPartialPattern = jsonCopy(
            partialPattern,
            `partial pattern ${partial}`
          );

          //this is what we came here for
          logger.debug(
            `within ${currentPattern.patternPartial}, replacing extendedTemplate partial ${foundPartial} with ${cleanPartialPattern.patternPartial}'s extendedTemplate`
          );

          currentPattern.extendedTemplate =
            currentPattern.extendedTemplate.replace(
              foundPartial,
              cleanPartialPattern.extendedTemplate
            );

          // update the extendedTemplate in the partials object in case this
          // pattern is consumed later
          patternlab.partials[currentPattern.patternPartial] =
            currentPattern.extendedTemplate;

          return Promise.resolve();
        })
        .catch((reason) => {
          console.log(reason);
          logger.error(reason);
        });
    });
  }
  return Promise.resolve();
};
