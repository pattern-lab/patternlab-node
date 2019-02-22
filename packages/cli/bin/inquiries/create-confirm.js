'use strict';

/** confirmOverwrite {Function} - Inquirer question to confirm selection */
const confirmOverwrite = file => {
  return [
    {
      type: 'confirm',
      name: 'confirm',
      message:
        'The file (' +
        file +
        ') already exists, do you want to overwrite? (Hit enter for YES)?',
      default: true,
    },
  ];
};

module.exports = confirmOverwrite;
