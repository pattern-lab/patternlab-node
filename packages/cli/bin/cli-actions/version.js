'use strict';
const patternlab = require('@pattern-lab/core');
const config = Object.assign(patternlab.getDefaultConfig(), {
	logLevel: 'quiet',
});

module.exports = ({ version }) =>
	`${version} (PatternLab Node Core version: ${patternlab(config).v()})`;
