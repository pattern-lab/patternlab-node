/*
 This is another simple example, which we wrapped with an `npm` script inside package.json
*/
const config = require('./../patternlab-config.json');
const patternlab = require('@pattern-lab/patternlab-node')(config);

patternlab.help();
