/*

load classes
-watcher.lib

load mustache

*/

var Generator = require("./lib/generator.lib.js");

process.argv.forEach(function(val, index, array) {
	if(index === 2){
		if(val === 'g'){
			var generator = new Generator();
			console.log('generate');
			generator.loadConfig(function(){
				generator.getConfig(function(d){console.log(d)});
			});
		} else if(val === 'w'){
			console.log('generate and watch');
		}
		else{
			console.log('Usage: node filename -g');
			console.log('         Iterates over the \'source\' directories & files and generates the entire site a single time.');
			console.log('       node filename -w');
			console.log('         Generates the site like the -g flag and then watches for changes in the \'source\' directories & files. Will re-generate files if they\'ve changed.');
		}
	}
});

