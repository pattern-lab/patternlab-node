"use strict";

const ch = require('./changes_hunter');
const glob = require('glob');
const fs = require('fs-extra');
const lh = require('./lineage_hunter');
const Pattern = require('./object_factory').Pattern;
const plutils = require('./utilities');
const path = require('path');
const lineage_hunter = new lh();
const changes_hunter = new ch();

const pseudopattern_hunter = function () {};

pseudopattern_hunter.prototype.find_pseudopatterns = function (currentPattern, patternlab) {
  const pa = require('./pattern_assembler');
  const pattern_assembler = new pa();

  const paths = patternlab.config.paths;

  //look for a pseudo pattern by checking if there is a file containing same
  //name, with ~ in it, ending in .json
  const needle = currentPattern.subdir + '/' + currentPattern.fileName + '~*.json';
  const pseudoPatterns = glob.sync(needle, {
    cwd: paths.source.patterns,
    debug: false,
    nodir: true
  });

  if (pseudoPatterns.length > 0) {
    for (let i = 0; i < pseudoPatterns.length; i++) {
      if (patternlab.config.debug) {
        console.log('found pseudoPattern variant of ' + currentPattern.patternPartial);
      }

      //we want to do everything we normally would here, except instead read the pseudoPattern data
      try {
        var variantFileFullPath = path.resolve(paths.source.patterns, pseudoPatterns[i]);
        var variantFileData = fs.readJSONSync(variantFileFullPath);
      } catch (err) {
        console.log('There was an error parsing pseudopattern JSON for ' + currentPattern.relPath);
        console.log(err);
      }

      //extend any existing data with variant data
      variantFileData = plutils.mergeData(currentPattern.jsonFileData, variantFileData);

      let variantName = pseudoPatterns[i].substring(pseudoPatterns[i].indexOf('~') + 1).split('.')[0];
      let variantFilePath = path.join(currentPattern.subdir, currentPattern.fileName + '~' + variantName + '.json');
      let lm = fs.statSync(variantFileFullPath);
      let patternVariant = Pattern.create(variantFilePath, variantFileData, {
        //use the same template as the non-variant
        template: currentPattern.template,
        fileExtension: currentPattern.fileExtension,
        extendedTemplate: currentPattern.extendedTemplate,
        isPseudoPattern: true,
        basePattern: currentPattern,
        stylePartials: currentPattern.stylePartials,
        parameteredPartials: currentPattern.parameteredPartials,

        // Only regular patterns are discovered during iterative walks
        // Need to recompile on data change or template change
        lastModified: Math.max(currentPattern.lastModified, lm.mtime),

        // use the same template engine as the non-variant
        engine: currentPattern.engine
      }, patternlab);

      changes_hunter.checkBuildState(patternVariant, patternlab);
      patternlab.graph.add(patternVariant);
      patternlab.graph.link(patternVariant, currentPattern);

      //process the companion markdown file if it exists
      pattern_assembler.parse_pattern_markdown(patternVariant, patternlab);

      //find pattern lineage
      lineage_hunter.find_lineage(patternVariant, patternlab);

      //add to patternlab object so we can look these up later.
      pattern_assembler.addPattern(patternVariant, patternlab);

      //we want to do everything we normally would here, except instead read the pseudoPattern data
      try {
        var variantFileFullPath = path.resolve(paths.source.patterns, pseudoPatterns[i]);
        var variantFileData = fs.readJSONSync(variantFileFullPath);
      } catch (err) {
        console.log('There was an error parsing pseudopattern JSON for ' + currentPattern.relPath);
        console.log(err);
      }

      //extend any existing data with variant data
      variantFileData = plutils.mergeData(currentPattern.jsonFileData, variantFileData);

      variantName = pseudoPatterns[i].substring(pseudoPatterns[i].indexOf('~') + 1).split('.')[0];
      variantFilePath = path.join(currentPattern.subdir, currentPattern.fileName + '~' + variantName + '.json');
      lm = fs.statSync(variantFileFullPath);
      patternVariant = Pattern.create(variantFilePath, variantFileData, {
        //use the same template as the non-variant
        template: currentPattern.template,
        fileExtension: currentPattern.fileExtension,
        extendedTemplate: currentPattern.extendedTemplate,
        isPseudoPattern: true,
        basePattern: currentPattern,
        stylePartials: currentPattern.stylePartials,
        parameteredPartials: currentPattern.parameteredPartials,

        // Only regular patterns are discovered during iterative walks
        // Need to recompile on data change or template change
        lastModified: Math.max(currentPattern.lastModified, lm.mtime),

        // use the same template engine as the non-variant
        engine: currentPattern.engine
      }, patternlab);

      changes_hunter.checkBuildState(patternVariant, patternlab);
      patternlab.graph.add(patternVariant);
      patternlab.graph.link(patternVariant, currentPattern);

      //process the companion markdown file if it exists
      pattern_assembler.parse_pattern_markdown(patternVariant, patternlab);

      //find pattern lineage
      lineage_hunter.find_lineage(patternVariant, patternlab);

      //add to patternlab object so we can look these up later.
      pattern_assembler.addPattern(patternVariant, patternlab);
    }

    // GTP: this is to emulate the behavior of the stale asynced
    // version; when we have time, we can make all the FS calls in here
    // async and see if it helps any, but it didn't when I tried it.
  }
  return Promise.resolve();
};

module.exports = new pseudopattern_hunter();
