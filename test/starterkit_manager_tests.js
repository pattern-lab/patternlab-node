"use strict";
const tap = require('tap');
const path = require('path');
const rewire = require('rewire');

// eslint-disable-next-line no-unused-vars
const fs = require('fs-extra');


let config = {
  "not": "overwritten",
  "patternExtension": "mustache",
  "anArray": ["foo", "bar"],
  "nestedObject": {
    "foo": 1,
    "bar": "original"
  },
  "paths": {"source": {"root": "./source/"} }
};

tap.test("StarterKit configuration works as excepted", function (test) {
  const starterkit_manager = rewire('../core/lib/starterkit_manager');

  //set up a global mocks - we don't want to be writing/rendering any files right now
  const fsMock = {
    readJSONSync: function (thePath) {
      if (thePath.endsWith("patternlab-config.json")) {

        return config;
      }

      if (thePath.endsWith("starterkit-config.json")) {
        return {
          "patternExtension": "html",
          "anArray": ["baz"],
          "nestedObject": {
            "bar": "overwritten"
          },
          "newField": "value"
        };
      }
      throw "Never happens";
    },
    copySync: function () {

    },
    statSync: function () {
      return {
        isDirectory: function () {
          return true;
        }
      };
    },
    outputFileSync: function (file, data) {
      test.same(
        JSON.parse(data), {
          "not": "overwritten",
          "patternExtension": "html",
          "anArray": ["baz"],
          "nestedObject": {
            "foo": 1,
            "bar": "overwritten"
          },
          "paths": {"source": {"root": "./source/"}},
          "newField": "value"
        }, "The configuration is overwritten correctly"
      );
    }
  };

  //set our mocks in place of usual require()
  starterkit_manager.__set__({
    'fs': fsMock,
    'path': {
      resolve: function () {
        return Array.prototype.slice.call(arguments).join(path.sep);
      },
      join: function () {
        return Array.prototype.slice.call(arguments).join(path.sep);
      }
    }
  });

  const sm = new starterkit_manager(config, "patternlab-config.json");
  sm.load_starterkit("starterkit-foo", false);
  test.end();
});



tap.test("StarterKit configuration is not mandatory", function (test) {
  const starterkit_manager = rewire('../core/lib/starterkit_manager');
  const starterkitConfig = "starterkit-config.json";

//set up a global mocks - we don't want to be writing/rendering any files right now
  const fsMock = {
    readJSONSync: function (thePath) {
      if (thePath.endsWith("patternlab-config.json")) {
        return config;
      }
      if (thePath.endsWith(starterkitConfig)) {
        throw new Error("File does not exist");
      }
      throw "Never happens";
    },
    copySync: function () { },
    statSync: function (file) {
      if (file === starterkitConfig) {
        throw new Error("File does not exist");
      }
      return {
        isDirectory: function () {
          return true;
        }
      };
    },
    outputFileSync: function (file, data) {
      // config is not modified when file does not exist
      test.same(JSON.parse(data), config, "The configuration is overwritten correctly");
    }
  };

//set our mocks in place of usual require()
  starterkit_manager.__set__({
    'fs': fsMock,
    'path': {
      resolve: function () {
        return Array.prototype.slice.call(arguments).join(path.sep);
      },
      join: function () {
        return "";
      }
    }
  });

  const sm = new starterkit_manager(config, "patternlab-config.json");
  sm.load_starterkit("starterkit-foo", false);
  test.end();
});
