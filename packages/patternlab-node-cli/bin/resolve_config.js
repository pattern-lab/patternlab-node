'use strict';

const path = require('path');
const error = require('./utils').error;
const readJsonAsync = require('./utils').readJsonAsync;
const wrapAsync = require('./utils').wrapAsync;

/**
 * @func resolveConfig
 * @desc Resolves the given PatternLab config file.
 * @param {string} [configPath=./patternlab-config.json] - Path to the patternlab-config.json. Defaults to project dir.
 * @return {object|boolean} Returns the config object or false otherwise.
 */
function resolveConfig(configPath) {
	return wrapAsync(function*() {
		// If config path is set but not a string
		if (arguments.length && typeof configPath !== 'string') {
			throw new TypeError('patternlab→resolveConfig: If configPath is set, it is expected to be of type string.');
		}
		
		/**
		 * Setup the config.
		 * 1. Check if user specified custom PatternLab config location
		 * 2. Read the config file
		 */
		try {
			const absoluteConfigPath = path.resolve(configPath); // 1
			return yield readJsonAsync(absoluteConfigPath); // 2
		} catch (err) {
			error('patternlab→resolveConfig: Oops, got an error during parsing your PatternLab config. Please make sure your config file exists.');
			error(err);
		}
		return false;
	});
}

module.exports = resolveConfig;
