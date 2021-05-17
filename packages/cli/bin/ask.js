'use strict';
const inquirer = require('inquirer');
const wrapsAsync = require('./utils').wrapAsync;
const confirmSetup = require('./inquiries/confirm');
const editionSetup = require('./inquiries/edition');
const starterkitSetup = require('./inquiries/starterkit');
const ask = inquirer.prompt;

/**
 * @func init
 * @desc Initiates a Pattern Lab project by getting user input through inquiry. Scaffolds the project and download mandatory files
 * @param {object} options - Options passed in from CLI
 * @param {boolean} options.force - Flag whether to force install in existing project directory. May overwrite stuff.
 */
const init = (options) =>
  wrapsAsync(function* () {
    /**
     * @property {string} project_root="./" - Path to the project root directory
     * @property {string|Symbol} edition - The name of the edition npm package or a Symbol for no install
     */
    const editionAnswers = yield ask(editionSetup);

    /**
     * @property {object|Symbol} starterkit - The name of a starterkit npm package or a Symbol for no install
     */
    const starterkitAnswers = yield ask(starterkitSetup);

    /**
     * @property {boolean} confirm - A bool hold the confirmation status
     */
    const confirmation = yield ask(confirmSetup);

    // IF we have no confirmation we start all over again.
    if (!confirmation.confirm) {
      return init(options);
    }

    return {
      // Destructure the answers
      projectDir: editionAnswers.project_root,
      edition: editionAnswers.edition !== false ? editionAnswers.edition : '',
      starterkit:
        starterkitAnswers.starterkit !== false
          ? starterkitAnswers.starterkit
          : '',
    };
  });

module.exports = init;
