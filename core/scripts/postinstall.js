"use strict";
try{

  var sm = require('../lib/starterkit_manager.js');
  var path = require('path');
  var fs = require('fs-extra');

  //get the config
  var configPath = path.resolve(process.cwd(), 'patternlab-config.json');
  var config = fs.readJSONSync(path.resolve(configPath), 'utf8');

  //determine if any starterkits are already installed
  var starterkit_manager = new sm(config);
  var foundStarterkits = starterkit_manager.detect_starterkits();

  console.log(foundStarterkits);

} catch (ex) {
  console.log(ex);
  console.log('An error occurred during Pattern Lab Node postinstall.');
}


