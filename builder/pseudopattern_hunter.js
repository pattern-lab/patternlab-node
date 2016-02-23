/* 
 * patternlab-node - v1.1.2 - 2016 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
	"use strict";

	var pseudopattern_hunter = function(){

		function findpseudopatterns(currentPattern, patternlab){

			var glob = require('glob'),
			fs = require('fs-extra'),
			pa = require('./pattern_assembler'),
			lh = require('./lineage_hunter'),
			of = require('./object_factory'),
			path = require('path');

			var pattern_assembler = new pa();
			var lineage_hunter = new lh();
			var paths = patternlab.config.paths;

			//look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
			var needle = currentPattern.subdir + '/' + currentPattern.fileName + '~*.json';
			var pseudoPatterns = glob.sync(needle, {
				cwd: paths.source.patterns,
				debug: false,
				nodir: true,
			});

			if(pseudoPatterns.length > 0){

				for(var i = 0; i < pseudoPatterns.length; i++){

					if(patternlab.config.debug){
						console.log('found pseudoPattern variant of ' + currentPattern.key);
					}

					//we want to do everything we normally would here, except instead read the pseudoPattern data
					var variantFileData = fs.readJSONSync(path.resolve(paths.source.patterns, pseudoPatterns[i]));

					//extend any existing data with variant data
					variantFileData = pattern_assembler.merge_data(currentPattern.jsonFileData, variantFileData);

					var variantName = pseudoPatterns[i].substring(pseudoPatterns[i].indexOf('~') + 1).split('.')[0];
					var variantFilePath = path.resolve(paths.source.patterns, currentPattern.subdir, currentPattern.fileName + '~' + variantName + '.json');
					var variantFileName = currentPattern.fileName + '-' + variantName + '.';
					var patternVariant = new of.oPattern(variantFilePath, currentPattern.subdir, variantFileName, variantFileData);

					//see if this file has a state
					pattern_assembler.setPatternState(patternVariant, patternlab);

					//use the same template as the non-variant
					patternVariant.template = currentPattern.template;
					patternVariant.extendedTemplate = currentPattern.extendedTemplate;

					//find pattern lineage
					lineage_hunter.find_lineage(patternVariant, patternlab);

					//add to patternlab object so we can look these up later.
					pattern_assembler.addPattern(patternVariant, patternlab);
				}
			}

		}

		return {
			find_pseudopatterns: function(pattern, patternlab){
				findpseudopatterns(pattern, patternlab);
			}
		};

	};

	module.exports = pseudopattern_hunter;

}());
