'use strict';

const path = require('path');
const browserSync = require('browser-sync').create();
const opn = require('better-opn');

const events = require('./events');
const logger = require('./log');

const server = patternlab => {
  const _module = {
    serve: () => {
      let serverReady = false;

      // our default liveserver config
      const defaults = {
        open: true,
        file: 'index.html',
        logLevel: 0, // errors only
        wait: 1000,
        port: 3000,
      };

      const servers = Object.keys(patternlab.uikits).map(kit => {
        const uikit = patternlab.uikits[kit];
        defaults.root = path.resolve(
          path.join(
            process.cwd(),
            uikit.outputDir,
            patternlab.config.paths.public.root
          )
        );
        defaults.ignore = path.resolve(
          path.join(
            process.cwd(),
            uikit.outputDir,
            patternlab.config.paths.public.root
          )
        );

        // allow for overrides should they exist inside patternlab-config.json
        const liveServerConfig = Object.assign(
          {},
          defaults,
          patternlab.config.serverOptions
        );

        const setupEventWatchers = () => {
          //watch for builds to complete
          patternlab.events.on(events.PATTERNLAB_BUILD_END, () => {
            if (serverReady) {
              browserSync.reload();
            }
          });
        };

        //start!
        //There is a new server instance for each uikit
        const serveKit = new Promise((resolve, reject) => {
          let resolveMsg = '';
          setTimeout(() => {
            try {
              browserSync.init(
                {
                  logLevel: 'info',
                  ui: false,
                  notify: false,
                  open: false,
                  logFileChanges: false,
                  reloadOnRestart: true,
                  port: liveServerConfig.port, // try to use this port but choose another if unavailable
                  server: liveServerConfig.root,
                  files: [
                    `${liveServerConfig.root}/**/*.css`,
                    `${liveServerConfig.root}/**/*.js`,
                  ],
                  watchOptions: {
                    ignoreInitial: false,
                  },
                },
                function(err, bs) {
                  const port = bs.options.get('port');
                  serverReady = true; // so we only spin this up once Webpack has finished up initially

                  resolveMsg = `Pattern Lab is being served from http://127.0.0.1:${port}`;
                  opn(`http://127.0.0.1:${port}`);
                  logger.info(resolveMsg);
                }
              );

              browserSync.watch(
                `${liveServerConfig.root}/**.html`,
                (event, file) => {
                  if (!patternlab.isBusy) {
                    browserSync.reload('**/*.html');
                  }
                }
              );
            } catch (e) {
              const err = `Pattern Lab serve failed to start: ${e}`;
              logger.error(`Pattern Lab serve failed to start: ${e}`);
              reject(err);
            }
            setupEventWatchers();
            serverReady = true;
            resolve(resolveMsg);
          }, liveServerConfig.wait);
        });
        return serveKit;
      });

      return Promise.all(servers);
    },
    reload: data => {
      const _data = data || {
        file: '',
        action: '',
      };
      return new Promise((resolve, reject) => {
        let action;
        try {
          if (!patternlab.isBusy) {
            // @todo: re-evaluate to see if this specific logic is still necessary
            // if (_data.file.indexOf('css') > -1 || _data.action === 'refresh') {
            //   action = 'refreshed CSS';
            //   // browserSync.refreshCSS();
            // } else {
            //   action = 'reloaded';
            //   // browserSync.reload();
            // }
            browserSync.reload();
            resolve(`Server ${action} successfully`);
          }
        } catch (e) {
          reject(`Server reload or refresh failed: ${e}`);
        }
      });
    },
    refreshCSS: () => {
      return _module.reload({
        file: '',
        action: 'refresh',
      });
    },
  };
  return _module;
};

module.exports = server;
