"use strict";

var starterkit_manager = function (pl) {
  var path = require('path'),
    fs = require('fs-extra'),
    util = require('./utilities'),
    paths = pl.config.paths;

  function loadStarterKit(starterkitName, clean) {
    try {
      var kitPath = path.resolve(
        path.join(process.cwd(), 'node_modules', starterkitName, pl.config.starterkitSubDir)
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

  function listStarterkits() {
    console.log('https://github.com/search?utf8=%E2%9C%93&q=starterkit+in%3Aname%2C+user%3Apattern-lab&type=Repositories&ref=searchresults');
  }

  function packStarterkit() {

  }

  return {
    load_starterkit: function (starterkitName, clean) {
      loadStarterKit(starterkitName, clean);
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
