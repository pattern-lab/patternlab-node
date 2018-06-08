'use strict';
/** confirmSetup {Array} - Inquirer question to confirm selection */
const confirmSetup = [
  {
    type: 'confirm',
    name: 'confirm',
    message: 'Are you happy with your choices? (Hit enter for YES)?',
    default: true,
  },
];

module.exports = confirmSetup;
