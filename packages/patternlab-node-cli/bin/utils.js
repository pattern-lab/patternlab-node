'use strict';

const fs = require('fs-extra');
const spawn = require('child-process-promise').spawn;
const glob = require('glob');
const path = require('path');
const colors = require('colors');

/**
 * @func log
 * @desc Bind console to allow shorter log func.
 */
const log = console.log.bind(console); // eslint-disable-next-line

/**
 * @func debug
 * @desc Coloured debug log
 * @param  {*} msg - The variadic messages to log out.
 * @return {void}
 */
const debug = function (msg) {
	log(colors.green(msg));
};

/**
 * @func error
 * @desc Coloured error log
 * @param  {*} e - The variadic messages to log out.
 * @return {void}
 */
const error = function (e) {
	log(colors.red(e));
};

/**
 * @func wrapAsync
 * @desc Wraps an generator function to yield out promisified stuff
 * @param {function} fn - Takes a generator function
 */
const wrapAsync = fn => new Promise((resolve, reject) => {
	const generator = fn();
	(function spwn(val) {
		let res;
		try {
			res = {}.toString.call(val) !== '[object Error]' ? generator.next(val) : generator.throw(val);
		} catch (err) {
			return reject(err);
		}
		const v = res.value;
		if (res.done) return resolve(v);
		Promise.resolve(v).then(spwn).catch(spwn);
	})();
});

/**
 * @func glob
 * @desc Promisified glob function
 * @param {string} pattern - A glob pattern to match against
 * @param {object} opts - A configuration object. See glob package for details
 * @return {Promise<Error|Array>}
 */
const asyncGlob = (pattern, opts) => new Promise(
	(resolve, reject) => glob(pattern, opts,
		(err, matches) => (err !== null) ? reject(err) : resolve(matches)
	)
);

/**
 * @func copy
 * @desc Copies multiple files snychronously from one dir to another according to a glob pattern specified
 * @param  {string} cwd - The path to search for file(s) at
 * @param  {string} pattern - A glob pattern to match the file(s)
 * @param  {string} dest - The destination dir path
 * @return {Promise}
 */
const copy = (cwd, pattern, dest) => wrapAsync(function*() {
	const files = yield asyncGlob(pattern, {cwd: cwd});
	if (files.length === 0) debug('patternlab→util→copy: Nothing to copy');
	// Copy concurrently
	const promises = files.map(file => copyAsync(
		path.join(cwd, file),
		path.join(dest, file))
	);
	return yield Promise.all(promises);
});

/**
 * @func fetchPackage
 * @desc Fetches and saves packages from npm into node_modules and adds a reference in the package.json under dependencies
 * @param {string} packageName - The package name
 * @param {string} [url] - A URL which will be used to fetch the package from
 */
const fetchPackage = (packageName, url) => wrapAsync(function*() {
	try {
		if (packageName || url) {
			const cmd = yield spawn('npm', ['install', '--save', url || packageName], {capture: ['stdout', 'stderr']});
			error(cmd.stderr);
		}
	} catch (err) {
		error(`patternlab→fetchPackage: Fetching required dependencies from NPM failed for ${packageName} with ${err}`);
		throw err; // Rethrow error
	}
});

/**
 * @func checkAndInstallPackage
 * Checks whether a package for a given packageName is installed locally. If package cannot be found, fetch and install it
 * @param {string} packageName - The package name
 * @param {string} [url] - A URL which will be used to fetch the package from
 * @return {boolean}
 */
const checkAndInstallPackage = (packageName, url) => wrapAsync(function*() {
	try {
		require.resolve(packageName);
		return true;
	} catch (err) {
		debug(`patternlab→checkAndInstallPackage: ${packageName} not installed. Fetching it now from NPM …`);
		yield fetchPackage(packageName, url);
		return false;
	}
});

/**
 * @func noop
 * @desc Plain arrow expression for noop
 */
const noop = () => {};

/**
 * Promisified helper functions based on fs-extra
 * 1. copyAsync
 * 2. mkdirsAsync
 * 3. moveAsync
 * 4. writeJsonAsync
 * 5. readJsonAsync
 */

const copyAsync = (src, target) => new Promise((resolve, reject) => {
	fs.copy(src, target, function (err) {
		if (err) return reject(err);
		return resolve();
	})
});

const mkdirsAsync = dir => new Promise((resolve, reject) => {
	fs.mkdirs(dir, function (err) {
		if (err) return reject(err);
		return resolve();
	})
});

const moveAsync = (dir, target) => new Promise((resolve, reject) => {
	fs.move(dir, target, function (err) {
		if (err) return reject(err);
		return resolve();
	})
});

const writeJsonAsync = (file, data) => new Promise((resolve, reject) => {
	fs.outputJson(file, data, function (err) {
		if (err) return reject(err);
		return resolve();
	});
});

const readJsonAsync = file => new Promise((resolve, reject) => {
	fs.readJson(file, function (err, data) {
		if (err) return reject(err);
		return resolve(data);
	});
});

module.exports = {
	copy,
	copyAsync,
	mkdirsAsync,
	moveAsync,
	writeJsonAsync,
	readJsonAsync,
	error,
	debug,
	wrapAsync,
	checkAndInstallPackage,
	noop
};
