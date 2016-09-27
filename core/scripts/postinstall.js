"use strict";
try {
  console.log('Beginning Pattern Lab postinstall...');

  var path = require('path');
  var fs = require('fs-extra');
  var smPath = path.resolve(__dirname, '..', 'lib/starterkit_manager.js');
  var uPath = path.resolve(__dirname, '..', 'lib/utilities.js');
  var sm = require(smPath);
  var u = require(uPath);

  //get the config
  var configPath = path.resolve(process.cwd(), 'patternlab-config.json');
  var config = fs.readJSONSync(path.resolve(configPath), 'utf8');

  //determine if any starterkits are already installed
  var starterkit_manager = new sm(config);
  var foundStarterkits = starterkit_manager.detect_starterkits();

  //todo - enhance to support multiple kits with prompt for each or all
  if (foundStarterkits && foundStarterkits.length > 0) {
    starterkit_manager.load_starterkit(foundStarterkits[0], true);
  } else {
    console.log('No starterkits found to automatically load.')
  }
  u.logGreen('Pattern Lab postinstall complete.');

} catch (ex) {
  console.log(ex);
  u.logOrange('An error occurred during Pattern Lab Node postinstall.');
  u.logOrange('Pattern Lab postinstall completed with errors.');
}
