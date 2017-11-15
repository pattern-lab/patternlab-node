"use strict";
const _ = require('lodash');
const path = require('path');
const process = require('process');
const logger = require('./log');

let copy = require('recursive-copy'); // eslint-disable-line prefer-const
let chokidar = require('chokidar'); // eslint-disable-line prefer-const

const asset_copier = () => {

  const transform_paths = (directories) => {
    //create array with all source keys minus our blacklist
    const dirs = {};
    const blackList = ['root', 'patterns', 'data', 'meta', 'annotations', 'patternlabFiles'];
    _.each(directories.source, (dir, key) => {

      if (blackList.includes(key)) {
        return;
      }

      if (!dirs.key) {
        dirs[key] = {};
      }
    });

    // loop through all source keys
    _.each(dirs, (dir, key) => {
      // add source key path
      dirs[key].source = directories.source[key];

      // add public key path
      dirs[key].public = directories.public[key];
    });
    return dirs;
  };

  const copyFile = (p, dest, options) => {
    copy(
      p,
      dest,
      options
    ).on(copy.events.COPY_FILE_COMPLETE, () => {
      logger.debug(`Moved ${p} to ${dest}`);
      options.emitter.emit('patternlab-asset-change', {
        file: p,
        dest: dest
      });
    });
  };

  const asset_copy = (assetDirectories, patternlab, options) => {

    //take our configured paths and sanitize best we can to only the assets
    const dirs = transform_paths(assetDirectories);

    //find out where we are
    const basePath = path.resolve(process.cwd());

    const copyOptions =
      {
        overwrite: true,
        emitter: patternlab.events,
        debug: patternlab.config.debug
      };

    //loop through each directory asset object (source / public pairing)
    _.each(dirs, (dir, key) => {

      //if we want to watch files, do so, otherwise just copy each file
      if (options.watch) {
        logger.info(`Pattern Lab is watching ${path.resolve(basePath, dir.source)} for changes`);

        if (patternlab.watchers[key]) {
          patternlab.watchers[key].close();
        }

        const assetWatcher = chokidar.watch(
          path.resolve(basePath, dir.source),
          {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: false,
            awaitWriteFinish : {
              stabilityThreshold: 200,
              pollInterval: 100
            }
          }
        );

        //watch for changes and copy
        assetWatcher.on('addDir', (p) => {
          const destination = path.resolve(basePath, dir.public + '/' + path.basename(p));
          copyFile(p, destination, copyOptions);
        }).on('add', (p) => {
          const destination = path.resolve(basePath, dir.public + '/' + path.basename(p));
          copyFile(p, destination, copyOptions);
        }).on('change', (p) => {
          const destination = path.resolve(basePath, dir.public + '/' + path.basename(p));
          copyFile(p, destination, copyOptions);
        });

        patternlab.watchers[key] = assetWatcher;

      } else {
        //just copy
        const destination = path.resolve(basePath, dir.public);
        copyFile(dir.source, destination, copyOptions);
      }
    });

    // copy the styleguide
    copyFile(assetDirectories.source.styleguide, assetDirectories.public.root, copyOptions);

    // copy the favicon
    copyFile(`${assetDirectories.source.root}/favicon.ico`, `${assetDirectories.public.root}/favicon.ico`, copyOptions);

    //we need to special case patterns/**/*.md|.json|.pattern-extensions as well as the global structures
    if (options.watch) {

      // watch global structures, such as _data/* and _meta/
      const globalSources = [assetDirectories.source.data, assetDirectories.source.meta];
      const globalPaths = globalSources.map(globalSource => path.join(
        basePath,
        globalSource,
        '*'
      ));

      _.each(globalPaths, (globalPath) => {

        logger.info(`Pattern Lab is watching ${globalPath} for changes`);

        if (patternlab.watchers[globalPath]) {
          patternlab.watchers[globalPath].close();
        }

        const globalWatcher = chokidar.watch(
          path.resolve(globalPath),
          {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true,
            awaitWriteFinish : {
              stabilityThreshold: 200,
              pollInterval: 100
            }
          }
        );

        //watch for changes and rebuild
        globalWatcher.on('addDir', (p) => {
          patternlab.events.emit('patternlab-global-change', {
            file: p
          });
        })
        .on('add', (p) => {
          patternlab.events.emit('patternlab-global-change', {
            file: p
          });
        }).on('change', (p) => {
          patternlab.events.emit('patternlab-global-change', {
            file: p
          });
        });

        patternlab.watchers[globalPath] = globalWatcher;

      });

      // watch patterns
      const baseFileExtensions = ['.json', '.yml', '.yaml', '.md'];
      const patternWatches = baseFileExtensions.concat(patternlab.engines.getSupportedFileExtensions()).map(
        dotExtension => path.join(
          basePath,
          assetDirectories.source.patterns,
          `/**/*${dotExtension}`
        )
      );
      _.each(patternWatches, (patternWatchPath) => {

        logger.info(`Pattern Lab is watching ${patternWatchPath} for changes`);

        const patternWatcher = chokidar.watch(
          path.resolve(patternWatchPath),
          {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true,
            awaitWriteFinish : {
              stabilityThreshold: 200,
              pollInterval: 100
            }
          }
        );

        //watch for changes and rebuild
        patternWatcher.on('addDir', (p) => {
          patternlab.events.emit('patternlab-pattern-change', {
            file: p
          });
        }).on('add', (p) => {
          patternlab.events.emit('patternlab-pattern-change', {
            file: p
          });
        }).on('change', (p) => {
          patternlab.events.emit('patternlab-pattern-change', {
            file: p
          });
        });
      });
    }
  };

  return {
    copyAssets: (assetDirectories, patternlab, options) => {
      asset_copy(assetDirectories, patternlab, options);
    },
    transformConfigPaths: (paths) => {
      return transform_paths(paths);
    }
  };

};

module.exports = asset_copier;
