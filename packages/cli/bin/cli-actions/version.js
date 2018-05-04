'use strict';
const patternlab = require('@pattern-lab/core');

module.exports = ({ version }) => {
  `${version} (PatternLab Node Core version: ${patternlab.getVersion()})`;
};
