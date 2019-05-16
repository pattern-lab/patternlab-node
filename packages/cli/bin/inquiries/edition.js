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
        name: 'edition-twig (php engine)',
        value: '@pattern-lab/edition-twig',
      },
      {
        name: 'edition-node',
        value: '@pattern-lab/edition-node',
      },
      {
        name: 'edition-node-grunt',
        value: '@pattern-lab/edition-node-grunt',
      },
      {
        name: 'edition-node-gulp',
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
