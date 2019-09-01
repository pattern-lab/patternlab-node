'use strict';
const inquirer = require('inquirer');

/** editionSetup {Array} - Inquirer question logic for first question regarding editions */
const editionSetup = [
  {
    type: 'input',
    name: 'project_root',
    message: 'Please specify a directory for your Pattern Lab project.',
    default: () => './',
  },
  {
    type: 'list',
    name: 'edition',
    message: 'Which edition do you want to use (defaults to edition-node)?',
    choices: [
      {
        name: 'edition-node (handlebars engine)',
        value: '@pattern-lab/edition-node',
      },
      {
        name: 'edition-twig (php engine)',
        value: '@pattern-lab/edition-twig',
      },
      {
        name: 'edition-node-gulp (legacy)',
        value: '@pattern-lab/edition-node-gulp',
      },
      new inquirer.Separator(),
      {
        name: 'None',
        value: false,
      },
    ],
    default: function() {
      return {
        name: 'edition-node',
        value: '@pattern-lab/edition-node',
      };
    },
  },
];

module.exports = editionSetup;
