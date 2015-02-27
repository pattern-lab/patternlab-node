/* 
 * patternlab-node - v0.8.1 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

(function () {
	"use strict";

	var diveSync = require('diveSync'),
		path = require('path'),
		fs = require('fs-extra');

	var media_hunter = function(){

		function findMediaQueries(patternlab){
			patternlab.mediaQueries = [];

			diveSync('./source/css', function(err, file){
				if(path.extname(file) === '.css'){
					var contents = fs.readFileSync(file, 'utf8');
					var safeContents = contents.replace("\r", " ").replace("\n", " ");
					var matches = safeContents.match(/\((min|max)-width:([ ]+)?(([0-9]{1,5})(\.[0-9]{1,20}|)(px|em))/g);
					for(var i = 0; i < matches.length; i++){
						var breakpoint = matches[i].substring(matches[i].indexOf(':') + 1).trimLeft();
						if(patternlab.mediaQueries.indexOf(breakpoint) === -1){
							patternlab.mediaQueries.push(breakpoint);
						}
					}
				}
			});	
			//alpha sort for now, but should meet most use-cases except greater than 100ems. you are using ems right?
			patternlab.mediaQueries.sort();
		}

		return {
			find_media_queries: function(patternlab){
				findMediaQueries(patternlab);
			}
		};

	};

	module.exports = media_hunter;

}());

	// protected function gatherMQs() {
		
	// 	$mqs = array();
		
	// 	foreach(glob($this->sd."/css/*.css") as $filename) {
	// 		$data    = file_get_contents($filename);
	// 		preg_match_all("/(min|max)-width:([ ]+)?(([0-9]{1,5})(\.[0-9]{1,20}|)(px|em))/",$data,$matches);
	// 		foreach ($matches[3] as $match) {
	// 			if (!in_array($match,$mqs)) {
	// 				$mqs[] = $match;
	// 			}
	// 		}	
	// 	}
		
	// 	sort($mqs);
	// 	return $mqs;
		
	// }