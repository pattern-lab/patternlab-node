# The Nunjucks engine for Pattern Lab / Node

## Installing

To install the Nunjucks PatternEngine in your edition, run `npm install @pattern-lab/engine-nunjucks`.

## Supported features
- [x] [Includes](https://patternlab.io/docs/including-patterns/)
- [x] Lineage
- [x] [Hidden Patterns](https://patternlab.io/docs/hiding-patterns-in-the-navigation/)
- [x] [Pseudo-Patterns](http://patternlab.io/docs/pattern-pseudo-patterns.html)
- [x] [Pattern States](http://patternlab.io/docs/pattern-states.html)
- [ ] [Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html) (Accomplished instead using native Nunjucks variables)
- [ ] [Style Modifiers](http://patternlab.io/docs/pattern-stylemodifier.html) (Accomplished instead using native Nunjucks variables)

Level of Support is more or less full. Partial calls and lineage hunting are supported. Nunjucks does not support the mustache-specific syntax extensions, style modifiers and pattern parameters, because their use cases are addressed by the core Nunjucks feature set. Pattern Lab's listitems feature is still written in the mustache syntax.

## Extending the Nunjucks instance

To add custom filters or make customizations to the nunjucks instance, add the following to `patternlab-config.json`:

```json
  {
    ...
    "engines": {
      "nunjucks": {
        "extend": [
          "nunjucks-extensions/*.js"
        ]
      }
    }
  }
```

...or use the default file name: `patternlab-nunjucks-config.js` (in the root of your Pattern Lab project).

Each file providing extensions should export a function with the Nunjucks environment as parameter.

```js
module.exports = function (env) {
  [YOUR CUSTOM CODE HERE]
};
```

Example: `patternlab-nunjucks-config.js` file that uses lodash and adds three custom filters.

```js
var _shuffle = require('lodash/shuffle'),
  _take = require('lodash/take');

exports = module.exports = function (env) {
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

## What Nunjucks features are missing?

I have not yet figured out a way to support variables in pattern includes. I'm thinking it might be possible to use Nunjucks precompile feature to get the compiled partial name before returning it to Pattern Lab, but just a thought at this point.
