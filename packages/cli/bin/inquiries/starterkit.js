'use strict';
const inquirer = require('inquirer');
const CUSTOM_STARTERKIT = Symbol('CUSTOM_STARTERKIT');

/** starterkitSetup {Array} - Inquirer question logic for regarding starterkits */
const starterkitSetup = [
  {
    type: 'list',
    name: 'starterkit',
    message: 'Which starterkit do you want to use?',
    choices: [
      {
        name: 'starterkit-handlebars-demo (Recommended)',
        value: '@pattern-lab/starterkit-handlebars-demo',
      },
      {
        name: 'starterkit-handlebars-vanilla (Recommended)',
        value: '@pattern-lab/starterkit-handlebars-vanilla',
      },
      {
        name: 'starterkit-twig-demo (Recommended)',
        value: '@pattern-lab/starterkit-twig-demo',
      },
      {
        name: 'starterkit-mustache-bootstrap',
        value: 'starterkit-mustache-bootstrap',
      },
      {
        name: 'starterkit-mustache-demo',
        value: '@pattern-lab/starterkit-mustache-demo',
      },
      {
        name: 'starterkit-mustache-foundation',
        value: 'starterkit-mustache-foundation',
      },
      {
        name: 'starterkit-mustache-materialdesign',
        value: 'starterkit-mustache-materialdesign',
      },
      {
        name: 'starterkit-mustache-base',
        value: '@pattern-lab/starterkit-mustache-base',
      },

      new inquirer.Separator(),
      {
        name: 'Custom starterkit',
        value: CUSTOM_STARTERKIT,
      },
      new inquirer.Separator(),
      {
        name: 'None (Start a blank project)',
        value: false,
      },
    ],
    default: {
      name: 'starterkit-handlebars-demo',
      value: 'starterkit-handlebars-demo',
    },
  },
  {
    name: 'starterkit',
    message: 'Type the name of the custom starterkit to use:',
    type: 'input',
    when(answers) {
      return answers.starterkit === CUSTOM_STARTERKIT;
    },
  },
];
module.exports = starterkitSetup;
