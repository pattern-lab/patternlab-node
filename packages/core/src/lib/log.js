'use strict';

const chalk = require('chalk');
const EventEmitter = require('events').EventEmitter;

/**
 * @name log
 * @desc tiny event-based logger
 * @type {*}
 */
const log = Object.assign(
  {
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
 * @desc Coloured info log
 * @param  {*} msg - The variadic messages to log out.
 * @return {void}
 */
const info = log.info.bind(log);

/**
 * @func warning
 * @desc Coloured warning log
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
 * Useful for reporting errors in .catch() on Promises
 * @param {string} - a message to report
 * @returns {function} - a callback to be passed to a Promise's .catch()
 */
const reportError = function (message) {
  return function (err) {
    console.log(message);
    console.log(err);
  };
};

module.exports = {
  debug,
  info,
  warning,
  error,
  log,
  reportError,
};
