'use strict';

const _ = require('lodash');
const path = require('path');

const logger = require('./log');

let fs = require('fs-extra'); // eslint-disable-line

module.exports = (incrementalBuildsEnabled, patternlab) => {
  const paths = patternlab.config.paths;

  if (incrementalBuildsEnabled) {
    logger.info('Incremental builds enabled.');
    return Promise.resolve();
  } else {
    return Promise.all(
      _.map(patternlab.uikits, (uikit) => {
        return fs.emptyDir(
          path.join(process.cwd(), uikit.outputDir, paths.public.patterns)
        );
      })
    ).catch((reason) => {
      logger.error(reason);
    });
  }
};
