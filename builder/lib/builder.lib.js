//TODO
//build the config if it doesnt exist....
//populate a bunch of variables from the config

//load classes
var JSONReader = require("./jsonreader.lib.js");

function Builder(){
	var self = this;
	this.config = {};
	this.jsonReader = new JSONReader();
};

Builder.prototype.readConfig = function(callback){
	this.jsonReader.read('./../../config/config.json', function(cfg){
		this.config = cfg;
		callback();
	});
}


Builder.prototype.getConfigInternal = function(){
	return config;
};


Builder.prototype.gatherData = function(){
	console.log('test');
}

module.exports = Builder;

