const doc = require('jsdoc-to-markdown');
const path = require('path');
const process = require('process');
const fs = require('fs-extra');

// doc
//   .getJsdocData({
//     files: './src/lib/events.js',
//   })
//   .then(x => {
//     console.log(x);
//   });

doc
  .render({
    'example-lang': 'javascript',
    files: path.resolve(process.cwd(), './src/index.js'),
    'name-format': 'backticks',
    template: fs.readFileSync('./scripts/api.handlebars', 'utf8'),
  })
  .then((x) => {
    fs.outputFile(path.resolve(process.cwd(), './docs/README.md'), x);
  });

doc
  .render({
    'example-lang': 'javascript',
    files: path.resolve(process.cwd(), './src/lib/events.js'),
    'name-format': 'backticks',
    template: fs.readFileSync('./scripts/events.handlebars', 'utf8'),
  })
  .then((x) => {
    fs.outputFile(path.resolve(process.cwd(), './docs/events.md'), x);
  });
