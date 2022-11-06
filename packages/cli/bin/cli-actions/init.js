'use strict';
const patternlab = require('@pattern-lab/core');
const merge = require('deepmerge');
const ask = require('../ask');
const scaffold = require('../scaffold');
const installEdition = require('../install-edition');
const installStarterkit = require('../install-starterkit');
const replaceConfigPaths = require('../replace-config');
const ora = require('ora');
const path = require('path');
const wrapAsync = require('../utils').wrapAsync;
const writeJsonAsync = require('../utils').writeJsonAsync;

const defaultPatternlabConfig = patternlab.getDefaultConfig();

// https://github.com/TehShrike/deepmerge#overwrite-array
const overwriteMerge = (destinationArray, sourceArray) => sourceArray;

const init = (options) =>
  wrapAsync(function* () {
    const sourceDir = 'source';
    const publicDir = 'public';
    const exportDir = 'pattern_exports';
    const answers = options.projectDir ? options : yield ask(options);
    const projectDir = answers.projectDir || './';
    const edition = answers.edition;
    const starterkit = answers.starterkit;

    /**
     * Process the init routines
     * 1 Replace config paths
     * 2. Scaffold the folder structure
     * 3. If `edition` is present:
     *    3.1 Install edition
     *    3.2 Reassign adjustedconfig
     * 4. If `starterkit` is present install it and copy over the mandatory starterkit files to sourceDir
     * 5. Save patternlab-config.json in projectDir
     */
    const spinner = ora(`Setting up Pattern Lab in ${projectDir}`).start();
    let patternlabConfig = replaceConfigPaths(
      defaultPatternlabConfig,
      projectDir,
      sourceDir,
      publicDir,
      exportDir
    ); // 1

    yield scaffold(projectDir, sourceDir, publicDir, exportDir); // 2
    process.env.projectDir = path.join(process.cwd(), projectDir);

    if (edition) {
      spinner.text = `⊙ patternlab → Installing edition: ${edition}`;
      const newConf = yield installEdition(
        edition,
        patternlabConfig,
        projectDir
      ); // 3.1
      if (newConf) {
        patternlabConfig = merge(patternlabConfig, newConf, {
          arrayMerge: overwriteMerge,
        }); // 3.2
      }
      spinner.succeed(`⊙ patternlab → Installed edition: ${edition}`);
    }
    if (starterkit) {
      spinner.text = `⊙ patternlab → Installing starterkit ${starterkit}`;
      spinner.start();
      const starterkitConfig = yield installStarterkit(
        starterkit,
        patternlabConfig
      );
      spinner.succeed(`⊙ patternlab → Installed starterkit: ${starterkit}`);
      if (starterkitConfig) {
        patternlabConfig = merge(patternlabConfig, starterkitConfig, {
          arrayMerge: overwriteMerge,
        });
      }
    } // 4
    yield writeJsonAsync(
      path.resolve(projectDir, 'patternlab-config.json'),
      patternlabConfig
    ); // 5

    spinner.succeed(
      `⊙ patternlab → Yay ☺. Pattern Lab Node was successfully initialized in ${projectDir}`
    );
    return true;
  });

module.exports = init;
