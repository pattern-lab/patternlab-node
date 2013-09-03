var util = require('util'),
Builder = require("./builder.lib.js");

function Generator(){
	Generator.super_.call(this);
};

util.inherits(Generator, Builder);

Generator.prototype.loadConfig = function(callback){
	this.readConfig(callback);
};

Generator.prototype.getConfig = function(callback){
	callback(this.getConfigInternal());
};

module.exports = Generator;