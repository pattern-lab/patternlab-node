/* 
 * patternlab-node - v0.8.1 - 2015 
 * 
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license. 
 * 
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. 
 *
 */

var patternlab_engine = function(){
	var path = require('path'),
		fs = require('fs-extra'),
		extend = require('util')._extend,
		diveSync = require('diveSync'),
		mustache = require('mustache'),
		glob = require('glob'),
		of = require('./object_factory'),
		pa = require('./pattern_assembler'),
		mh = require('./media_hunter'),
		lh = require('./lineage_hunter'),
		pe = require('./pattern_exporter'),
		pa = require('./pattern_assembler'),
		he = require('html-entities').AllHtmlEntities,
		patternlab = {};

	patternlab.package =fs.readJSONSync('./package.json');
	patternlab.config = fs.readJSONSync('./config.json');

	function getVersion() {
		console.log(patternlab.package.version);
	}

	function help(){
		console.log('Patternlab Node Help');
		console.log('===============================');
		console.log('Command Line Arguments');
		console.log('patternlab:only_patterns');
		console.log(' > Compiles the patterns only, outputting to ./public/patterns');
		console.log('patternlab:v');
		console.log(' > Retrieve the version of patternlab-node you have installed');
		console.log('patternlab:help');
		console.log(' > Get more information about patternlab-node, pattern lab in general, and where to report issues.');
		console.log('===============================');
		console.log('Visit http://patternlab.io/docs/index.html for general help on pattern-lab');
		console.log('Visit https://github.com/pattern-lab/patternlab-node/issues to open a bug.');
	}

	function printDebug() {
		//debug file can be written by setting flag on config.json
		if(patternlab.config.debug){
			console.log('writing patternlab debug file to ./patternlab.json');
			fs.outputFileSync('./patternlab.json', JSON.stringify(patternlab, null, 3));
		}
	}

	function buildPatterns(callback){
		var assembler = new pa();

		patternlab.data = fs.readJSONSync('./source/_data/data.json');
		patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
		patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
		patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
		patternlab.patterns = [];
		patternlab.partials = {};
		patternlab.data.link = {};

		diveSync('./source/_patterns', function(err, file){

			//log any errors
			if(err){
				console.log(err);
				return;
			}

			//extract some information
			var abspath = file.substring(2);
			var subdir = path.dirname(path.relative('./source/_patterns', file));
			var filename = path.basename(file);

			//ignore _underscored patterns, json (for now), and dotfiles
			if(filename.charAt(0) === '_' || path.extname(filename) === '.json' || filename.charAt(0) === '.'){
				return;
			}

			//TODO: https://github.com/pattern-lab/patternlab-node/issues/88 check for pattern parameters before we do much else. need to remove them into a data object so the rest of the filename parsing works
			//TODO: https://github.com/pattern-lab/patternlab-node/issues/95 check for patternstylemodifiers before we do much else. need to remove these from the template for proper rendering

			//make a new Pattern Object
			currentPattern = new of.oPattern(subdir, filename);

			//see if this file has a state
			assembler.setPatternState(currentPattern, patternlab);

			//look for a json file for this template
			try {
				var jsonFilename = abspath.substr(0, abspath.lastIndexOf(".")) + ".json";
				currentPattern.data = fs.readJSONSync(jsonFilename);
			}
			catch(e) {

			}
			currentPattern.template = fs.readFileSync(abspath, 'utf8');

			//find pattern lineage
			var lineage_hunter = new lh();
			lineage_hunter.find_lineage(currentPattern, patternlab);

			//add as a partial in case this is referenced later.  convert to syntax needed by existing patterns
			var sub = subdir.substring(subdir.indexOf('-') + 1);
			var folderIndex = sub.indexOf(path.sep);
			var cleanSub = sub.substring(0, folderIndex);

			//add any templates found to an object of partials, so downstream templates may use them too
			//look for the full path on nested patters, else expect it to be flat
			var partialname = '';
			if(cleanSub !== ''){
				partialname = cleanSub + '-' + currentPattern.patternName;
			} else{
				partialname = currentPattern.patternGroup + '-' + currentPattern.patternName;
			}
			patternlab.partials[partialname] = currentPattern.template;

			//look for a pseudo pattern by checking if there is a file containing same name, with ~ in it, ending in .json
			var needle = currentPattern.subdir + '/' + currentPattern.fileName+ '~*.json';
			var pseudoPatterns = glob.sync(needle, {
				cwd: 'source/_patterns/', //relative to gruntfile
				debug: false,
				nodir: true,
			});

			if(pseudoPatterns.length > 0){
				for(var i = 0; i < pseudoPatterns.length; i++){
					//we want to do everything we normally would here, except instead head the pseudoPattern data
					var variantFileData = fs.readJSONSync('source/_patterns/' + pseudoPatterns[i]);

					//extend any existing data with variant data
					variantFileData = extend(variantFileData, currentPattern.data);

					var variantName = pseudoPatterns[i].substring(pseudoPatterns[i].indexOf('~') + 1).split('.')[0];
					var patternVariant = new of.oPattern(subdir, currentPattern.fileName + '-' + variantName + '.mustache', variantFileData);

					//see if this file has a state
					assembler.setPatternState(patternVariant, patternlab);

					//use the same template as the non-variant
					patternVariant.template = currentPattern.template;

					//find pattern lineage
					lineage_hunter.find_lineage(patternVariant, patternlab);

					//add to patternlab object so we can look these up later.
					assembler.addPattern(patternVariant, patternlab);
				}
			}

			//add to patternlab object so we can look these up later.
			assembler.addPattern(currentPattern, patternlab);
		});

		var entity_encoder = new he();

		//render all patterns last, so lineageR works
		patternlab.patterns.forEach(function(pattern, index, patterns){

			//render the pattern. pass partials and data
			if(pattern.data) { // Pass found pattern-specific JSON as data

				//extend pattern data links into link for pattern link shortcuts to work. we do this locally and globally
				pattern.data.link = extend({}, patternlab.data.link);

				pattern.patternPartial = renderPattern(pattern.template, pattern.data, patternlab.partials);
			}else{ // Pass global patternlab data
				pattern.patternPartial = renderPattern(pattern.template, patternlab.data, patternlab.partials);
			}

			//add footer info before writing
			var patternFooter = renderPattern(patternlab.footer, pattern);

			//write the compiled template to the public patterns directory
			fs.outputFileSync('./public/patterns/' + pattern.patternLink, patternlab.header + pattern.patternPartial + patternFooter);

			//write the mustache file too
			fs.outputFileSync('./public/patterns/' + pattern.patternLink.replace('.html', '.mustache'), entity_encoder.encode(pattern.template));

			//write the encoded version too
			fs.outputFileSync('./public/patterns/' + pattern.patternLink.replace('.html', '.escaped.html'), entity_encoder.encode(pattern.patternPartial));
		});

		//export patterns if necessary
		var pattern_exporter = new pe();
		pattern_exporter.export_patterns(patternlab);

	}

	function buildFrontEnd(){
		patternlab.buckets = [];
		patternlab.bucketIndex = [];
		patternlab.patternPaths = {};
		patternlab.viewAllPaths = {};

		//find mediaQueries
		var media_hunter = new mh();
		media_hunter.find_media_queries(patternlab);

		//build the styleguide
		var styleguideTemplate = fs.readFileSync('./source/_patternlab-files/styleguide.mustache', 'utf8');
		var styleguideHtml = renderPattern(styleguideTemplate, {partials: patternlab.patterns});
		fs.outputFileSync('./public/styleguide/html/styleguide.html', styleguideHtml);

		//build the patternlab website
		var patternlabSiteTemplate = fs.readFileSync('./source/_patternlab-files/index.mustache', 'utf8');
		
		//loop through all patterns.  deciding to do this separate from the recursion, even at a performance hit, to attempt to separate the tasks of styleguide creation versus site menu creation
		for(var i = 0; i < patternlab.patterns.length; i++){
			var pattern = patternlab.patterns[i];
			var bucketName = pattern.name.replace(/\\/g, '-').split('-')[1];

			//check if the bucket already exists
			var bucketIndex = patternlab.bucketIndex.indexOf(bucketName);
			if(bucketIndex === -1){
				//add the bucket
				var bucket = new of.oBucket(bucketName);

				//add paternPath
				patternlab.patternPaths[bucketName] = {};

				//get the navItem
				var navItemName = pattern.subdir.split('-').pop();

				//get the navSubItem
				var navSubItemName = pattern.patternName.replace(/-/g, ' ');

				//test whether the pattern struture is flat or not - usually due to a template or page
				var flatPatternItem = false;
				if(navItemName === bucketName){
					flatPatternItem = true;
				}

				//assume the navItem does not exist.
				var navItem = new of.oNavItem(navItemName);

				//assume the navSubItem does not exist.
				var navSubItem = new of.oNavSubItem(navSubItemName);
				navSubItem.patternPath = pattern.patternLink;
				navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

				//add the patternState if it exists
				if(pattern.patternState){
					navSubItem.patternState = pattern.patternState;
				}

				//if it is flat - we should not add the pattern to patternPaths
				if(flatPatternItem){
					
					bucket.patternItems.push(navSubItem);
					
					//add to patternPaths
					addToPatternPaths(bucketName, pattern);

				} else{

					bucket.navItems.push(navItem);
					bucket.navItemsIndex.push(navItemName);
					navItem.navSubItems.push(navSubItem);
					navItem.navSubItemsIndex.push(navSubItemName);

					//add to patternPaths
					addToPatternPaths(bucketName, pattern);

				}

				//add the bucket.
				patternlab.buckets.push(bucket);
				patternlab.bucketIndex.push(bucketName);

				//done

			} else{
				//find the bucket
				var bucket = patternlab.buckets[bucketIndex];

				//get the navItem
				var navItemName = pattern.subdir.split('-').pop();

				//get the navSubItem
				var navSubItemName = pattern.patternName.replace(/-/g, ' ');

				//assume the navSubItem does not exist.
				var navSubItem = new of.oNavSubItem(navSubItemName);
				navSubItem.patternPath = pattern.patternLink;
				navSubItem.patternPartial = bucketName + "-" + pattern.patternName; //add the hyphenated name

				//add the patternState if it exists
				if(pattern.patternState){
					navSubItem.patternState = pattern.patternState;
				}

				//test whether the pattern struture is flat or not - usually due to a template or page
				var flatPatternItem = false;
				if(navItemName === bucketName){
					flatPatternItem = true;
				}

				//if it is flat - we should not add the pattern to patternPaths
				if(flatPatternItem){

					//add the navItem to patternItems
					bucket.patternItems.push(navSubItem);

					//add to patternPaths
					addToPatternPaths(bucketName, pattern);

				} else{
					//check to see if navItem exists
					var navItemIndex = bucket.navItemsIndex.indexOf(navItemName);
					if(navItemIndex === -1){

						var navItem = new of.oNavItem(navItemName);

						//add the navItem and navSubItem
						navItem.navSubItems.push(navSubItem);
						navItem.navSubItemsIndex.push(navSubItemName);
						bucket.navItems.push(navItem);
						bucket.navItemsIndex.push(navItemName);

					} else{
						//add the navSubItem
						var navItem = bucket.navItems[navItemIndex];
						navItem.navSubItems.push(navSubItem);
						navItem.navSubItemsIndex.push(navSubItemName);
					}

					// just add to patternPaths
					addToPatternPaths(bucketName, pattern);
				}

			}

		}

		//the patternlab site requires a lot of partials to be rendered.
		//patternNav
		var patternNavTemplate = fs.readFileSync('./source/_patternlab-files/partials/patternNav.mustache', 'utf8');
		var patternNavPartialHtml = renderPattern(patternNavTemplate, patternlab);

		//ishControls
		var ishControlsTemplate = fs.readFileSync('./source/_patternlab-files/partials/ishControls.mustache', 'utf8');
		patternlab.config.mqs = patternlab.mediaQueries;
		var ishControlsPartialHtml = renderPattern(ishControlsTemplate, patternlab.config);

		//patternPaths
		var patternPathsTemplate = fs.readFileSync('./source/_patternlab-files/partials/patternPaths.mustache', 'utf8');
		var patternPathsPartialHtml = renderPattern(patternPathsTemplate, {'patternPaths': JSON.stringify(patternlab.patternPaths)});

		//viewAllPaths
		var viewAllPathsTemplate = fs.readFileSync('./source/_patternlab-files/partials/viewAllPaths.mustache', 'utf8');
		var viewAllPathersPartialHtml = renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

		//render the patternlab template, with all partials
		var patternlabSiteHtml = renderPattern(patternlabSiteTemplate, {}, {
			'ishControls': ishControlsPartialHtml,
			'patternNav': patternNavPartialHtml,
			'patternPaths': patternPathsPartialHtml,
			'viewAllPaths': viewAllPathersPartialHtml
		});
		fs.outputFileSync('./public/index.html', patternlabSiteHtml);
	}

	function renderPattern(name, data, partials) {
		if(partials) {
			return mustache.render(name, data, partials);
		}else{
			return mustache.render(name, data);
		}
	}

	function addToPatternPaths(bucketName, pattern){
		//this is messy, could use a refactor.
		patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.fileName;
	}

	return {
		version: function(){
			return getVersion();
		},
		build: function(){
			buildPatterns();
			buildFrontEnd();
			printDebug();
		},
		help: function(){
			help();
		},
		build_patterns_only: function(){
			buildPatterns();
			printDebug();
		}
	};

};

module.exports = patternlab_engine;

