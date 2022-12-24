'use strict';
const ora = require('ora');
const _ = require('lodash');
const resolveConfig = require('../resolve-config');
const wrapAsync = require('../utils').wrapAsync;
const writeJsonAsync = require('../utils').writeJsonAsync;

/**
 * enable
 * @desc Handles activation of starterkits/plugins
 * @param {object} options
 */
const enable = (options) =>
  wrapAsync(function* () {
    const {
      parent: { config: configPath },
      plugins,
    } = options;
    const config = yield resolveConfig(configPath);

    const spinner = ora(`⊙ patternlab → Enable …`).start();

    if (plugins && Array.isArray(plugins)) {
      spinner.succeed(
        `⊙ patternlab → Enable following plugins: ${plugins.join(', ')}`
      );
      plugins.map((plugin) => {
        if (_.has(config, `plugins[${plugin}]`)) {
          _.set(config, `plugins[${plugin}]['enabled']`, true);
          spinner.succeed(`⊙ patternlab → Enabled following plugin: ${plugin}`);
        } else {
          spinner.warn(`⊙ patternlab → Couldn't find plugin: ${plugin}`);
        }
      });
    }
    yield writeJsonAsync(options.parent.config, config);
    spinner.succeed(`⊙ patternlab → Updated config`);
  });

module.exports = enable;
