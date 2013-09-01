var fs = require('fs'),
	path = require('path');

var ConfigReader = function(){
	this.read = function(cfgPath, callback){
		//resolve the path to maintain cross-platform functionality
		var configPath = path.resolve(__dirname, cfgPath);
		fs.readFile(configPath, 'utf8', function(err, data){
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			var config = JSON.parse(data);
			//return the config to the caller
			callback(config);
		});
	};
};
module.exports = ConfigReader;