'use strict';

const logger = require('./log');

let fs = require('fs-extra'); // eslint-disable-line

module.exports = (incrementalBuildsEnabled, patternlab) => {
  const paths = patternlab.config.paths;

  if (incrementalBuildsEnabled) {
    logger.info('Incremental builds enabled.');
    return Promise.resolve();
  } else {
    // needs to be done BEFORE processing patterns

    // TODO make this a promise that loops over all uikits

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
