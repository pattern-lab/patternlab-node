//build the config if it doesnt exist....

//populate a bunch of variables from the config



var ConfigReader = require("./configreader.lib.js");

var Builder = function(){
	//load the config
	var configReader = new ConfigReader();
	configReader.read('./../../config/config.json', function(config){

		// generate pattern paths

		// get nav items


	});
};
module.exports = Builder;

