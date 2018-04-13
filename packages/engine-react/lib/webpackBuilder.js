const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const mkdirp = require('mkdirp');
const { createFsFromVolume, Volume } = require('memfs');
const { Union } = require('unionfs');
const MemoryFS = require('memory-fs');
const tmp = require('tmp-promise');
const util = require('./util');

const engineModulesPath = path.resolve(__dirname, '..', 'node_modules');
const webpackModuleConfig = {
  rules: [
    {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              path.join(engineModulesPath, 'babel-preset-env'),
              {
                targets: {
                  node: 'current',
                  browsers: ['last 2 versions'],
                },
              },
            ],
            path.join(engineModulesPath, 'babel-preset-react'),
          ],
        },
      },
    },
  ],
};

function handleWebpackErrors(stats, err, message) {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    throw [message, err];
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    info.errors.forEach(e => {
      console.error(e);
    });
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
}

function createUnionFS() {
  const ramDisk = new Volume();
  const ufs = new Union();

  ufs.use(fs).use(ramDisk);

  // patch ufs like webpack does internally
  ufs.join = path.join.bind(path);
  ufs.mkdirp = mkdirp;

  return { ramDisk: createFsFromVolume(ramDisk), ufs: createFsFromVolume(ufs) };
}

async function generateServerScript(
  pattern,
  data,
  patternLabConfig,
  engineFileExtension
) {
  console.log('generating server script...');
  const entry = `./${pattern.fileName}${pattern.fileExtension}`;
  const context = path.dirname(
    util.getAbsolutePatternPath(pattern, patternLabConfig)
  );

  const { ufs } = createUnionFS();

  // ramDisk.writeFileSync('/foo', 'bar');

  // console.log('webpack entry is', entry);
  // console.log('webpack context is', context);

  const compiler = webpack({
    context,
    entry,
    resolve: {
      extensions: engineFileExtension,
      modules: ['node_modules', engineModulesPath],
    },
    resolveLoader: {
      modules: [engineModulesPath, 'node_modules'],
    },
    output: {
      filename: 'blob.js',
      library: 'patternModule',
      libraryTarget: 'commonjs2',
      path: '/',
    },
    module: webpackModuleConfig,
  });

  // Use the in-memory file system for output
  compiler.outputFileSystem = ufs;
  // compiler.outputFileSystem = memfs.createFsFromVolume(ramDisk);
  // compiler.outputFileSystem = ufs;

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      // Handle errors here
      try {
        handleWebpackErrors(
          stats,
          err,
          'something went wrong in generateServerScript():'
        );
      } catch (e) {
        reject(e);
      }
      // Read the file back into a string and return!
      const output = ufs.readFileSync('/blob.js', 'utf8');
      resolve(output);
    });
  });
}

function createClientSideEntry(data) {
  return `
import React from 'react';
import ReactDOM from 'react-dom';
import Component from 'blob';
console.log('Component: ', Component);
const data = ${JSON.stringify(data)};

ReactDOM.render(React.createElement(Component, data), document.body);
`;
}

async function writeClientSideEntry(data, filesystem) {
  const fileName = 'entry.js';
  const entryFileContents = createClientSideEntry(data);

  filesystem.writeFileSync(path.join('/', fileName), entryFileContents);
  return fileName;
}

async function writeComponentScript(componentScript, filesystem) {
  const fileName = 'Component.js';
  filesystem.writeFileSync(path.join('/', fileName), componentScript);

  return fileName;
}

async function createClientSideEntryTmp(data) {
  const entryFile = await tmp.file({ prefix: 'pattern-', postfix: '.js' });
  const entryFileContents = createClientSideEntry(data);

  fs.writeSync(entryFile.fd, entryFileContents, { encoding: 'utf8' });
  return entryFile;
}

async function generateClientScript(
  pattern,
  data,
  patternLabConfig,
  engineFileExtension,
  componentScript
) {
  // const context = path.dirname(
  //   util.getAbsolutePatternPath(pattern, patternLabConfig)
  // );
  console.log('generating client script...');
  const context = '/';
  const { ramDisk, ufs } = createUnionFS();
  const componentFileName = await writeComponentScript(
    componentScript,
    ramDisk
  );
  const entryFileName = await writeClientSideEntry(data, ufs);
  console.log(ramDisk);
  console.log(await ufs.readDir('/'));

  // console.log('webpack entry is', entryFile);
  // console.log('webpack context is', context);

  const compiler = webpack({
    context,
    entry: entryFileName,
    resolve: {
      extensions: engineFileExtension,
      modules: ['node_modules', engineModulesPath],
    },
    resolveLoader: {
      modules: [engineModulesPath, 'node_modules'],
    },
    output: {
      filename: 'blob.js',
      library: 'blob',
      libraryTarget: 'umd',
      path: '/',
    },
    module: webpackModuleConfig,
  });

  // Use the in-memory file system for output
  compiler.inputFileSystem = ufs;
  compiler.outputFileSystem = ufs;

  // Set up the component script

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      try {
        handleWebpackErrors(
          stats,
          err,
          'something went wrong in generateClientScript()'
        );
      } catch (e) {
        reject(e);
      }

      // Read the file back into a string and return!
      const output = ufs.readFileSync('/blob.js', 'utf8');
      resolve(output);
    });
  });
}

// from the old Babel-only version
function moduleResolver(pattern, source, filename, patternLabConfig) {
  console.log('filename = ', filename);
  console.log('source = ', source);
  // console.log("pattern = ", pattern);

  if (source !== 'react') {
    return util.getAbsolutePatternPath(pattern, patternLabConfig);
  }

  return source;
}

module.exports = {
  generateServerScript,
  generateClientScript,
};
