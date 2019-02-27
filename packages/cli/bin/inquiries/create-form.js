'use strict';
const inquirer = require('inquirer');
const path = require('path');
const _ = require('lodash');

inquirer.registerPrompt('suggest', require('inquirer-prompt-suggest'));

/** createForm {Function} - Inquirer question logic for first question regarding editions */
const createForm = (options, pathSelection) => {
  return [
    {
      type: 'input',
      name: 'patternName',
      message: 'Please insert the pattern name:',
      validate: function(input) {
        const done = this.async();
        if (input === '') {
          done('You need to provide a pattern name');
          return;
        } else if (input.indexOf(' ') !== -1) {
          done('Please remove all spaces in the pattern name');
          return;
        }
        done(null, true);
      },
      suffix: '(without file extension)',
    },
    {
      type: 'list',
      name: 'patternPath',
      message: 'In which path shuld the pattern be located?',
      choices: pathSelection,
    },
    {
      type: 'suggest',
      name: 'patternPath',
      message: 'Please type the pattern path name:',
      suggestions: _.drop(pathSelection, 1),
      when(answers) {
        return answers.patternPath === 'new';
      },
      default: '\\',
    },
    {
      type: 'checkbox',
      name: 'patternFiles',
      message: 'which files should be created?',
      choices: answers => {
        const extensions = ['.md', '.json', '.sass', '.css', '.js'];
        const choices = [];

        _.forEach(extensions, extension => {
          if (options.patternFull) {
            choices.push({ name: extension, checked: true });
          } else {
            choices.push(extension);
          }
        });
        return _.concat(
          [{ name: options.patternExtension, checked: true }],
          choices
        );
      },
      default: ['.mustache'],
    },
    {
      type: 'list',
      name: 'patternType',
      message: 'In which way the pattern should be saved?',
      choices: answers => {
        return [
          {
            name: path.join(
              answers.patternPath,
              answers.patternName + '.[extensions]'
            ),
            value: 'mixed',
          },
          {
            name: path.join(
              answers.patternPath,
              answers.patternName.split('~')[0],
              answers.patternName.replace(/^_?(\d+-)?/, '') + '.[extensions]'
            ),
            value: 'separated',
          },
        ];
      },
    },
  ];
};

module.exports = createForm;
