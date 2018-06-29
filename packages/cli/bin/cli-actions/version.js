'use strict';
const patternlab = require('@pattern-lab/core');

module.exports = ({ version }) =>
  `${version} (Pattern Lab Node Core version: ${patternlab.getVersion()})`;
