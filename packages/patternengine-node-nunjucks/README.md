# STILL IN DEVELOPMENT (NOT AVAILABLE YET)

## The Nunjucks engine for Pattern Lab / Node

To install the Nunjucks engine in your edition, `npm install patternengine-node-nunjucks` should do the trick.

Level of Support is more or less full. Partial calls and lineage hunting are supported. Nunjucks does not support the mustache-specific syntax extensions, style modifiers and pattern parameters, because their use cases are addressed by the core Nunjucks feature set.

## Extending the Nunjucks

To add custom filters or make customizations the nunjucks instance, create a file named `patternlab-nunjucks-config.js` in the root fo your Pattern Lab project. It should export a function that takes two paramerters. The first parameter being the nunjucks instance and the second the nunjucks instance environment.

```
module.exports = function (nunjucks, env) {
  [YOUR CUSTOM CODE HERE]
};
```

EXAMPLE: patternlab-nunjucks-config.js file that uses lodash and adds three custom filters.
```
var _shuffle = require('lodash/shuffle'),
  _take = require('lodash/take');

exports = module.exports = function (nunjucks, env) {
  env.addFilter('shorten', function (str, count) {
    return str.slice(0, count || 5);
  });

  env.addFilter('shuffle', (arr) => {
    return _shuffle(arr);
  });

  env.addFilter('take', (arr, number) => {
    return _take(arr, number);
  });
};
```
