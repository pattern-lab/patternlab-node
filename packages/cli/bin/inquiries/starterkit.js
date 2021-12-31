'use strict';
const inquirer = require('inquirer');
const CUSTOM_STARTERKIT = Symbol('CUSTOM_STARTERKIT');

/** starterkitSetup {Array} - Inquirer question logic for regarding starterkits */
const starterkitSetup = [
  {
    type: 'list',
    name: 'starterkit',
    message: 'What initial patterns do you want included in your project?',
    choices: [
      {
        name: 'Handlebars base patterns (some basic patterns to get started with)',
        value: '@pattern-lab/starterkit-handlebars-vanilla',
      },
      {
        name: 'Handlebars demo patterns (full demo website and patterns)',
        value: '@pattern-lab/starterkit-handlebars-demo',
      },
      {
        name: 'Twig (PHP) demo patterns (full demo website and patterns)',
        value: '@pattern-lab/starterkit-twig-demo',
      },
      new inquirer.Separator(),
      {
        name: 'Custom starterkit',
        value: CUSTOM_STARTERKIT,
      },
      new inquirer.Separator(),
      {
        name: 'Blank project (no patterns)',
        value: false,
      },
    ],
    default: {
      name: 'Handlebars demo patterns (full demo website and patterns)',
      value: '@pattern-lab/starterkit-handlebars-demo',
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
