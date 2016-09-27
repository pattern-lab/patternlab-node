'use strict';

const fs = require('fs-extra'),
  glob = require('glob'),
  inquirer = require('inquirer');

let config = require('./package.json');
let fileTypes = [];

var questions = [
  {
    type: 'input',
    name: 'types',
    message: 'Specify filetype(s) to create a tab for. Separate multiple filetypes with a space, pipe or comma. Example: js css >>> '
  }
];

inquirer
  .prompt(questions)
  .then(function (answers) {

    fileTypes = answers.types.split(/,| /);

    if (fileTypes.length === 1 && fileTypes[0] === '') {
      console.log('No filetype(s) provided. Returning unconfigured!');
      return;
    }

    for (let i = 0; i < fileTypes.length; i++) {
      if (fileTypes[i].charAt(0) === '.') {
        fileTypes[i] = fileTypes[i].slice(1);
      }
    }

    console.log('Adding configuration for tabs', fileTypes, 'inside package.json');
    config.fileTypes = fileTypes;
    fs.outputFileSync('./package.json', JSON.stringify(config, null, 2), 'utf-8');
  });

