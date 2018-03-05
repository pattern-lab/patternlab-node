'use strict';
const copy = require('./utils').copyWithPattern;
const debug = require('./utils').debug;
const wrapAsync = require('./utils').wrapAsync;

/**
 * @func copyFilesFromSourceToPublic
 * @desc Copies files from the source path to the public path.
 * @param {object} paths - The passed PatternLab config paths member.
 * @return {Array}
 */
const copyFilesFromSourceToPublic = paths =>
  wrapAsync(function*() {
    // Copy files over
    const copiedFiles = [
      copy(paths.source.styleguide, '*', paths.public.root),
      copy(paths.source.js, '**/*.js', paths.public.js),
      copy(paths.source.css, '*.css', paths.public.css),
      copy(paths.source.images, '*', paths.public.images),
      copy(paths.source.fonts, '*', paths.public.fonts),
      copy(paths.source.root, 'favicon.ico', paths.public.root),
    ];
    debug(`build: Your files were copied over to ${paths.public.root}`);
    return yield Promise.all(copiedFiles);
  });

module.exports = copyFilesFromSourceToPublic;
