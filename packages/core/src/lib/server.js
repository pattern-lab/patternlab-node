'use strict';

const path = require('path');
const liveServer = require('@pattern-lab/live-server');

const events = require('./events');
const logger = require('./log');

const server = (patternlab) => {
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

      const servers = Object.keys(patternlab.uikits).map((kit) => {
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
        defaults.assets = [
          path.resolve(
            path.join(
              process.cwd(),
              patternlab.config.paths.source.js,
              '**',
              '*.js' // prevent preprocessors like typescript from reloading
            )
          ),
          path.resolve(
            path.join(process.cwd(), patternlab.config.paths.source.images)
          ),
          path.resolve(
            path.join(process.cwd(), patternlab.config.paths.source.fonts)
          ),
          path.resolve(
            path.join(
              process.cwd(),
              patternlab.config.paths.source.css,
              '**',
              '*.css' // prevent preprocessors from reloading
            )
          ),
        ];

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
              _module.reload({
                file: '',
                action: 'reload',
              });
            }
          });
        };

        //start!
        //There is a new server instance for each uikit
        const serveKit = new Promise((resolve, reject) => {
          let resolveMsg = '';
          setTimeout(() => {
            try {
              liveServer.start(liveServerConfig);
              resolveMsg = `Pattern Lab is being served from ${
                liveServerConfig.https ? 'https' : 'http'
              }://127.0.0.1:${liveServerConfig.port}`;
              logger.info(resolveMsg);
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
    reload: (data) => {
      const _data = data || {
        file: '',
        action: '',
      };
      return new Promise((resolve, reject) => {
        let action;
        try {
          if (!patternlab.isBusy) {
            if (_data.file.indexOf('css') > -1 || _data.action === 'refresh') {
              action = 'refreshed CSS';
              liveServer.refreshCSS();
            } else {
              action = 'reloaded';
              liveServer.reload();
            }
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
