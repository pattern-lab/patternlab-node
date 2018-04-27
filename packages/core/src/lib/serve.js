'use strict';

const _ = require('lodash');
const path = require('path');
const liveServer = require('@pattern-lab/live-server');

const events = require('./events');
const logger = require('./log');

const serve = patternlab => {
  let serverReady = false;

  // our default liveserver config
  const defaults = {
    open: true,
    file: 'index.html',
    logLevel: 0, // errors only
    wait: 1000,
    port: 3000,
  };

  _.each(patternlab.uikits, uikit => {
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

    //start!
    setTimeout(() => {
      liveServer.start(liveServerConfig);
      logger.info(
        `Pattern Lab is being served from http://127.0.0.1:${
          liveServerConfig.port
        }`
      );
      serverReady = true;
    }, liveServerConfig.wait);
  });

  // watch for asset changes, and reload appropriately
  patternlab.events.on(events.PATTERNLAB_PATTERN_ASSET_CHANGE, data => {
    if (serverReady) {
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
    if (serverReady) {
      const reload = setInterval(() => {
        if (!patternlab.isBusy) {
          liveServer.reload();
          clearInterval(reload);
        }
      }, 1000);
    }
  });
};

module.exports = serve;
