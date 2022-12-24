'use strict';
const _ = require('lodash');
const path = require('path');
const process = require('process');

const copyFile = require('./copyFile');
const watchAssets = require('./watchAssets');
const watchPatternLabFiles = require('./watchPatternLabFiles');

const copier = () => {
  const transform_paths = (directories) => {
    //create array with all source keys minus our blacklist
    const dirs = {};
    const blackList = [
      'root',
      'patterns',
      'data',
      'meta',
      'annotations',
      'patternlabFiles',
      'styleguide',
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

    // Adding assets to filter for in case of transformedAssetTypes defined; adapted regex from https://stackoverflow.com/a/6745455
    if (patternlab.config.transformedAssetTypes) {
      copyOptions.filter = new RegExp(
        `.*(?<![.](${patternlab.config.transformedAssetTypes.join('|')}))$`,
        'i'
      );
    }

    //loop through each directory asset object (source / public pairing)

    const copyPromises = [];

    _.each(dirs, (dir, key) => {
      //if we want to watch files, do so, otherwise just copy each file
      if (options.watch) {
        watchAssets(patternlab, basePath, dir, key, copyOptions);
      } else {
        //just copy
        copyPromises.push(
          _.map(patternlab.uikits, (uikit) => {
            copyFile(
              dir.source,
              path.join(basePath, uikit.outputDir, dir.public),
              copyOptions
            );
          })
        );
      }
    });

    // copy the styleguide
    copyPromises.push(
      _.map(patternlab.uikits, (uikit) => {
        copyFile(
          path.join(uikit.modulePath, assetDirectories.source.styleguide),
          path.join(basePath, uikit.outputDir, assetDirectories.public.root),
          copyOptions
        );
      })
    );

    // copy the favicon
    copyPromises.push(
      _.map(patternlab.uikits, (uikit) => {
        copyFile(
          `${assetDirectories.source.root}favicon.ico`,
          path.join(
            basePath,
            uikit.outputDir,
            `${assetDirectories.public.root}/favicon.ico`
          ),
          copyOptions
        );
      })
    );

    return Promise.all(copyPromises).then(() => {
      //we need to special case patterns/**/*.md|.json|.pattern-extensions as well as the global structures
      if (options.watch) {
        return watchPatternLabFiles(patternlab, assetDirectories, basePath);
      }
      return Promise.resolve();
    });
  };

  return {
    copyAndWatch: (assetDirectories, patternlab, options) => {
      return copyAndWatch(assetDirectories, patternlab, options);
    },
    transformConfigPaths: (paths) => {
      return transform_paths(paths);
    },
  };
};

module.exports = copier;
