const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const webpack = require('webpack');

const data = {
  webpackVersion: webpack.version,
  webpackDevServerVersion: '2.4.1',
  progress: [[0]],
};

/**
 * @typedef {object} WebpackDevServerWaitpageOptions
 * @property title {string}
 * @property theme {string}
 * @property template {string}
 * @property disableWhenValid {boolean}
 */

/** @type {WebpackDevServerWaitpageOptions} */
const defaultOptions = {
  title: 'Development Server',
  theme: 'pl-loading',
  disableWhenValid: true,
};

/**
 * webpack-dev-server-waitpage middleware factory
 * @param server {Server} The server argument passed to webpack-dev-server's 'before' function
 * @param [options] {WebpackDevServerWaitpageOptions} An optional object of options (see Readme for more information)
 * @returns {Function} Koa compatible middleware
 */
const webpackDevServerWaitpage = (server, options) => {
  if (!server) {
    throw new Error(
      `webpack-dev-server's compilers argument must be supplied as first parameter.`
    );
  }

  /** @type {WebpackDevServerWaitpageOptions} */
  options = Object.assign({}, defaultOptions, options);

  const compilers = server.compilers;
  //  || [server.middleware.context.compiler];
  for (let i = 0; i < compilers.length; i++) {
    new webpack.ProgressPlugin(function() {
      data.progress[i] = arguments;
    }).apply(compilers[i]);
  }

  let template = options.template;
  if (!template) {
    if (
      fs
        .readdirSync(__dirname)
        .filter(x => x.endsWith('.ejs'))
        .map(x => x.slice(0, -4))
        .indexOf(options.theme) < 0
    ) {
      throw new Error(`Unknown theme provided: ${options.theme}`);
    }
    template = fs.readFileSync(
      path.resolve(__dirname, options.theme + '.ejs'),
      'utf8'
    );
  }

  // eslint-disable-next-line no-return-assign
  Object.keys(options).forEach(key => (data[key] = options[key])); // expend data with options

  let wasValid = false;

  return async (req, res, next) => {
    const valid = data.progress.every(p => p[0] === 1);
    wasValid = wasValid || valid;

    if (
      valid || // already valid
      (options.disableWhenValid && wasValid) || // if after valid state should be disabled
      req.method !== 'GET'
    ) {
      return await next();
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(ejs.render(template, data));
    }
  };
};

module.exports = webpackDevServerWaitpage;
