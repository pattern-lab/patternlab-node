"use strict";

var fs = require('fs-extra'),
  path = require('path');

var util = {
  // http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
  shuffle: function (o) {
    /*eslint-disable curly*/
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },

  logGreen: function (message) {
    console.log('\x1b[32m', message, '\x1b[0m');
  },

  logRed: function (message) {
    console.log('\x1b[41m', message, '\x1b[0m');
  },

  /**
   * Recursively merge properties of two objects.
   *
   * @param {Object} obj1 If obj1 has properties obj2 doesn't, add to obj2.
   * @param {Object} obj2 This object's properties have priority over obj1.
   * @returns {Object} obj2
   */
  mergeData: function (obj1, obj2) {
    /*eslint-disable no-param-reassign, guard-for-in*/
    if (typeof obj2 === 'undefined') {
      obj2 = {};
    }
    for (var p in obj1) {
      try {
        // Only recurse if obj1[p] is an object.
        if (obj1[p].constructor === Object) {
          // Requires 2 objects as params; create obj2[p] if undefined.
          if (typeof obj2[p] === 'undefined') {
            obj2[p] = {};
          }
          obj2[p] = util.mergeData(obj1[p], obj2[p]);

          // Pop when recursion meets a non-object. If obj1[p] is a non-object,
          // only copy to undefined obj2[p]. This way, obj2 maintains priority.
        } else if (typeof obj2[p] === 'undefined') {
          obj2[p] = obj1[p];
        }
      } catch (e) {
        // Property in destination object not set; create it and set its value.
        if (typeof obj2[p] === 'undefined') {
          obj2[p] = obj1[p];
        }
      }
    }
    return obj2;
  },

  isObjectEmpty: function (obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) { return false; }
    }
    return true;
  },

  // recursively delete the contents of directory
  // adapted from https://gist.github.com/tkihira/2367067
  emptyDirectory: function (dir, cleanDir) {
    var list = fs.readdirSync(dir);
    for (var i = 0; i < list.length; i++) {
      var filename = path.join(dir, list[i]);
      var stat = fs.statSync(filename);

      if (filename === "." || filename === "..") {
        // pass these files
      } else if (stat.isDirectory()) {
        this.emptyDirectory(filename);
      } else {
        // rm fiilename
        fs.unlinkSync(filename);
      }
    }
    if (cleanDir) {
      fs.rmdirSync(dir);
    }
  }
};

module.exports = util;
