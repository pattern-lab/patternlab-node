// const serve = require('/Users/ghows/sites/pl-node/packages/cli/bin/serve.js');
// const config = require('/Users/ghows/sites/pl-node/packages/development-edition-engine-handlebars/patternlab-config.json');

// // console.log(config);
// serve(config);

const path = require('path');
const fs = require('fs-extra');

fs.mkdirp('./node_modules/@pattern-lab/');

fs.ensureSymlink(__dirname, './node_modules/@pattern-lab/uikit-workshop')
  .then(() => {
    console.log('success!');
  })
  .catch(err => {
    console.error(err);
  });

// // With a callback:
// fs.ensureSymlink(
//   __dirname,
//   './node_modules/@pattern-lab/uikit-workshop',
//   // err => {
//   //   fs.symlinkSync(__dirname, './node_modules/@pattern-lab/uikit-workshop');
//   //   // symlink has now been created, including the directory it is to be placed in
//   // }
// );

// '/Users/ghows/sites/pl-node/packages/uikit-workshop/node_modules/@pattern-lab/uikit-workshop/views/partials/general-header.mustache

const configKeysEndingWithASlash = [
  'root',
  'patterns',
  'data',
  'meta',
  'annotations',
];

// const config = require('../development-edition-engine-handlebars/patternlab-config.json');

const config = require('./patternlab-config.json');

// Object.keys(config.paths.source).forEach(key => {
//   const value = config.paths.source[key];

//   if (typeof value === 'string' && value.includes('source')) {
//     config.paths.source[key] = path.resolve(
//       __dirname,
//       '../development-edition-engine-handlebars/',
//       value
//     );
//   }

//   if (configKeysEndingWithASlash.includes(key)) {
//     config.paths.source[key] = config.paths.source[key] + '/';
//   }
// });

// Object.keys(config.paths.public).forEach(key => {
//   const value = config.paths.public[key];

//   if (typeof value === 'string' && value.includes('public')) {
//     config.paths.public[key] = path.relative(
//       __dirname,
//       path.resolve(
//         __dirname,
//         '../development-edition-engine-handlebars/',
//         value
//       )
//     );
//   }

//   if (configKeysEndingWithASlash.includes(key)) {
//     config.paths.public[key] = config.paths.public[key] + '/';
//   }

//   if (key === 'styleguide') {
//     config.paths.public[key] = config.paths.public[key] + '/';
//   }
// });

// Object.keys(config.paths.public).forEach(key => {
//   const value = config.paths.public[key];
//   if (typeof value === 'string' && value.includes('public')) {
//     config.paths.source[key] = path.relative(
//       __dirname,
//       path.resolve(
//         __dirname,
//         // 'public',
//         value
//       )
//     );
//   }
// });
// config.paths.public.root = path.relative(__dirname, 'public');

console.log(config);

const patternlab = require('@pattern-lab/core')(config);

// build, optionally watching or choosing incremental builds
// patternlab.build({
//   cleanPublic: true,
//   watch: true,
// });

// console.log(patternlab);

// or build, watch, and then self-host
patternlab.build({
  watch: true,
  cleanPublic: true,
});
