'use strict';

const logger = require('./log');

module.exports = function (pattern, data, partials) {
  logger.debug(
    `render: ${
      pattern.patternPartial !== '-.'
        ? pattern.patternPartial
        : 'ad hoc partial with template' + pattern.extendedTemplate
    }`
  );
  return pattern.render(data, partials);
};
