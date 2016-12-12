"use strict";

const glob = require('glob'),
  fs = require('fs-promise'),
  lh = require('./lineage_hunter'),
  Pattern = require('./object_factory').Pattern,
  plutils = require('./utilities'),
  path = require('path');


function promiseGlobMatches(currentPattern, paths) {
  //look for a pseudo pattern by checking if there is a file containing same
  //name, with ~ in it, ending in .json
  const needle = path.join(currentPattern.subdir, `${currentPattern.fileName}~*.json`);

  return new Promise((resolve, reject) => {
    glob(
      needle,
      { cwd: paths.source.patterns, debug: false, nodir: true },
      function (err, matches) {
        if (err) { reject(err); }
        resolve(matches);
      }
    );

  });
}

function createPseudoPatternObject(variantFileData, pattern, pseudoPattern, patternlab) {
  const variantName = pseudoPattern.substring(pseudoPattern.indexOf('~') + 1).split('.')[0];
  const variantFilePath = path.join(pattern.subdir, `${pattern.fileName}~${variantName}.json`);

  return Pattern.create(variantFilePath, variantFileData, {
    //use the same template as the non-variant
    template: pattern.template,
    fileExtension: pattern.fileExtension,
    extendedTemplate: pattern.extendedTemplate,
    isPseudoPattern: true,
    basePattern: pattern,
    stylePartials: pattern.stylePartials,
    parameteredPartials: pattern.parameteredPartials,

    // use the same template engine as the non-variant
    engine: pattern.engine
  }, patternlab);
}

function processPseudoPattern(patternVariant, patternlab) {
  const pa = require('./pattern_assembler');
  const pattern_assembler = new pa();
  const lineage_hunter = new lh();

  pattern_assembler.parse_pattern_markdown(patternVariant, patternlab);

  //find pattern lineage
  lineage_hunter.find_lineage(patternVariant, patternlab);

  //add to patternlab object so we can look these up later.
  pattern_assembler.addPattern(patternVariant, patternlab);
}

/**
 * The only public API in this module. This will search for pseudo
 * patterns and returns a Promise that resolves when it's done. It
 * doesn't return anything; processPseudoPattern() just updates the
 * global state.
 * @param {Object} currentPattern
 * @param {Object} patternlab
 * @returns {Promise}
 */
function findPseudoPatterns(currentPattern, patternlab) {
  /* eslint-disable no-shadow */
  const paths = patternlab.config.paths;

  return promiseGlobMatches(currentPattern, paths)
    .then(pseudoPatternsPaths => {
      return Promise.all(pseudoPatternsPaths.map(pseudoPatternPath => {
        if (patternlab.config.debug) {
          console.log(`found pseudoPattern variant of ${currentPattern.patternPartial}`);
        }

        // we return a Promise for each file descriptor to form an array
        // of Promises for Promise.all to resolve when they're all
        // complete
        return fs.readJSON(path.resolve(paths.source.patterns, pseudoPatternPath))
          .then(variantFileData => {
            const patternVariant = createPseudoPatternObject(
              plutils.mergeData(currentPattern.jsonFileData, variantFileData),
              currentPattern,
              pseudoPatternPath,
              patternlab
            );

            //process the companion markdown file if it exists
            processPseudoPattern(patternVariant, patternlab);
          })
          .catch(plutils.reportError(
            `There was an error processing the pseudopattern $(pseudoPatternPath)`
          ));
      }));
    })
    .catch(plutils.reportError(
      `There was an error parsing pseudopattern JSON for ${currentPattern.relPath}`
    ));
}

module.exports = {
  find_pseudopatterns: function (pattern, patternlab) {
    return findPseudoPatterns(pattern, patternlab);
  }
};
