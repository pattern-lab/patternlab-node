const webpack = require('webpack');
const express = require('express');
const browserSync = require('browser-sync').create();
const webpackDevMiddleware = require('webpack-dev-middleware');
const opn = require('better-opn');
const path = require('path');
const hasha = require('hasha');
const webpackDevServerWaitpage = require('./webpack-dev-server-waitpage');
const webpackConfig = require('../webpack.config');
const app = express();
const portfinder = require('portfinder');

const fileHashes = {};

// @todo: move these configs + make customizable?
const buildDir = 'www';
const root = path.resolve(__dirname, `../${buildDir}`);
const preferredPort = 3000;
portfinder.basePort = preferredPort;

async function serve(patternlab) {
  const webpackConfigs = await webpackConfig({
    watch: false,
    prod: false,
    buildDir: path.resolve(__dirname, `../${buildDir}`),
  });

  const port = await portfinder
    .getPortPromise()
    .then(port => {
      return port;
    })
    .catch(err => {
      console.log(err);
      return 3000;
    });

  // customize bs reload behavior based on the type of asset that's changed
  const filesToWatch = [
    `${root}/**/*.css`,
    `${root}/**/*.js`,
    {
      match: [`${root}/**/*.svg`, `${root}/**/*.png`, `${root}/**/*.jpg`],
      fn: async function() {
        browserSync.reload();
      },
    },
    // only reload the Webpack-generated HTML files when the contents have changed
    {
      match: [`${root}/*.html`, `${root}/styleguide/html/*.html`],
      fn: async function(event, filePath) {
        let updatedHash = false;

        const hash = await hasha.fromFile(
          path.resolve(__dirname, `../${filePath}`),
          { algorithm: 'md5' }
        );

        if (!fileHashes[filePath] || fileHashes[filePath] !== hash) {
          fileHashes[filePath] = hash;
          updatedHash = true;
        }

        if (updatedHash && !patternlab.isBusy()) {
          browserSync.reload(filePath);
        }
      },
    },
  ];

  browserSync.init(
    {
      proxy: `127.0.0.1:${port}`,
      logLevel: 'info',
      ui: false,
      notify: false,
      open: false,
      tunnel: false,
      port,
      logFileChanges: false,
      reloadOnRestart: true,
      watchOptions: {
        ignoreInitial: true,
      },
      files: filesToWatch,
    },
    function(err, bs) {
      // assigned port from browsersync based on what's available
      const assignedPort = bs.options.get('port');
      opn(`http://localhost:${assignedPort}`);
      const compiler = webpack(webpackConfigs);

      app.use(
        webpackDevServerWaitpage(compiler, {
          proxyHeader: 'browsersync-proxy',
          redirectPath: `http://localhost:${assignedPort}`,
        })
      );

      app.use(
        webpackDevMiddleware(compiler, {
          quiet: true,
          stats: 'none',
          writeToDisk: true,
          logLevel: 'silent',
        })
      );

      app.use(express.static(root));

      app.listen(assignedPort, '127.0.0.1', function onStart(error) {
        if (error) {
          console.log(error);
        }
      });
    }
  );

  // auto-reload the page when PL finishes compiling
  patternlab.events.on('patternlab-build-end', () => {
    browserSync.reload();
  });
}

module.exports = {
  serve,
};
