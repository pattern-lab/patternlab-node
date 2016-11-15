"use strict";

var glob = require('glob'),
  fs = require('fs-promise'),
  lh = require('./lineage_hunter'),
  Pattern = require('./object_factory').Pattern,
  plutils = require('./utilities'),
  path = require('path'),
  async = require('async');


function promiseGlobMatches(currentPattern, paths) {
  //look for a pseudo pattern by checking if there is a file containing same
    //name, with ~ in it, ending in .json
  var needle = currentPattern.subdir + '/' + currentPattern.fileName + '~*.json';

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

function findpseudopatterns(currentPattern, patternlab) {
  /* eslint-disable no-shadow */
  var pa = require('./pattern_assembler');

  var pattern_assembler = new pa();
  var lineage_hunter = new lh();
  var paths = patternlab.config.paths;

  return promiseGlobMatches(currentPattern, paths).then((pseudoPatterns) => {
    const promises = pseudoPatterns.map((pseudoPattern) => {
      console.log('found pseudoPattern variant of ' + currentPattern.patternPartial);
      if (patternlab.config.debug) {
        console.log('found pseudoPattern variant of ' + currentPattern.patternPartial);
      }

      //we want to do everything we normally would here, except instead read the pseudoPattern data
      return fs.readJSON(path.resolve(paths.source.patterns, pseudoPattern)).then((variantFileData) => {
        console.log('found a pseudopattern file!');
        //extend any existing data with variant data
        variantFileData = plutils.mergeData(currentPattern.jsonFileData, variantFileData);

        var variantName = pseudoPattern.substring(pseudoPattern.indexOf('~') + 1).split('.')[0];
        var variantFilePath = path.join(currentPattern.subdir, currentPattern.fileName + '~' + variantName + '.json');
        var patternVariant = Pattern.create(variantFilePath, variantFileData, {
          //use the same template as the non-variant
          template: currentPattern.template,
          fileExtension: currentPattern.fileExtension,
          extendedTemplate: currentPattern.extendedTemplate,
          isPseudoPattern: true,
          basePattern: currentPattern,
          stylePartials: currentPattern.stylePartials,
          parameteredPartials: currentPattern.parameteredPartials,

          // use the same template engine as the non-variant
          engine: currentPattern.engine
        }, patternlab);
        console.log('- variant name:', variantName);

        //process the companion markdown file if it exists
        pattern_assembler.parse_pattern_markdown(patternVariant, patternlab);

        //find pattern lineage
        lineage_hunter.find_lineage(patternVariant, patternlab);

        //add to patternlab object so we can look these up later.
        console.log("adding pattern variant", patternVariant.verbosePartial);
        pattern_assembler.addPattern(patternVariant, patternlab);
      }).catch((err) => {
        console.log('There was an error parsing pseudopattern JSON for ' + currentPattern.relPath);
        console.log(err);
      });
    });

    return Promise.all(promises);
  }).catch((err) => {
    console.log('There was an error parsing pseudopattern JSON for ' + currentPattern.relPath);
    console.log(err);
  });
}

module.exports = {
  find_pseudopatterns: function (pattern, patternlab) {
    return findpseudopatterns(pattern, patternlab);
  }
};
