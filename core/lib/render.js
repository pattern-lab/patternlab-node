"use strict";

module.exports = function (pattern, data, partials) {
  return pattern.render(data, partials);
};
