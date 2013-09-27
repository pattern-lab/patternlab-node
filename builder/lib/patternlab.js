var path = require('path');

var oPattern = function(name, subdir, filename, data){
	this.name = name; //this is the unique name with the subDir
	this.subdir = subdir;
	this.filename = filename;
	this.data =  data;
	this.template = '';
	this.patternOutput = '';
	this.patternName = ''; //this is the display name for the ui
	this.patternLink = '';
};

var mustache = require('./Mustache/mustache.js');

module.exports = function(grunt) {	
	grunt.registerTask('patternlab', 'create design systems with atomic design', function(arg) {

		var patternlab = {};
		patternlab.data = grunt.file.readJSON('./source/_data/data.json');
		patternlab.listitems = grunt.file.readJSON('./source/_data/listitems.json');
		patternlab.header = grunt.file.read('./source/_patternlab-files/pattern-header-footer/header.html');
		patternlab.footer = grunt.file.read('./source/_patternlab-files/pattern-header-footer/footer.html');
		patternlab.patterns = [];
		patternlab.patternIndex = [];
		patternlab.partials = {};

		grunt.file.recurse('./source/_patterns', function(abspath, rootdir, subdir, filename){
			//check if the pattern already exists.  
			var patternName = filename.substring(0, filename.indexOf('.'));
			var patternIndex = patternlab.patternIndex.indexOf(subdir + '-' +  patternName);
			var currentPattern;	
			var flatPatternPath;

			//two reasons could return no pattern, 1) just a bare mustache, or 2) a json found before the mustache
			//returns -1 if patterns does not exist, otherwise returns the index
			//add the pattern array if first time, otherwise pull it up
			if(patternIndex === -1){
				grunt.log.ok('pattern not found, adding to array');
				var flatPatternName = subdir.replace(/\//g, '-') + '-' + patternName;
				flatPatternName = flatPatternName.replace(/\//g, '-');
				currentPattern = new oPattern(flatPatternName, subdir, filename, {});
				currentPattern.patternName = patternName.substring(patternName.indexOf('-') + 1);

				if(grunt.util._.str.include(filename, 'json')){
					grunt.log.writeln('json file found first, so add it to the pattern and continuing');
					currentPattern.data = grunt.file.readJSON(abspath);
					//done
				} else{
					grunt.log.writeln('mustache file found, assume no data, so compile it right away');
					currentPattern.template = grunt.file.read(abspath);

					//render the pattern. pass partials object just in case.
					currentPattern.patternOutput = mustache.render(currentPattern.template, patternlab.data, patternlab.partials);

					//write the compiled template to the public patterns directory
					flatPatternPath = currentPattern.name + '/' + currentPattern.name + '.html';
					grunt.file.write('./public/patterns/' + flatPatternPath, patternlab.header + currentPattern.patternOutput + patternlab.footer);
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
				}
				//add to patternlab arrays so we can look these up later.  this could probably just be an object.
				patternlab.patternIndex.push(currentPattern.name);
				patternlab.patterns.push(currentPattern);
			} else{
				//if we get here, we can almost ensure we found the json first, so render the template and pass in the unique json
				currentPattern = patternlab.patterns[patternIndex];
				grunt.log.ok('pattern found, loaded');
				//determine if this file is data or pattern
				if(grunt.util._.str.include(filename, 'mustache')){

					currentPattern.template = grunt.file.read(abspath);

					//render the pattern. pass partials object just in case.
					currentPattern.patternOutput = mustache.render(currentPattern.template, currentPattern.data, patternlab.partials);
					grunt.log.writeln('template compiled with data!');

					//write the compiled template to the public patterns directory
					flatPatternPath = currentPattern.name + '/' + currentPattern.name + '.html';
					grunt.file.write('./public/patterns/' + flatPatternPath, patternlab.header + currentPattern.patternOutput + patternlab.footer);
					currentPattern.patternLink = flatPatternPath;

					//done
				} else{
					grunt.log.error('json encountered!? there should only be one');
				}
			}

		});

		var outputFilename = './patternlab.json';
		grunt.file.write(outputFilename, JSON.stringify(patternlab, null, 3));

		//build the styleguide
		var styleguidetemplate = grunt.file.read('./source/_patternlab-files/styleguide.mustache');
		var styleguidehtml = mustache.render(styleguidetemplate, {partials: patternlab.patterns});

		grunt.file.write('./public/styleguide/html/styleguide.html', styleguidehtml);

	});
};