'use strict';
const _ = require('lodash');
const path = require('path');
const process = require('process');

const copyFile = require('./copyFile');
const watchAssets = require('./watchAssets');
const watchPatternLabFiles = require('./watchPatternLabFiles');

const copier = () => {
  const transform_paths = directories => {
    //create array with all source keys minus our blacklist
    const dirs = {};
    const blackList = [
      'root',
      'patterns',
      'data',
      'meta',
      'annotations',
      'patternlabFiles',
    ];
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

  const copyAndWatch = (assetDirectories, patternlab, options) => {
    //take our configured paths and sanitize best we can to only the assets
    const dirs = transform_paths(assetDirectories);

    //find out where we are
    const basePath = path.resolve(process.cwd());

    const copyOptions = {
      overwrite: true,
      emitter: patternlab.events,
      debug: patternlab.config.logLevel === 'debug',
    };

    //loop through each directory asset object (source / public pairing)

    const copyPromises = [];

    _.each(dirs, (dir, key) => {
      //if we want to watch files, do so, otherwise just copy each file
      if (options.watch) {
        watchAssets(patternlab, basePath, dir, key, copyOptions);
      } else {
        //just copy
        const destination = path.resolve(basePath, dir.public);
        copyPromises.push(copyFile(dir.source, destination, copyOptions));
      }
    });

    // copy the styleguide
    copyPromises.push(
      copyFile(
        assetDirectories.source.styleguide,
        assetDirectories.public.root,
        copyOptions
      )
    );

    // copy the favicon
    copyPromises.push(
      copyFile(
        `${assetDirectories.source.root}/favicon.ico`,
        `${assetDirectories.public.root}/favicon.ico`,
        copyOptions
      )
    );

    return Promise.all(copyPromises).then(() => {
      //we need to special case patterns/**/*.md|.json|.pattern-extensions as well as the global structures
      if (options.watch) {
        return watchPatternLabFiles(patternlab, assetDirectories, basePath);
      }
    });
  };

  return {
    copyAndWatch: (assetDirectories, patternlab, options) => {
      return copyAndWatch(assetDirectories, patternlab, options);
    },
    transformConfigPaths: paths => {
      return transform_paths(paths);
    },
  };
};

module.exports = copier;
