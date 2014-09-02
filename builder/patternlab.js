/* 
 * patternlab-node - v0.1.3 - 2014 
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
		diveSync = require('diveSync'),
		mustache = require('mustache'),
		of = require('./object_factory'),
		pa = require('./pattern_assembler'),
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
		patternlab.data = fs.readJSONSync('./source/_data/data.json');
		patternlab.listitems = fs.readJSONSync('./source/_data/listitems.json');
		patternlab.header = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/header.html', 'utf8');
		patternlab.footer = fs.readFileSync('./source/_patternlab-files/pattern-header-footer/footer.html', 'utf8');
		patternlab.patterns = [];
		patternlab.patternIndex = [];
		patternlab.partials = {};

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

			//check if the pattern already exists.  
			var patternName = filename.substring(0, filename.indexOf('.')),
				patternIndex = patternlab.patternIndex.indexOf(subdir + '-' +  patternName),
				currentPattern,
				flatPatternPath;

			//ignore _underscored patterns, json, and dotfiles
			if(filename.charAt(0) === '_' || path.extname(filename) === '.json' || filename.charAt(0) === '.'){
				return;
			}

			//make a new Pattern Object
			var flatPatternName = subdir.replace(/[\/\\]/g, '-') + '-' + patternName;
			
			flatPatternName = flatPatternName.replace(/\\/g, '-');
			currentPattern = new of.oPattern(flatPatternName, subdir, filename, {});
			currentPattern.patternName = patternName.substring(patternName.indexOf('-') + 1);
			currentPattern.data = null;

			//see if this file has a state
			if(patternlab.config.patternStates[currentPattern.patternName]){
				currentPattern.patternState = patternlab.config.patternStates[currentPattern.patternName];
			}

			//look for a json file for this template
			try {
				var jsonFilename = abspath.substr(0, abspath.lastIndexOf(".")) + ".json";
				currentPattern.data = fs.readJSONSync(jsonFilename);
			}
			catch(e) {

			}

			currentPattern.template = fs.readFileSync(abspath, 'utf8');

			//render the pattern. pass partials object just in case.
			if(currentPattern.data) { // Pass JSON as data
				currentPattern.patternPartial = renderPattern(currentPattern.template, currentPattern.data, patternlab.partials);
			}else{ // Pass global patternlab data
				currentPattern.patternPartial = renderPattern(currentPattern.template, patternlab.data, patternlab.partials);
			}
			
			//write the compiled template to the public patterns directory
			flatPatternPath = currentPattern.name + '/' + currentPattern.name + '.html';

			//add footer info before writing
			var currentPatternFooter = renderPattern(patternlab.footer, currentPattern);

			fs.outputFileSync('./public/patterns/' + flatPatternPath, patternlab.header + currentPattern.patternPartial + currentPatternFooter);
			currentPattern.patternLink = flatPatternPath;

			//add as a partial in case this is referenced later.  convert to syntax needed by existing patterns
			var sub = subdir.substring(subdir.indexOf('-') + 1);
			var folderIndex = sub.indexOf('/'); //THIS IS MOST LIKELY WINDOWS ONLY.  path.sep not working yet
			var cleanSub = sub.substring(0, folderIndex);

			//add any templates found to an object of partials, so downstream templates may use them too
			//exclude the template patterns - we don't need them as partials because pages will just swap data
			if(cleanSub !== ''){
				var partialname = cleanSub + '-' + patternName.substring(patternName.indexOf('-') + 1);

				patternlab.partials[partialname] = currentPattern.template;

				//done
			}
			
			//add to patternlab arrays so we can look these up later.  this could probably just be an object.
			patternlab.patternIndex.push(currentPattern.name);
			patternlab.patterns.push(currentPattern);
		});

	}

	function buildFrontEnd(){
		patternlab.buckets = [];
		patternlab.bucketIndex = [];
		patternlab.patternPaths = {};
		patternlab.viewAllPaths = {};

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
		var ishControlsPartialHtml = renderPattern(ishControlsTemplate, patternlab.config);

		//patternPaths
		var patternPathsTemplate = fs.readFileSync('./source/_patternlab-files/partials/patternPaths.mustache', 'utf8');
		var patternPathsPartialHtml = renderPattern(patternPathsTemplate, {'patternPaths': JSON.stringify(patternlab.patternPaths)});

		//viewAllPaths
		var viewAllPathsTemplate = fs.readFileSync('./source/_patternlab-files/partials/viewAllPaths.mustache', 'utf8');
		var viewAllPathersPartialHtml = renderPattern(viewAllPathsTemplate, {'viewallpaths': JSON.stringify(patternlab.viewAllPaths)});

		//websockets
		var websocketsTemplate = fs.readFileSync('./source/_patternlab-files/partials/websockets.mustache', 'utf8');
		patternlab.contentsyncport = patternlab.config.contentSyncPort;
		patternlab.navsyncport = patternlab.config.navSyncPort;

		var websocketsPartialHtml = renderPattern(websocketsTemplate, patternlab);

		//render the patternlab template, with all partials
		var patternlabSiteHtml = renderPattern(patternlabSiteTemplate, {}, {
			'ishControls': ishControlsPartialHtml,
			'patternNav': patternNavPartialHtml,
			'patternPaths': patternPathsPartialHtml,
			'websockets': websocketsPartialHtml,
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
		patternlab.patternPaths[bucketName][pattern.patternName] = pattern.subdir.replace(/\\/g, '/') + "/" + pattern.filename.substring(0, pattern.filename.indexOf('.'));
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

