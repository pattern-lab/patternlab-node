'use strict';
const _ = require('lodash');
const path = require('path');

const logger = require('./log');
const events = require('./events');
const pm = require('./plugin_manager');
const pluginMananger = new pm();

let chokidar = require('chokidar'); // eslint-disable-line prefer-const

const watchPatternLabFiles = (
  patternlab,
  assetDirectories,
  basePath,
  watchOnce
) => {
  // watch global structures, such as _data/* and _meta/
  const globalSources = [
    assetDirectories.source.data,
    assetDirectories.source.meta,
  ];
  const globalPaths = globalSources.map((globalSource) =>
    path.join(path.resolve(basePath, globalSource), '*')
  );

  _.each(globalPaths, (globalPath) => {
    logger.debug(`Pattern Lab is watching ${globalPath} for changes!`);

    if (patternlab.watchers[globalPath]) {
      patternlab.watchers[globalPath].close();
    }

    const globalWatcher = chokidar.watch(path.resolve(globalPath), {
      ignored: /(^|[\/\\])\../,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
      persistent: !watchOnce,
    });

    //watch for changes and rebuild
    globalWatcher
      .on('addDir', async (p) => {
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_GLOBAL_CHANGE,
          {
            file: p,
          }
        );
      })
      .on('add', async (p) => {
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_GLOBAL_CHANGE,
          {
            file: p,
          }
        );
      })
      .on('change', async (p) => {
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_GLOBAL_CHANGE,
          {
            file: p,
          }
        );
      });

    patternlab.watchers[globalPath] = globalWatcher;
  });

  // watch patterns
  const baseFileExtensions = ['.json', '.yml', '.yaml', '.md'];
  const patternWatches = baseFileExtensions
    .concat(patternlab.engines.getSupportedFileExtensions())
    .map((dotExtension) =>
      path.join(
        path.resolve(basePath, assetDirectories.source.patterns),
        `/**/*${dotExtension}`
      )
    );
  _.each(patternWatches, (patternWatchPath) => {
    logger.debug(
      `Pattern Lab is watching ${patternWatchPath} for changes - local!`
    );

    if (patternlab.watchers[patternWatchPath]) {
      patternlab.watchers[patternWatchPath].close();
    }

    const patternWatcher = chokidar.watch(path.resolve(patternWatchPath), {
      ignored: /(^|[\/\\])\../,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100,
      },
      persistent: !watchOnce,
    });

    //watch for changes and rebuild
    patternWatcher
      .on('addDir', async (p) => {
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_PATTERN_CHANGE,
          {
            file: p,
          }
        );
      })
      .on('add', async (p) => {
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_PATTERN_CHANGE,
          {
            file: p,
          }
        );
      })
      .on('change', async (p) => {
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_PATTERN_CHANGE,
          {
            file: p,
          }
        );
      })
      // the watcher does not react on unlink and unlinkDir
      // events, so patterns are never removed
      .on('unlink', async (p) => {
        patternlab.graph.sync();
        patternlab.graph.upgradeVersion();
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_PATTERN_CHANGE,
          {
            file: p,
          }
        );
      })
      .on('unlinkDir', async (p) => {
        patternlab.graph.sync();
        patternlab.graph.upgradeVersion();
        await pluginMananger.raiseEvent(
          patternlab,
          events.PATTERNLAB_PATTERN_CHANGE,
          {
            file: p,
          }
        );
      });
    patternlab.watchers[patternWatchPath] = patternWatcher;
  });

  logger.info(
    `Pattern Lab is watching for changes to files under ${assetDirectories.source.root}`
  );
  return Promise.resolve();
};

module.exports = watchPatternLabFiles;
