var util = require('util');

var oPattern = function(name, subdir, filename, data){
	this.name = name;
	this.subdir = subdir;
	this.filename = filename;
	this.data =  data;
	this.template = '';
	this.html = '';
};

var mustache = require('./Mustache/mustache.js');

module.exports = function(grunt) {	
	grunt.registerTask('patternlab', 'create design systems with atomic design', function(arg) {

		var patternlab = {};

		patternlab.data = grunt.file.readJSON('./source/_data/data.json');
		patternlab.listitems = grunt.file.readJSON('./source/_data/listitems.json');
		patternlab.patterns = [];
		patternlab.patternIndex = [];

		grunt.file.recurse('./source/_patterns', function(abspath, rootdir, subdir, filename){
			// grunt.log.ok('new file');
			console.log('abspath ' + abspath);
			console.log('rootdir ' + rootdir);
			console.log('subdir '+ subdir);
			console.log('filename ' + filename);

			//check if the pattern already exists.  
			var patternName = filename.substring(0, filename.indexOf('.'));
			var patternIndex = patternlab.patternIndex.indexOf(subdir + '-' +  patternName);
			var currentPattern;			

			//two reasons could return no pattern, 1) just a bare mustache, or 2) a json found before the mustache
			//returns -1 if patterns does not exist, otherwise returns the index
			//add the pattern array if first time, otherwise pull it up
			if(patternIndex === -1){
				grunt.log.ok('pattern not found, adding to array');
				var flatPatternName = subdir.replace(/\//g, '-') + '-' + patternName;
				flatPatternName = flatPatternName.replace(/\//g, '-');
				currentPattern = new oPattern(flatPatternName, subdir, {}, filename);
				if(grunt.util._.str.include(filename, 'json')){
					grunt.log.writeln('adding json data to pattern');
					currentPattern.data = grunt.file.readJSON(abspath);
					//done
				} else{
					grunt.log.writeln('mustache file found, assume no data, so compile it right away');
					currentPattern.template = grunt.file.read(abspath);
					currentPattern.html = mustache.render(currentPattern.template, {});

					//write the compiled template to the public patterns directory
					grunt.file.write('./public/patterns/' + currentPattern.name + '/' + currentPattern.name + '.html', currentPattern.html);
					//done		
				}
				//add to patternlab arrays
				patternlab.patternIndex.push(currentPattern.name);
				patternlab.patterns.push(currentPattern);
			} else{
				//if we get here, we can almost ensure we found the json first
				currentPattern = patternlab.patterns[patternIndex];
				grunt.log.ok('pattern found, loaded')
				//determine if this file is data or pattern
				if(grunt.util._.str.include(filename, 'mustache')){
					grunt.log.writeln('mustache');
					currentPattern.template = grunt.file.read(abspath);
					currentPattern.html = mustache.render(currentPattern.template, currentPattern.data);
					grunt.log.writeln('compiled with data!');
					//check, do we have to save it again?

					//write the compiled template to the public patterns directory
					grunt.file.write('./public/patterns/' + currentPattern.name + '/' + currentPattern.name + '.html', currentPattern.html);

				} else{
					grunt.log.error('json encountered!? there should only be one');
				}
			}

		});
		//if we get this far, we should try dumping patternlab into the public folder

		var outputFilename = './patternlab.json';
		grunt.file.write(outputFilename, JSON.stringify(patternlab, null, 3));


	});
}