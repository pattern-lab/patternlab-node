'use strict';

const jsonCopy = require('./json_copy');
const logger = require('./log');
const of = require('./object_factory');
const Pattern = of.Pattern;

let render = require('./render'); //eslint-disable-line prefer-const

/**
 * Builds footer HTML from the general footer and user-defined footer
 * @param patternlab - global data store
 * @param patternPartial - the partial key to build this for, either viewall-patternPartial or a viewall-patternGroup-all
 * @returns A promise which resolves with the HTML
 */
module.exports = function (patternlab, patternPartial, uikit) {
  //first render the general footer
  return render(Pattern.createEmpty({ extendedTemplate: uikit.footer }), {
    patternData: JSON.stringify({
      patternPartial: patternPartial,
    }),
    cacheBuster: patternlab.cacheBuster,
  })
    .then((footerPartial) => {
      let allFooterData;
      try {
        allFooterData = jsonCopy(
          patternlab.data,
          'config.paths.source.data plus patterns data'
        );
      } catch (err) {
        logger.error('There was an error parsing JSON for patternlab.data');
        logger.error(err);
      }
      allFooterData.patternLabFoot = footerPartial;

      return render(patternlab.userFoot, allFooterData);
    })
    .catch((reason) => {
      console.log(reason);
      logger.error('Error building buildFooterHTML');
    });
};
