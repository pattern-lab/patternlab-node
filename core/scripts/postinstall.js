"use strict";
try {
  console.log('Beginning Pattern Lab postinstall...');

  var path = require('path');
  var fs = require('fs-extra');
  var smPath = path.resolve(__dirname, '..', 'lib/starterkit_manager.js');
  var pmPath = path.resolve(__dirname, '..', 'lib/plugin_manager.js');
  var uPath = path.resolve(__dirname, '..', 'lib/utilities.js');
  var sm = require(smPath);
  var pm = require(pmPath);
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
    console.log('No starterkits found to automatically load.');
  }

  //determine if any plugins are already installed
  var plugin_manager = new pm(config, configPath);
  var foundPlugins = plugin_manager.detect_plugins();

  if (foundPlugins && foundPlugins.length > 0) {

    for (var i = 0; i < foundPlugins.length; i++) {
      console.log('Found plugin', foundPlugins[i]);
      plugin_manager.install_plugin(foundPlugins[i]);
    }
  }

  u.logGreen('Pattern Lab postinstall complete.');

} catch (ex) {
  console.log(ex);
  u.logOrange('An error occurred during Pattern Lab Node postinstall.');
  u.logOrange('Pattern Lab postinstall completed with errors.');
}
