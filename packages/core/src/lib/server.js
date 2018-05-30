'use strict';
const path = require('path');
const liveServer = require('@pattern-lab/live-server');

const events = require('./events');
const logger = require('./log');

// initialize serverReady outside of the serve method

let serverReady = false;

// this would be a private init to manage stuff for all exposed module methods
const getServerReady = () => serverReady;
const setServerReady = bool => {
  serverReady = bool;
};

const serve = patternlab => {
  //externalize the serverReady flag
  //let serverReady = false;
  setServerReady(false);

  // our default liveserver config
  const defaults = {
    root: patternlab.config.paths.public.root,
    open: true,
    ignore: path.join(path.resolve(patternlab.config.paths.public.root)),
    file: 'index.html',
    logLevel: 0, // errors only
    wait: 1000,
    port: 3000,
  };

  return Promise.all(
    _.map(patternlab.uikits, uikit => {
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

      // watch for asset changes, and reload appropriately
      patternlab.events.on(events.PATTERNLAB_PATTERN_ASSET_CHANGE, data => {
        if (getServerReady()) {
          const reload = setInterval(() => {
            if (!patternlab.isBusy) {
              if (data.file.indexOf('css') > -1) {
                liveServer.refreshCSS();
              } else {
                liveServer.reload();
              }
              clearInterval(reload);
            }
          }, 1000);
        }
      });

      //watch for pattern changes, and reload
      patternlab.events.on(events.PATTERNLAB_PATTERN_CHANGE, () => {
        if (getServerReady()) {
          const reload = setInterval(() => {
            if (!patternlab.isBusy) {
              liveServer.reload();
              clearInterval(reload);
            }
          }, 1000);
        }
      });

      return new Promise((resolve, reject) => {
        //start!
        setTimeout(() => {
          try {
            liveServer.start(liveServerConfig);
            logger.info(
              `Pattern Lab is being served from http://127.0.0.1:${
                liveServerConfig.port
              }`
            );
            setServerReady(true);
            resolve('Server started!');
          } catch (e) {
            reject(e);
          }
        }, liveServerConfig.wait);
      });
    })
  );
};

const reload = () => {
  return new Promise((resolve, reject) => {
    if (!getServerReady()) {
      reject('Cannot reload because server is not ready');
    }
    liveServer.reload();
    resolve('Server reloaded');
  });
};

const refreshCSS = () => {
  return new Promise((resolve, reject) => {
    if (!getServerReady()) {
      reject('Cannot reload because server is not ready');
    }
    liveServer.refreshCSS();
    resolve('CSS refreshed');
  });
};

//expose as 'server' module with methods serve, reload, and refreshCSS
module.exports = {
  serve,
  reload,
  refreshCSS,
};
