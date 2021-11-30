'use strict';

const path = require('path');

const Pattern = require('./object_factory').Pattern;
const decompose = require('./decompose');
const logger = require('./log');

//this may be mocked in unit tests, so let it be overridden
let fs = require('fs-extra'); // eslint-disable-line

module.exports = function (fileName, metaType, patternlab) {
  const metaPath = path.resolve(patternlab.config.paths.source.meta, fileName);
  const metaPattern = new Pattern(metaPath, null, patternlab);
  metaPattern.template = fs.readFileSync(metaPath, 'utf8');
  metaPattern.isPattern = false;
  metaPattern.isMetaPattern = true;
  return decompose(metaPattern, patternlab, true)
    .then(() => {
      patternlab[metaType] = metaPattern;
    })
    .catch((reason) => {
      logger.warning(
        `Could not find the user-editable template ${fileName}, currently configured to be at ${patternlab.config.paths.source.meta}. Your configured path may be incorrect (check paths.source.meta in your config file), the file may have been deleted, or it may have been left in the wrong place during a migration or update.`
      );
      logger.warning(reason);
    });
};
