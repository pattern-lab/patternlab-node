"use strict";

const logger = require('./log');
const lh = require('./lineage_hunter');
const lih = require('./list_item_hunter');
const ph = require('./parameter_hunter');
const smh = require('./style_modifier_hunter');
const addPattern = require('./addPattern');
const jsonCopy = require('./json_copy');
const getPartial = require('./get');
const processRecursive = require('./processRecursive');

const lineage_hunter = new lh();
const list_item_hunter = new lih();
const parameter_hunter = new ph();
const style_modifier_hunter = new smh();

function expandPartials(foundPatternPartials, patternlab, currentPattern) {

  logger.debug(`found partials for ${currentPattern.patternPartial}`);

  // determine if the template contains any pattern parameters. if so they
  // must be immediately consumed
  parameter_hunter.find_parameters(currentPattern, patternlab).then(() => {

    //do something with the regular old partials
    for (var i = 0; i < foundPatternPartials.length; i++) {
      var partial = currentPattern.findPartial(foundPatternPartials[i]);
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
      processRecursive(partialPath, patternlab);

      //complete assembly of extended template
      //create a copy of the partial so as to not pollute it after the getPartial call.
      var partialPattern = getPartial(partial, patternlab);
      var cleanPartialPattern = jsonCopy(partialPattern, `partial pattern ${partial}`);

      //if partial has style modifier data, replace the styleModifier value
      if (currentPattern.stylePartials && currentPattern.stylePartials.length > 0) {
        style_modifier_hunter.consume_style_modifier(cleanPartialPattern, foundPatternPartials[i], patternlab);
      }

      currentPattern.extendedTemplate = currentPattern.extendedTemplate.replace(foundPatternPartials[i], cleanPartialPattern.extendedTemplate);
    }
  });
}

/**
 * A helper that unravels a pattern looking for partials or listitems to unravel.
 * The goal is really to convert pattern.template into pattern.extendedTemplate
 * @param pattern - the pattern to decompose
 * @param patternlab - global data store
 * @param ignoreLineage - whether or not to hunt for lineage for this pattern
 */
module.exports = function (pattern, patternlab, ignoreLineage) {

  pattern.extendedTemplate = pattern.template;

  //find how many partials there may be for the given pattern
  var foundPatternPartials = pattern.findPartials();

  //find any listItem blocks that within the pattern, even if there are no partials
  list_item_hunter.process_list_item_partials(pattern, patternlab);

  // expand any partials present in this pattern; that is, drill down into
  // the template and replace their calls in this template with rendered
  // results
  let expandPartialPromise = undefined;
  if (pattern.engine.expandPartials && (foundPatternPartials !== null && foundPatternPartials.length > 0)) {

    // eslint-disable-next-line
    expandPartialPromise = expandPartials(foundPatternPartials, patternlab, pattern).then(() => {

      // update the extendedTemplate in the partials object in case this
      // pattern is consumed later
      patternlab.partials[pattern.patternPartial] = pattern.extendedTemplate;

    });
  } else {
    expandPartialPromise = Promise.resolve();
  }

  let lineagePromise;

  //find pattern lineage
  if (!ignoreLineage) {
    lineagePromise.resolve(() => {
      lineage_hunter.find_lineage(pattern, patternlab);
    });
  } else {
    lineagePromise = Promise.resolve();
  }

  const addPromise = Promise.resolve(() => {
    //add to patternlab object so we can look these up later.
    addPattern(pattern, patternlab);
  });

  return Promise.all([expandPartialPromise, lineagePromise, addPromise]);
};
