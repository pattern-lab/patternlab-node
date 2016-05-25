"use strict";

var starterkit_manager = function (pl) {
  var path = require('path'),
    fs = require('fs-extra'),
    JSON5 = require('json5'),
    _ = require('lodash'),
    paths = pl.config.paths;

  function loadStarterKit(starterkitName) {

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
