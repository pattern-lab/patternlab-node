const webpackServer = require('@pattern-lab/uikit-workshop/build/webpack-server.js');
const path = require('path');
const configFilePath = path.join(process.cwd(), './patternlab-config.json');
const config = require(configFilePath);
const patternlab = require('@pattern-lab/core')(config);

// build + start watch mode
patternlab.build({
  watch: true,
  cleanPublic: true,
});

webpackServer.serve(
  patternlab,
  path.resolve(process.cwd(), config.paths.public.root)
);
