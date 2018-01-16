"use strict";
const path = require('path');
const liveServer = require('@pattern-lab/live-server');
const logger = require('./log');

const serve = (patternlab) => {
  let serverReady = false;

  // our default liveserver config
  const defaults = {
    root: patternlab.config.paths.public.root,
    open: true,
    ignore: path.join(path.resolve(patternlab.config.paths.public.root)),
    file: 'index.html',
    logLevel: 0, // errors only
    wait: 1000,
    port: 3000
  };

  // allow for overrides should they exist inside patternlab-config.json
  const liveServerConfig = Object.assign({}, defaults, patternlab.config.serverOptions);

  // watch for asset changes, and reload appropriately
  patternlab.events.on('patternlab-asset-change', (data) => {
    if (serverReady) {
      if (data.file.indexOf('css') > -1) {
        liveServer.refreshCSS();
      } else {
        liveServer.reload();
      }
    }
  });

  //watch for pattern changes, and reload
  patternlab.events.on('patternlab-pattern-change', () => {
    if (serverReady) {
      liveServer.reload();
    }
  });

  //start!
  setTimeout(() => {
    liveServer.start(liveServerConfig);
    logger.info(`Pattern Lab is being served from http://127.0.0.1:${liveServerConfig.port}`);
    serverReady = true;
  }, liveServerConfig.wait);

};

module.exports = serve;
