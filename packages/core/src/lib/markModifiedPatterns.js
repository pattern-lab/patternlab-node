'use strict';

const path = require('path');
const _ = require('lodash');

const CompileState = require('./object_factory').CompileState;
const ch = require('./changes_hunter');
const changes_hunter = new ch();

//this is mocked in unit tests
let fs = require('fs-extra'); //eslint-disable-line prefer-const

/**
 * Finds patterns that were modified and need to be rebuilt. For clean patterns load the already
 * rendered markup.
 *
 * @param lastModified
 * @param patternlab
 */
module.exports = function (lastModified, patternlab) {
  /**
   * If the given array exists, apply a function to each of its elements
   * @param {Array} array
   * @param {Function} func
   */
  const forEachExisting = (array, func) => {
    if (array) {
      array.forEach(func);
    }
  };
  const modifiedOrNot = _.groupBy(patternlab.patterns, (p) =>
    changes_hunter.needsRebuild(lastModified, p) ? 'modified' : 'notModified'
  );

  // For all unmodified patterns load their rendered template output
  forEachExisting(modifiedOrNot.notModified, (cleanPattern) => {
    _.each(patternlab.uikits, (uikit) => {
      const xp = path.join(
        process.cwd(),
        uikit.outputDir,
        patternlab.config.paths.public.patterns,
        cleanPattern.getPatternLink(patternlab, 'markupOnly')
      );

      // Pattern with non-existing markupOnly files were already marked for rebuild and thus are not "CLEAN"
      cleanPattern.patternPartialCode = fs.readFileSync(xp, 'utf8');
    });
  });

  // For all patterns that were modified, schedule them for rebuild
  forEachExisting(
    modifiedOrNot.modified,
    (p) => (p.compileState = CompileState.NEEDS_REBUILD)
  );
  return modifiedOrNot;
};
