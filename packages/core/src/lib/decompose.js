'use strict';

const logger = require('./log');
const lh = require('./lineage_hunter');
const lih = require('./list_item_hunter');
const addPattern = require('./addPattern');
const expandPartials = require('./expandPartials');

const lineage_hunter = new lh();
const list_item_hunter = new lih();

/**
 * A helper that unravels a pattern looking for partials or listitems to unravel.
 * The goal is really to convert pattern.template into pattern.extendedTemplate
 * @param pattern - the pattern to decompose
 * @param patternlab - global data store
 * @param ignoreLineage - whether or not to hunt for lineage for this pattern
 */
module.exports = function (pattern, patternlab, ignoreLineage) {
  //set the extendedTemplate to operate on later if we find partials to replace
  if (!pattern.extendedTemplate) {
    pattern.extendedTemplate = pattern.template;
  }

  //find any listItem blocks that within the pattern, even if there are no partials
  const listItemPromise = list_item_hunter.process_list_item_partials(
    pattern,
    patternlab
  );

  const expandPartialPromise = expandPartials(pattern, patternlab);

  let lineagePromise;

  //find pattern lineage
  if (!ignoreLineage) {
    lineagePromise = Promise.resolve(
      lineage_hunter.find_lineage(pattern, patternlab)
    );
  } else {
    lineagePromise = Promise.resolve();
  }

  const addPromise = Promise.resolve(() => {
    //add to patternlab object so we can look these up later.
    addPattern(pattern, patternlab);
  });

  return Promise.all([
    listItemPromise,
    expandPartialPromise,
    lineagePromise,
    addPromise,
  ]).catch((reason) => {
    logger.error(reason);
  });
};
