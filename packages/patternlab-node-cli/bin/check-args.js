'use strict';
const error = require('./utils').error;

/**
 * @func checkArgs
 * @desc Checks if a <cmd> is allowed.
 * @param {string} cmd - Name of the command to check against.
 * @throws Will throw an error if the passed <cmd> is not allowed and exits with 1.
 * @return {object} - Returns true is all is good.
 */
function checkArgs(cmd) {
	/**
	 * An immutable whitelist to check incoming <cmd> against
	 */
	const CMD_WHITELIST = Object.freeze(['browse', 'build', 'compile', 'init', 'export', 'serve']);
	
	// Check if a <cmd> was specified. If not → bail out
	if (typeof cmd === 'undefined') {
		error('patternlab: Sorry, no command <cmd> was specified! Type `patternlab --help` to view all available commands and options.');
		process.exit(1);
	}
	
	// Check if <cmd> is on our command whitelist. If not → bail out. Probably Inquirer handles this scenario as well
	if (CMD_WHITELIST.indexOf(cmd)) {
		error('patternlab: Yikes, your command `' + cmd + '` is not supported. Type `patternlab --help` to view all available commands and options.');
		process.exit(1);
	}
	return true;
}

module.exports = checkArgs;
