"use strict";
const plutils = require('./utilities');
const _ = require('lodash');
const path = require('path');
const process = require('process');

let copy = require('recursive-copy'); // eslint-disable-line
let chokidar = require('chokidar'); // eslint-disable-line

const asset_copier = () => {

  const transform_paths = (directories) => {
    //create array with all source keys minus our blacklist
    const dirs = {};
    const blackList = ['root', 'patterns', 'data', 'meta', 'annotations', 'styleguide', 'patternlabFiles'];
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
    ).on(copy.events.COPY_FILE_COMPLETE, (copyOperation) => {
      console.log(`Moved ${p} to ${dest}`);
    });
  };

  const asset_copy = (assetDirectories, patternlab, options) => {
    //take our configured paths and sanitize best we can to only the assets
    const dirs = transform_paths(assetDirectories);

    //find out where we are
    const basePath = path.resolve(process.cwd());

    const copyOptions =
      {
        overwrite: true
      };

      console.log(60, dirs)

    //loop through each directory asset object (source / public pairing)
    _.each(dirs, (dir, key) => {

      //if we want to watch files, do so, otherwise just copy each file
      if (options.watch) {
        console.log(49, `watching ${path.resolve(basePath, dir.source)}`);
        const watcher = chokidar.watch(
          path.resolve(basePath, dir.source),
          {
            ignored: /(^|[\/\\])\../,
            ignoreInitial: true,
            awaitWriteFinish : {
              stabilityThreshold: 1000,
              pollInterval: 100
            }
          }
        );

        //watch for changes and copy
        watcher.on('addDir', (p) => {
          const destination = path.resolve(basePath, dir.public + '/' + path.basename(p));
          copyFile(p, destination, copyOptions);
        }).on('add', (p) => {
          const destination = path.resolve(basePath, dir.public + '/' + path.basename(p));
          copyFile(p, destination, copyOptions);
        }).on('change', (p) => {
          const destination = path.resolve(basePath, dir.public + '/' + path.basename(p));
          copyFile(p, destination, copyOptions);
        });

      } else {
        //just copy
        const destination = path.resolve(basePath, dir.public);
        copyFile(dir.source, destination, copyOptions);
      }
    });
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
