const doc = require('jsdoc-to-markdown');
const path = require('path');
const process = require('process');
const fs = require('fs-extra');

doc.render({
  'example-lang': 'javascript',
  files: path.resolve(process.cwd(), './core/index.js'),
  'name-format': 'backticks',
  template: fs.readFileSync('./scripts/api.hbs', 'utf8')
}).then((x) => {
  fs.outputFile(path.resolve(process.cwd(), './docs/README.md'), x);
});
