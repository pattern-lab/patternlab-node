'use strict';
const ora = require('ora');
const _ = require('lodash');
const resolveConfig = require('../resolve-config');
const wrapAsync = require('../utils').wrapAsync;
const writeJsonAsync = require('../utils').writeJsonAsync;

/**
 * disable
 * @desc Handles deactivation of starterkits/plugins
 * @param {object} options
 */
const enable = (options) =>
  wrapAsync(function* () {
    const {
      parent: { config: configPath },
      plugins,
    } = options;
    const config = yield resolveConfig(configPath);

    const spinner = ora(`⊙ patternlab → Disable …`).start();

    if (plugins && Array.isArray(plugins)) {
      spinner.succeed(
        `⊙ patternlab → Disable following plugins: ${plugins.join(', ')}`
      );
      plugins.map((plugin) => {
        if (_.has(config, `plugins[${plugin}]`)) {
          _.set(config, `plugins[${plugin}]['enabled']`, false);
          spinner.succeed(
            `⊙ patternlab → Disabled following plugin: ${plugin}`
          );
        } else {
          spinner.warn(`⊙ patternlab → Couldn't find plugin: ${plugin}`);
        }
      });
    }
    yield writeJsonAsync(options.config, config);
    spinner.succeed(`⊙ patternlab → Updated config`);
  });

module.exports = enable;
