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
