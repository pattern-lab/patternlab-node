'use strict';
const fs = require('fs');
const path = require('path');
const Archiver = require('archiver');
const isValidConfig = require('./validate-config');
const debug = require('./utils').debug;

/**
 * @func exportPatterns
 * @desc Exports the patterns into the patternExportDirectory.
 * @param {object} config - The passed Pattern Lab config.
 */
function exportPatterns(config) {
  if (!isValidConfig) {
    throw new TypeError(
      'export: Expects config not to be empty OR of type object if not empty.'
    );
  }

  const archive = new Archiver('zip', {});
  const exportsPath = path.resolve(
    './',
    config.patternExportDirectory,
    'patterns.zip'
  );
  const output = fs.createWriteStream(exportsPath);

  output.on('close', () => {
    debug(
      `export: Exported patterns in ${exportsPath} - ${archive.pointer()} total bytes.`
    );
  });

  archive.on('error', function (err) {
    throw new TypeError(
      `export: An error occured during zipping the patterns: ${err}`
    );
  });

  archive.pipe(output);

  archive
    .glob(
      '?(_patterns|_data|_meta|_annotations)/**',
      {
        cwd: config.paths.source.root,
      },
      {}
    )
    .finalize();
}

module.exports = exportPatterns;
