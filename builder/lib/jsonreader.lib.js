var fs = require('fs'),
	path = require('path');

var JSONReader = function(){
	this.read = function(filePath, callback){

		//resolve the path to maintain cross-platform functionality
		var totalPath = path.resolve(__dirname, filePath);

		//open and read the file
		fs.readFile(totalPath, 'utf8', function(err, data){
			if (err) {
				console.log('Error: ' + err);
				return;
			}
			var json = JSON.parse(data);

			//return the json to the caller
			callback(json);
		});
	};
};
module.exports = JSONReader;