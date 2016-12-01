"use strict";

var ch = require('./changes_hunter');

var pseudopattern_hunter = function () {

  function findpseudopatterns(currentPattern, patternlab) {
    var glob = require('glob'),
      fs = require('fs-extra'),
      pa = require('./pattern_assembler'),
      lh = require('./lineage_hunter'),
      Pattern = require('./object_factory').Pattern,
      plutils = require('./utilities'),
      path = require('path');


    var pattern_assembler = new pa();
    var lineage_hunter = new lh();
    var changes_hunter = new ch();
    var paths = patternlab.config.paths;

    //look for a pseudo pattern by checking if there is a file containing same
    //name, with ~ in it, ending in .json
    var needle = currentPattern.subdir + '/' + currentPattern.fileName + '~*.json';
    var pseudoPatterns = glob.sync(needle, {
      cwd: paths.source.patterns,
      debug: false,
      nodir: true
    });

    if (pseudoPatterns.length > 0) {
      for (var i = 0; i < pseudoPatterns.length; i++) {
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

        var variantName = pseudoPatterns[i].substring(pseudoPatterns[i].indexOf('~') + 1).split('.')[0];
        var variantFilePath = path.join(currentPattern.subdir, currentPattern.fileName + '~' + variantName + '.json');
        var lm = fs.statSync(variantFileFullPath);
        var patternVariant = Pattern.create(variantFilePath, variantFileData, {
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
    }
  }

  return {
    find_pseudopatterns: function (pattern, patternlab) {
      findpseudopatterns(pattern, patternlab);
    }
  };

};

module.exports = pseudopattern_hunter;
