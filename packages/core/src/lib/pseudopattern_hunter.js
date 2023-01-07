'use strict';

const ch = require('./changes_hunter');
const glob = require('glob');
const fs = require('fs-extra');
const _ = require('lodash');
const lh = require('./lineage_hunter');
const Pattern = require('./object_factory').Pattern;
const path = require('path');
const addPattern = require('./addPattern');
const logger = require('./log');
const readDocumentation = require('./readDocumentation');
const lineage_hunter = new lh();
const changes_hunter = new ch();
const yaml = require('js-yaml');
const dataMerger = require('./dataMerger');

const pseudopattern_hunter = function () {};

pseudopattern_hunter.prototype.find_pseudopatterns = function (
  currentPattern,
  patternlab
) {
  const paths = patternlab.config.paths;

  //look for a pseudo pattern by checking if there is a file containing same
  //name, with ~ in it, ending in .json, .yml or .yaml
  const needle =
    currentPattern.subdir +
    '/' +
    currentPattern.fileName +
    '~*.{json,yml,yaml}';
  const pseudoPatterns = glob.sync(needle, {
    cwd: paths.source.patterns,
    debug: false,
    nodir: true,
  });

  if (pseudoPatterns.length > 0) {
    for (let i = 0; i < pseudoPatterns.length; i++) {
      logger.debug(
        `Found pseudoPattern variant of ${currentPattern.patternPartial}`
      );

      //we want to do everything we normally would here, except instead read the pseudoPattern data
      let variantFileFullPath;
      let variantFileData;
      try {
        variantFileFullPath = path.resolve(
          paths.source.patterns,
          pseudoPatterns[i]
        );
        variantFileData = yaml.load(
          fs.readFileSync(variantFileFullPath, 'utf8')
        );
      } catch (err) {
        logger.error(
          `There was an error parsing pseudopattern JSON for ${currentPattern.relPath}`
        );
        logger.error(err);
      }

      //extend any existing data with variant data
      variantFileData = dataMerger(
        currentPattern.jsonFileData,
        variantFileData,
        patternlab.config
      );

      const variantName = pseudoPatterns[i]
        .substring(pseudoPatterns[i].indexOf('~') + 1)
        .split('.')[0];
      const variantExtension = pseudoPatterns[i].split('.').slice(-1).pop();
      const variantFilePath = path.join(
        currentPattern.subdir,
        currentPattern.fileName + '~' + variantName + '.' + variantExtension
      );
      const lm = fs.statSync(variantFileFullPath);
      const patternVariant = Pattern.create(
        variantFilePath,
        variantFileData,
        {
          //use the same template as the non-variant
          template: currentPattern.template,
          fileExtension: currentPattern.fileExtension,
          extendedTemplate: currentPattern.extendedTemplate,
          isPseudoPattern: true,
          basePattern: currentPattern,
          parameteredPartials: currentPattern.parameteredPartials,

          // Only regular patterns are discovered during iterative walks
          // Need to recompile on data change or template change
          lastModified: Math.max(currentPattern.lastModified, lm.mtime),

          // use the same template engine as the non-variant
          engine: currentPattern.engine,
        },
        patternlab
      );
      patternVariant.order = _.clone(currentPattern.order);
      patternVariant.hidden = _.clone(currentPattern.hidden);

      changes_hunter.checkBuildState(patternVariant, patternlab);
      patternlab.graph.add(patternVariant);
      patternlab.graph.link(patternVariant, currentPattern);

      //process the companion markdown file if it exists
      readDocumentation(patternVariant, patternlab, true);

      //find pattern lineage
      lineage_hunter.find_lineage(patternVariant, patternlab);

      //add to patternlab object so we can look these up later.
      addPattern(patternVariant, patternlab);
    }

    // GTP: this is to emulate the behavior of the stale asynced
    // version; when we have time, we can make all the FS calls in here
    // async and see if it helps any, but it didn't when I tried it.
  }
  return Promise.resolve();
};

module.exports = new pseudopattern_hunter();
