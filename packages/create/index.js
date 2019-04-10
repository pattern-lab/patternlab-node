#! /usr/bin/env node
console.log(
  'This is deprecated; please use "npm create pattern-lab" now, which is the `create-pattern-lab` package. Have a nice day!'
);
process.exit(1);
const init = require('@pattern-lab/cli/bin/cli-actions/init');

init({});
