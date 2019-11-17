const webpackServer = require('./build/webpack-server.js');
const path = require('path');
const fs = require('fs-extra');

fs.mkdirp('./node_modules/@pattern-lab/');
fs.unlinkSync('./dependencyGraph.json');
fs.ensureSymlink(__dirname, './node_modules/@pattern-lab/uikit-workshop');

const configKeysEndingWithASlash = [
  'root',
  'patterns',
  'data',
  'meta',
  'annotations',
];

const configFilePath =
  '../development-edition-engine-handlebars/patternlab-config.json';
const config = require(configFilePath);

// adjust the config to output to a temp `www` folder locally for testing
Object.keys(config.paths.source).forEach(key => {
  const value = config.paths.source[key];

  if (typeof value === 'string' && value.includes('source')) {
    config.paths.source[key] = path.relative(
      __dirname,
      path.resolve(__dirname, path.dirname(configFilePath), value)
    );
  }

  if (configKeysEndingWithASlash.includes(key)) {
    config.paths.source[key] = config.paths.source[key] + '/';
  }
});

Object.keys(config.paths.public).forEach(key => {
  const value = config.paths.public[key];

  if (typeof value === 'string' && value.includes('public')) {
    config.paths.public[key] = config.paths.public[key].replace(
      'public',
      'www'
    );
  }
});

const patternlab = require('@pattern-lab/core')(config);

// build + start watch mode
patternlab.build({
  watch: true,
  cleanPublic: true,
});

webpackServer.serve(patternlab);
