'use strict';
const fs = require('fs-extra');
const spawn = require('execa');
const glob = require('glob');
const path = require('path');
const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;
const hasYarn = require('has-yarn');
const {
  resolvePackageFolder,
  resolveFileInPackage,
} = require('@pattern-lab/core/src/lib/resolver');

/**
 * @name log
 * @desc tiny event-based logger
 * @type {*}
 */
const log = Object.assign(
  {
    debug(msg) {
      this.emit(
        'patternlab.debug',
        `${chalk.green('⊙ patternlab →')} ${chalk.dim(msg)}`
      );
    },
    info(msg) {
      this.emit('patternlab.info', `⊙ patternlab → ${chalk.dim(msg)}`);
    },
    error(msg) {
      this.emit(
        'patternlab.error',
        `${chalk.red('⊙ patternlab →')} ${chalk.dim(msg)}`
      );
    },
  },
  EventEmitter.prototype
);

/**
 * @func debug
 * @desc Coloured debug log
 * @param  {*} msg - The variadic messages to log out.
 * @return {void}
 */
const debug = log.debug.bind(log);

/**
 * @func info
 * @desc Coloured debug log
 * @param  {*} msg - The variadic messages to log out.
 * @return {void}
 */
const info = log.info.bind(log);

/**
 * @func error
 * @desc Coloured error log
 * @param  {*} e - The variadic messages to log out.
 * @return {void}
 */
const error = log.error.bind(log);

/**
 * @func wrapAsync
 * @desc Wraps an generator function to yield out promisified stuff
 * @param {function} fn - Takes a generator function
 */
const wrapAsync = (fn) =>
  new Promise((resolve, reject) => {
    const generator = fn();
    /* eslint-disable */
    (function spwn(val) {
      let res;
      try {
        res =
          {}.toString.call(val) !== '[object Error]'
            ? generator.next(val)
            : generator.throw(val);
      } catch (err) {
        return reject(err);
      }
      const v = res.value;
      if (res.done) {
        return resolve(v);
      }
      Promise.resolve(v).then(spwn).catch(spwn);
    })();
    /* eslint-enable */
  });

/**
 * @func glob
 * @desc Promisified glob function
 * @param {string} pattern - A glob pattern to match against
 * @param {object} opts - A configuration object. See glob package for details
 * @return {Promise<Error|Array>}
 */
const asyncGlob = (pattern, opts) =>
  new Promise((resolve, reject) =>
    glob(pattern, opts, (err, matches) =>
      err !== null ? reject(err) : resolve(matches)
    )
  );

/**
 * @func copyWithPattern
 * @desc Copies multiple files asynchronously from one dir to another according to a glob pattern specified
 * @param  {string} cwd - The path to search for file(s) at
 * @param  {string} pattern - A glob pattern to match the file(s)
 * @param  {string} dest - The destination dir path
 * @return {Promise}
 */
const copyWithPattern = (cwd, pattern, dest) =>
  wrapAsync(function* () {
    const files = yield asyncGlob(pattern, { cwd: cwd });
    if (files.length === 0) {
      debug('copy: Nothing to copy');
    }
    // Copy concurrently
    const promises = files.map((file) =>
      fs.copy(path.join(cwd, file), path.join(dest, file))
    );
    return yield Promise.all(promises);
  });

/**
 * @func fetchPackage
 * @desc Fetches packages from an npm package registry and adds a reference in the package.json under dependencies
 * @param {string} packageName - The package name
 */
const fetchPackage = (packageName) =>
  wrapAsync(function* () {
    const useYarn = hasYarn();
    const pm = useYarn ? 'yarn' : 'npm';
    const installCmd = useYarn ? 'add' : 'install';
    try {
      if (packageName) {
        const opts = {};
        if (process.env.projectDir) {
          opts.cwd = process.env.projectDir;
        }
        const cmd = yield spawn(pm, [installCmd, packageName], opts);
        error(cmd.stderr);
      }
    } catch (err) {
      error(
        `fetchPackage: Fetching required dependencies from ${pm} failed for ${packageName} with ${err}`
      );
      throw err; // Rethrow error
    }
  });

/**
 * @func checkAndInstallPackage
 * Checks whether a package for a given packageName is installed locally. If package cannot be found, fetch and install it
 * @param {string} packageName - The package name
 * @return {boolean}
 */
const checkAndInstallPackage = (packageName) =>
  wrapAsync(function* () {
    try {
      resolvePackageFolder(packageName);
      return true;
    } catch (err) {
      debug(
        `checkAndInstallPackage: ${packageName} not installed. Fetching it now …`
      );
      yield fetchPackage(packageName);
      return false;
    }
  });

/**
 * @func noop
 * @desc Plain arrow expression for noop
 */
const noop = () => {};

/**
 * @func writeJsonAsync
 * Wrapper for fs.writeJsonAsync with consistent spacing
 * @param {string} filePath
 * @param {object} data
 */
const writeJsonAsync = (filePath, data) =>
  wrapAsync(function* () {
    yield fs.outputJSON(filePath, data, { spaces: 2 });
  });

/**
 * @func getJSONKey
 * Installs package, then returns the value for the given JSON file's key within
 * @param {string} packageName - the node_module to install / load
 * @param {object} key - the key to find
 * @param {object} fileName - the filePath of the JSON
 */
const getJSONKey = (packageName, key, fileName = 'package.json') =>
  wrapAsync(function* () {
    yield checkAndInstallPackage(packageName);
    const jsonData = yield fs.readJson(
      resolveFileInPackage(packageName, fileName)
    );
    return jsonData[key];
  });

module.exports = {
  copyWithPattern,
  copyAsync: fs.copy,
  mkdirsAsync: fs.mkdirs,
  moveAsync: fs.move,
  writeJsonAsync: writeJsonAsync,
  readJsonAsync: fs.readJson,
  error,
  info,
  debug,
  log,
  wrapAsync,
  checkAndInstallPackage,
  noop,
  getJSONKey,
};
