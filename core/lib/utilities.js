"use strict";

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;

/**
 * @name log
 * @desc tiny event-based logger
 * @type {*}
 */
const log = Object.assign({
  debug(msg) {
    this.emit('debug', chalk.green(msg));
  },
  info(msg) {
    this.emit('info', msg);
  },
  warning(msg) {
    this.emit('warning', chalk.yellow(msg));
  },
  error(msg) {
    this.emit('error', chalk.red(msg));
  }
}, EventEmitter.prototype);

/**
 * @func debug
 * @desc Coloured debug log
 * @param  {*} msg - The variadic messages to log out.
 * @return {void}
 */
const debug = log.debug.bind(log);

/**
 * @func warning
 * @desc Coloured error log
 * @param  {*} e - The variadic messages to log out.
 * @return {void}
 */
const warning = log.warning.bind(log);

/**
 * @func error
 * @desc Coloured error log
 * @param  {*} e - The variadic messages to log out.
 * @return {void}
 */
const error = log.error.bind(log);

  /**
   * Shuffles an array in place.
   * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
   *
   * @param {Array} o
   * @returns {Array} o
   */
const shuffle = function (o) {
  /*eslint-disable curly*/
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};

/**
 * Recursively merge properties of two objects.
 *
 * @param {Object} obj1 If obj1 has properties obj2 doesn't, add to obj2.
 * @param {Object} obj2 This object's properties have priority over obj1.
 * @returns {Object} obj2
 */
const mergeData = function (obj1, obj2) {
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
        obj2[p] = mergeData(obj1[p], obj2[p]);

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
};

/**
 * Determines whether or not an object is empty.
 *
 * @param {Object} obj
 * @returns {Boolean}
 */
const isObjectEmpty = function (obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) { return false; }
  }
  return true;
};

/**
 * Recursively delete the contents of directory.
 * Adapted from https://gist.github.com/tkihira/2367067
 *
 * @param {string} dir - directory to empty
 * @param {string} cleanDir - already empty directory
 * @returns {undefined}
 */
const emptyDirectory = function (dir, cleanDir) {
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
};

module.exports = {
  debug,
  warning,
  error,
  log,
  shuffle,
  mergeData,
  isObjectEmpty,
  emptyDirectory
};

