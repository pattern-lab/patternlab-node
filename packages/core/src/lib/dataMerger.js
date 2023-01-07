const _ = require('lodash');

/**
 * Merges two objects depending on the configuration and will either merge
 * arrays and only replaces items on the index or replace the entire
 * collection of the different parameters
 *
 * @param {*} dataObject the object that contains the main data
 * @param {*} dataToMergeWithObject the object that should be merged with the original data
 * @param {*} patternlabConfig the patternlab configuration object
 */
module.exports = function (
  dataObject,
  dataToMergeWithObject,
  patternlabConfig
) {
  return _.mergeWith(
    {},
    dataObject,
    dataToMergeWithObject,
    (objValue, srcValue) => {
      if (
        _.isArray(objValue) &&
        // If the parameter is not available after updating pattern lab but
        // not the patternlab-config it should not override arrays.
        patternlabConfig.hasOwnProperty('patternMergeVariantArrays') &&
        !patternlabConfig.patternMergeVariantArrays
      ) {
        return srcValue;
      }
      // Lodash will only check for "undefined" and eslint needs a consistent
      // return so do not remove
      return undefined;
    }
  );
};
