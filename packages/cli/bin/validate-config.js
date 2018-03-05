'use strict';
/**
 * @func isValidConfig
 * @desc Checks validity of a patternlab config
 * @param {object} config - Name of the command to check against.
 * @return {object} - Returns true is all is good, false otherwise.
 */
function isValidConfig(config) {
  return !config || typeof config !== 'object';
}

module.exports = isValidConfig;
