"use strict";

var starterkit_manager = function (config) {
  var path = require('path'),
    fetch = require('node-fetch'),
    fs = require('fs-extra'),
    util = require('./utilities'),
    paths = config.paths;

  /**
   * Loads npm module identified by the starterkitName parameter. 
   *
   * @param starterkitName {string} Kit name
   * @param clean {boolean}  Indicates if the directory should be cleaned before loading
  */
  function loadStarterKit(starterkitName, clean) {
    try {
      var kitPath = path.resolve(
        path.join(process.cwd(), 'node_modules', starterkitName, config.starterkitSubDir)
      );
      console.log('Attempting to load starterkit from', kitPath);
      try {
        var kitDirStats = fs.statSync(kitPath);
      } catch (ex) {
        util.logRed(starterkitName + ' not found, please use npm to install it first.');
        util.logRed(starterkitName + ' not loaded.');
        return;
      }
      var kitPathDirExists = kitDirStats.isDirectory();
      if (kitPathDirExists) {

        if (clean) {
          console.log('Deleting contents of', paths.source.root, 'prior to starterkit load.');
          util.emptyDirectory(paths.source.root);
        } else {
          console.log('Overwriting contents of', paths.source.root, 'during starterkit load.');
        }

        fs.copy(kitPath, paths.source.root, function (ex) {
          if (ex) {
            console.error(ex);
          }
          util.logGreen('starterkit ' + starterkitName + ' loaded successfully.');
        });
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
      var contentType = res.headers.get('content-type');
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
    var node_modules_path = path.join(process.cwd(), 'node_modules');
    var npm_modules = fs.readdirSync(node_modules_path).filter(function (dir) {
      var module_path = path.join(process.cwd(), 'node_modules', dir);
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
