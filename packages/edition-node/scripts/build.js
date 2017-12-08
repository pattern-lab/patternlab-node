/*
 This is another simple example, which we wrapped with an `npm` script inside package.json
*/
const config = require('./../patternlab-config.json');
const patternlab = require('@pattern-lab/patternlab-node')(config);

patternlab.build(() => {
  // use the callback
}, {
  cleanPublic: true
}).then(() => {
  // or do something else when this promise resolves
});
