'use strict';

const logger = require('./log');
const events = require('./events');

let copy = require('recursive-copy'); // eslint-disable-line prefer-const

const copyFile = (p, dest, options) => {
  return copy(p, dest, options)
    .on(copy.events.ERROR, function (error, copyOperation) {
      logger.error('Unable to copy ' + copyOperation.dest);
    })
    .on(copy.events.COPY_FILE_ERROR, (error) => {
      logger.error(error);
    })
    .on(copy.events.COPY_FILE_COMPLETE, () => {
      logger.debug(`Moved ${p} to ${dest}`);
      options.emitter.emit(events.PATTERNLAB_PATTERN_ASSET_CHANGE, {
        file: p,
        dest: dest,
      });
    });
};

module.exports = copyFile;
