'use strict';

const logger = require('./lib/log');

let fs = require('fs-extra'); // eslint-disable-line

module.exports = (incrementalBuildsEnabled, patternlab) => {
  const paths = patternlab.config.paths;

  if (incrementalBuildsEnabled) {
    logger.info('Incremental builds enabled.');
    return Promise.resolve();
  } else {
    // needs to be done BEFORE processing patterns
    return fs
      .emptyDir(paths.public.patterns)
      .then(() => {
        return Promise.resolve();
      })
      .catch(reason => {
        logger.error(reason);
      });
  }
};
