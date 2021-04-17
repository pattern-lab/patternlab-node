'use strict';

const list_item_hunter = function () {
  const logger = require('./log');

  function processListItemPartials(pattern) {
    //find any listitem blocks
    const matches = pattern.findListItems();

    if (matches !== null) {
      return matches.reduce((previousMatchPromise, liMatchStart) => {
        return previousMatchPromise.then(() => {
          logger.debug(
            `found listItem of size ${liMatchStart} inside ${pattern.patternPartial}`
          );

          //we found a listitem match
          //replace it's beginning listitems.number with -number
          const newStart = liMatchStart.replace('.', '-');
          pattern.extendedTemplate = pattern.extendedTemplate.replace(
            liMatchStart,
            newStart
          );

          //replace it's ending listitems.number with -number
          const liMatchEnd = liMatchStart.replace('#', '/');
          const newEnd = liMatchEnd.replace('.', '-');
          pattern.extendedTemplate = pattern.extendedTemplate.replace(
            liMatchEnd,
            newEnd
          );

          return Promise.resolve();
        });
      }, Promise.resolve());
    } else {
      return Promise.resolve();
    }
  }

  return {
    process_list_item_partials: function (pattern) {
      return processListItemPartials(pattern);
    },
  };
};

module.exports = list_item_hunter;
