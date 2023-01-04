'use strict';
const ora = require('ora');
const installPlugin = require('../install-plugin');
const installStarterkit = require('../install-starterkit');
const resolveConfig = require('../resolve-config');
const wrapAsync = require('../utils').wrapAsync;
const writeJsonAsync = require('../utils').writeJsonAsync;

/**
 * install
 * @desc Handles async install and activation of starterkits/plugins
 * @param {object} options
 */
const install = (options) =>
  wrapAsync(function* () {
    const config = yield resolveConfig(options.config);

    const spinner = ora(
      `⊙ patternlab → Installing additional resources …`
    ).start();

    if (options.starterkits && Array.isArray(options.starterkits)) {
      const starterkits = yield Promise.all(
        options.starterkits.map((starterkit) =>
          wrapAsync(function* () {
            spinner.text = `⊙ patternlab → Installing starterkit: ${starterkit}`;
            return yield installStarterkit(
              {
                name: starterkit,
                value: starterkit,
              },
              config
            );
          })
        )
      );
      spinner.succeed(
        `⊙ patternlab → Installed following starterkits: ${starterkits.join(
          ', '
        )}`
      );
    }
    if (options.plugins && Array.isArray(options.plugins)) {
      const plugins = yield Promise.all(
        options.plugins.map((plugin) =>
          wrapAsync(function* () {
            return yield installPlugin(
              {
                name: plugin,
                value: plugin,
              },
              config
            );
          })
        )
      );
      spinner.succeed(
        `⊙ patternlab → Installed following plugins: ${plugins.join(', ')}`
      );
    }
    yield writeJsonAsync(options.config, config);
    spinner.succeed(`⊙ patternlab → Updated config`);
  });

module.exports = install;
