"use strict";

const logger = require('./log');
const ph = require('./parameter_hunter');
const smh = require('./style_modifier_hunter');
const jsonCopy = require('./json_copy');
const getPartial = require('./get');

const parameter_hunter = new ph();
const style_modifier_hunter = new smh();

module.exports = function (currentPattern, patternlab) {

  const processRecursive = require('./processRecursive');

  console.log('15 currentPattern', currentPattern.patternPartial)

  //find how many partials there may be for the given pattern
  const foundPatternPartials = currentPattern.findPartials();

  console.log(20, currentPattern.patternPartial, foundPatternPartials)

  // expand any partials present in this pattern; that is, drill down into
  // the template and replace their calls in this template with rendered
  // results
  if (currentPattern.engine.expandPartials && (foundPatternPartials !== null && foundPatternPartials.length > 0)) {


    logger.debug(`found partials for ${currentPattern.patternPartial}`);

    // determine if the template contains any pattern parameters. if so they
    // must be immediately consumed
    return parameter_hunter.find_parameters(currentPattern, patternlab).then(() => {

      //do something with the regular old partials
      foundPatternPartials.forEach((foundPartial) => {

        var partial = currentPattern.findPartial(foundPartial);
        var partialPath;

        //identify which pattern this partial corresponds to
        for (var j = 0; j < patternlab.patterns.length; j++) {
          if (patternlab.patterns[j].patternPartial === partial ||
            patternlab.patterns[j].relPath.indexOf(partial) > -1)
          {
            partialPath = patternlab.patterns[j].relPath;
          }
        }

        //recurse through nested partials to fill out this extended template.
        return processRecursive(partialPath, patternlab).then(() => { //eslint-disable-line no-loop-func
          //complete assembly of extended template
          //create a copy of the partial so as to not pollute it after the getPartial call.
          var partialPattern = getPartial(partial, patternlab);
          var cleanPartialPattern = jsonCopy(partialPattern, `partial pattern ${partial}`);

          //if partial has style modifier data, replace the styleModifier value
          if (currentPattern.stylePartials && currentPattern.stylePartials.length > 0) {
            style_modifier_hunter.consume_style_modifier(cleanPartialPattern, foundPartial, patternlab);
          }

          //this is what we came here for
          logger.debug(`within ${currentPattern.patternPartial}, replacing extendedTemplate partial ${foundPartial} with ${cleanPartialPattern.patternPartial}'s extendedTemplate`);

          //console.log(`decompose 58 within ${currentPattern.patternPartial}, replacing extendedTemplate partial ${foundPartial} with ${cleanPartialPattern.patternPartial}'s extededTemplate`)
          //console.log(currentPattern.extendedTemplate);
          //console.log(cleanPartialPattern.extendedTemplate);
          currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(foundPartial, cleanPartialPattern.extendedTemplate);

          // update the extendedTemplate in the partials object in case this
          // pattern is consumed later
          patternlab.partials[currentPattern.patternPartial] = currentPattern.extendedTemplate;

          //console.log(62, `currentPattern ${currentPattern.patternPartial} .extendedTemplate now ${currentPattern.extendedTemplate}`)
          return Promise.resolve();
        }).catch(reason => {
          console.log(reason)
          logger.error(reason);
        });

        console.log('82 is bad')

      });

    }).catch(reason => {
      console.log(reason)
      logger.error(reason);
    });
  }
  return Promise.resolve();
}
