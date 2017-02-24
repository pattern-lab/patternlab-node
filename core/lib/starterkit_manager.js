"use strict";

// needs to be mutable for "rewire"
let fs = require('fs-extra');
let path = require('path');

const fetch = require('node-fetch');
const util = require('./utilities');
const _ = require('lodash');

const starterkit_manager = function (config, configPath) {
  const paths = config.paths;

  /**
   * Ovewrites any values in the Pattern Lab config file with values from starterkit-config.json.
   * If no starterkit configuration exists, nothing will be done.
   *
   * @param starterKitRoot
   */
  function updateConfig(starterKitRoot) {

    let starterKitRootStats;
    try {
      starterKitRootStats = fs.statSync(starterKitRoot);
    } catch (ex) {
      util.error(starterKitRoot + ' not found, please use npm to install it first.');
      util.error(starterKitRoot + ' not loaded.');
      return;
    }
    if (starterKitRootStats.isDirectory()) {

      const diskConfig = fs.readJSONSync(path.resolve(configPath), 'utf8');
      const starterKitConfig = path.resolve(starterKitRoot, 'starterkit-config.json');
      let success = true;
      try {
        const starterKitConfigJSON = fs.readJSONSync(starterKitConfig, 'utf8');

        // Idea: Merge objects so that paths and templateExtension can be changed
        // Also overwrite arrays instead of appending to them
        // Use case:
        // "ignored-extensions" : ["scss", "DS_Store", "less"],
        // "ignored-directories" : ["less"],

        // Attention: If the array contains any objects, it gets replaced completely!
        _.mergeWith(diskConfig, starterKitConfigJSON, (target, source) => {
          if (_.isArray(source)) {
            return source;
          }

          // Delegate to default behaviour
          return undefined;
        });

      } catch (ex) {
        //a starterkit-config.json file is not required at this time
        success = false;
      }

      //write config entry back
      // Also used for unit testing the result...
      fs.outputFileSync(path.resolve(configPath), JSON.stringify(diskConfig, null, 2));

      // Only output if we changed some values so users are not confused
      // We want to tell the user that something was changed
      if (success) {
        console.log("Using starterkit-config.json to update patternlab-config.json");
      }
    }
  }

  /**
   * Loads npm module identified by the starterkitName parameter.
   *
   * @param starterkitName {string} Kit name
   * @param clean {boolean}  Indicates if the directory should be cleaned before loading
  */
  function loadStarterKit(starterkitName, clean) {
    try {
      const kitRoot = path.resolve(
        path.join(process.cwd(), 'node_modules', starterkitName)
      );
      const kitPath = path.resolve(
        path.join(kitRoot, config.starterkitSubDir)
      );
      console.log('Attempting to load starterkit from', kitPath);
      let kitRootStats;
      let kitDirStats;

      try {
        kitRootStats = fs.statSync(kitRoot);
        kitDirStats = fs.statSync(kitPath);
      } catch (ex) {
        util.error(starterkitName + ' not found, please use npm to install it first.');
        util.error(starterkitName + ' not loaded.');
        return;
      }
      if (kitDirStats.isDirectory() && kitRootStats.isDirectory()) {

        if (clean) {
          console.log('Deleting contents of', paths.source.root, 'prior to starterkit load.');
          util.emptyDirectory(paths.source.root);
        } else {
          console.log('Overwriting contents of', paths.source.root, 'during starterkit load.');
        }

        try {
          fs.copySync(kitPath, paths.source.root);
        } catch (ex) {
          util.error(ex);
          return;
        }
        updateConfig(kitRoot);
        util.debug('starterkit ' + starterkitName + ' loaded successfully.');
      }
    } catch (ex) {
      console.log(ex);
    }
  }

  /**
   * Fetches starterkit repos from GH API that contain 'starterkit' in their name for the user 'pattern-lab'
   *
   * @return {Promise} Returns an Array<{name,url}> for the starterkit repos
   */
  function listStarterkits() {
    return fetch('https://api.github.com/search/repositories?q=starterkit+in:name+user:pattern-lab&sort=stars&order=desc', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }).then(function (res) {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') === -1) {
        throw new TypeError("StarterkitManager->listStarterkits: Not valid JSON");
      }
      return res.json();
    }).then(function (json) {
      if (!json.items || !Array.isArray(json.items)) {
        return false;
      }
      return json.items
        .map(function (repo) {
          return {name: repo.name, url: repo.html_url};
        });
    }).catch(function (err) {
      console.error(err);
      return false;
    });
  }

  function packStarterkit() {

  }

  /**
   * Detects installed starter kits
   *
   * @return {array} List of starter kits installed
   */
  function detectStarterKits() {
    const node_modules_path = path.join(process.cwd(), 'node_modules');
    const npm_modules = fs.readdirSync(node_modules_path).filter(function (dir) {
      const module_path = path.join(process.cwd(), 'node_modules', dir);
      return fs.statSync(module_path).isDirectory() && dir.indexOf('starterkit-') === 0;
    });
    return npm_modules;
  }

  return {
    load_starterkit: function (starterkitName, clean) {
      loadStarterKit(starterkitName, clean);
    },
    list_starterkits: function () {
      return listStarterkits();
    },
    pack_starterkit: function () {
      packStarterkit();
    },
    detect_starterkits: function () {
      return detectStarterKits();
    }
  };

};

module.exports = starterkit_manager;
