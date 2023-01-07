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
    message: 'What templating language do you want to use with Pattern Lab?',
    choices: [
      {
        name: 'Handlebars',
        value: '@pattern-lab/edition-node',
      },
      {
        name: 'Twig (PHP)',
        value: '@pattern-lab/edition-twig',
      },
      new inquirer.Separator(),
      {
        name: 'None',
        value: false,
      },
    ],
    default: function () {
      return {
        name: 'Handlebars',
        value: '@pattern-lab/edition-node',
      };
    },
  },
];

module.exports = editionSetup;
