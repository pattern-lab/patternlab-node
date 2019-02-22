const inquirer = require('inquirer');
const ask = inquirer.prompt;
const ora = require('ora');
const wrapAsync = require('../utils').wrapAsync;
const fs = require('fs-extra');
const dive = require('dive');
const path = require('path');
const _ = require('lodash');
const createForm = require('../inquiries/create-form.js');
const confirmOverwrite = require('../inquiries/create-confirm.js');

const create = options => {
  const spinner = ora('⊙ patternlab → reading _patterns file system..').start();

  // Add the pattern primary extension to options (needed in create-form.js)
  options.patternExtension =
    '.' + JSON.parse(fs.readFileSync(options.parent.config)).patternExtension;

  const pathObj = path.parse(path.normalize(options.parent.config));
  // Build the base Path
  const basePath = path.join(pathObj.dir, 'source', '_patterns');

  // Possible path's where the new pattern can be located
  let pathSelection = [{ name: 'New', value: 'new' }];

  // Search through the directory
  dive(
    basePath,
    (err, file) => {
      if (err) {
        console.log('error in create: ' + err);
        return;
      }

      let pathObj = path.parse(file.replace(basePath, ''));

      // Is the given directory a pattern directory or just a normal one
      if (pathObj.dir.indexOf(pathObj.name.split('~')[0]) !== -1) {
        pathObj = path.parse(pathObj.dir);
      }

      // Check if the path is already in our selection
      if (_.indexOf(pathSelection, pathObj.dir) === -1) {
        pathSelection.push(pathObj.dir);
      }
    },
    () => {
      spinner.succeed('Done reading _patterns file system');

      wrapAsync(function*() {
        let answers = yield ask(createForm(options, pathSelection));

        // Only save lower case patterns
        answers.patternName = answers.patternName.toLowerCase();
        answers.patternPath = answers.patternPath.toLowerCase();

        /*
         * For all the file extensions that should be generated.
         * We don't use lodash here, because it will break the overwrite
         * question system.
         */
        for (let i = 0; i < answers.patternFiles.length; i++) {
          let extension = answers.patternFiles[i];
          let _patternPath = '';

          if (answers.patternType === 'mixed') {
            _patternPath = path.join(
              basePath,
              answers.patternPath,
              answers.patternName + extension
            );
          } else {
            _patternPath = path.join(
              basePath,
              answers.patternPath,
              answers.patternName.split('~')[0],
              answers.patternName.replace(/^_?(\d+-)?/, '') + extension
            );
          }

          /*
           * It is possible to generate default content for different files
           * if you want to, please do it here
           */
          let content = '';
          if (extension === '.md') {
            content =
              '---\nstate: inprogress\n---' +
              '\n\n### Documentation' +
              '\n\n### Usage' +
              '\n\n### Usage' +
              '\n\n### Configuration' +
              '\n\n| Parameter | Required | Type | Description | Default Value |' +
              '\n|--|--|--|--|--|' +
              '\n|  |  |  |  |  |';
          }

          /*
           * Better check if the file already exists to not ruin the users
           * day.
           */
          if (fs.pathExistsSync(_patternPath)) {
            let confirm = yield ask(
              confirmOverwrite(path.basename(_patternPath))
            );
            if (confirm.confirm) {
              writeFile(_patternPath, content, spinner);
            }
          } else {
            writeFile(_patternPath, content, spinner);
          }
        }
        spinner.succeed('Finished');
      });
    }
  );
};

function writeFile(_patternPath, content, spinner) {
  spinner.start(
    'Adding ' + path.basename(_patternPath) + ' to the file system..'
  );

  fs.outputFileSync(_patternPath, content); // Write the file with the default content

  spinner.succeed(
    'Added ' + path.basename(_patternPath) + ' to the file system'
  );
}

module.exports = create;
