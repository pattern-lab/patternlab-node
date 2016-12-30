'use strict';
const path = require('path');
const exists = require('path-exists');
const debug = require('./utils').debug;

/**
 * @func checkOverwrites
 * @desc Checks whether a path exists and if it should be replaced.
 * @param {string} input - User input from inquirer.
 * @return {boolean} - Returns true if all went good.
 */
function checkOverwrites(input) {
	// Checks if project root exists to avoid overwriting.
	const inputPath = path.resolve(input);
	if (exists.sync(inputPath)) {
		// TODO: We might wanna add some more checks here. Currently CLI only displays a warning.
		debug(`\n patternlab→init: The directory (${inputPath}) already exists and is not empty. Proceed on your own risk.`);
	}
	return true;
}

module.exports = checkOverwrites;
