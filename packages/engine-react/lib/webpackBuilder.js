const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const mkdirp = require('mkdirp');
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

async function generateServerScript(
  pattern,
  data,
  patternLabConfig,
  engineFileExtension
) {
  console.log('generating server script...');

  const compiler = webpack({
    context: util.getAbsolutePatternDir(pattern, patternLabConfig),
    entry: `./${pattern.fileName}${pattern.fileExtension}`,
    resolve: {
      extensions: engineFileExtension,
      modules: ['node_modules', engineModulesPath],
    },
    resolveLoader: {
      modules: [engineModulesPath, 'node_modules'],
    },
    output: {
      filename: 'server_bundle.js',
      library: 'patternModule',
      libraryTarget: 'commonjs2',
      path: util.getAbsolutePatternOutputDir(pattern, patternLabConfig),
    },
    module: webpackModuleConfig,
  });

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
      const output = fs.readFileSync(path.join(
        util.getAbsolutePatternOutputDir(pattern, patternLabConfig),
        'server_bundle.js'
      ), 'utf8');
      resolve(output);
    });
  });
}

function createClientSideEntry(data) {
  return `
import React from 'react';
import ReactDOM from 'react-dom';
import Component from 'client_bundle.js';
console.log('Component: ', Component);
const data = ${JSON.stringify(data)};

ReactDOM.render(React.createElement(Component, data), document.body);
`;
}

async function writeClientSideEntry(data, patternOutputPath) {
  const fileName = 'entry.js';
  const entryFileContents = createClientSideEntry(data);

  fs.writeFileSync(path.join(patternOutputPath, fileName), entryFileContents);
  return fileName;
}

async function writeComponentScript(componentScript, patternOutputPath) {
  const fileName = 'Component.js';
  fs.writeFileSync(path.join(patternOutputPath, fileName), componentScript);
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
  const patternOutputDirectory = util.getAbsolutePatternOutputDir(pattern, patternLabConfig);
  const patternDirectory = util.getAbsolutePatternDir(pattern, patternLabConfig);

  const componentFileName = await writeComponentScript(
    componentScript,
    util.getAbsolutePatternOutputDir(pattern, patternLabConfig)
  );
  const entryFileName = await writeClientSideEntry(
    data,
    util.getAbsolutePatternOutputDir(pattern, patternLabConfig)
  );

  // console.log('webpack entry is', entryFile);
  // console.log('webpack context is', context);

  const compiler = webpack({
    context: patternDirectory,
    entry: entryFileName,
    resolve: {
      extensions: engineFileExtension,
      modules: ['node_modules', engineModulesPath],
    },
    resolveLoader: {
      modules: [engineModulesPath, 'node_modules'],
    },
    output: {
      filename: 'client_bundle.js',
      library: 'patternModule',
      libraryTarget: 'umd',
      path: patternOutputDirectory,
    },
    module: webpackModuleConfig,
  });

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
      const output = fs.readFileSync(path.join(patternOutputDirectory, 'client_bundle.js'), 'utf8');
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
