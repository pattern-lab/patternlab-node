"use strict";

var starterkit_manager = function (pl) {
  var path = require('path'),
    fs = require('fs-extra'),
    JSON5 = require('json5'),
    _ = require('lodash'),
    paths = pl.config.paths;

  function loadStarterKit(starterkitName) {
    try {
      var kitPath = path.resolve(
        path.join(process.cwd(), 'node_modules', starterkitName, pl.config.starterkitSubDir)
      );
      var kitPathDirExists = fs.statSync(kitPath).isDirectory();
      if (kitPathDirExists) {

        //todo check and prompt user is paths().source is not empty

        fs.copy(kitPath, paths.source.root, function(ex) {
          if (ex) {
            console.error(ex);
          }
          console.log('starterkit ' + starterkitName + ' loaded successfully.');
        });

      }
    } catch (ex) {
      console.log(ex);
      console.log(starterkitName + ' not found, please use npm to install it first');
    }
  }

  function listStarterkits() {
    console.log('https://github.com/search?utf8=%E2%9C%93&q=starterkit+in%3Aname%2C+user%3Apattern-lab&type=Repositories&ref=searchresults');
  }

  function packStarterkit() {

  }

  return {
    load_starterkit: function (starterkitName) {
      loadStarterKit(starterkitName);
    },
    list_starterkits: function () {
      listStarterkits();
    },
    pack_starterkit: function () {
      packStarterkit();
    }
  };

};

module.exports = starterkit_manager;
