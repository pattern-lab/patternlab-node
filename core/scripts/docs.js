const doc = require('jsdoc-to-markdown');
const path = require('path');
const process = require('process');
const fs = require('fs-extra');

doc.render({
  files: path.resolve(process.cwd(), './core/lib/patternlab.js')
}).then((x) => {
  fs.outputFile(path.resolve(process.cwd(), './docs/README.md'), x);
});
