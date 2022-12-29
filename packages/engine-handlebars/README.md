# The Handlebars PatternEngine for Pattern Lab / Node

To install the Handlebars PatternEngine in your edition, `npm install --save @pattern-lab/engine-handlebars` should do the trick.

## Supported features

* [x] [Includes](https://patternlab.io/docs/including-patterns/)
* [x] Lineage
* [x] [Hidden Patterns](https://patternlab.io/docs/hiding-patterns-in-the-navigation/)
* [x] [Pseudo-Patterns](https://patternlab.io/docs/using-pseudo-patterns/)
* [x] [Pattern States](https://patternlab.io/docs/using-pattern-states/)
* [ ] ~~[Pattern Parameters](https://patternlab.io/docs/using-pattern-parameters/)~~ (Accomplished instead using [native Handlebars partial arguments](https://handlebarsjs.com/guide/partials.html))
* [ ] ~~[Style Modifiers](https://github.com/pattern-lab/patternlab-node/issues/1177)~~ (Accomplished instead using [native Handlebars partial arguments](https://handlebarsjs.com/guide/partials.html))

## Helpers

To add custom [helpers](https://handlebarsjs.com/api-reference/helpers.html) or otherwise interact with Handlebars directly, create a file named `patternlab-handlebars-config.js` in the root of your Pattern Lab project, or override the default location by specifying one or several glob patterns in the Pattern Lab config:

```json
  {
    ...
    "engines": {
      "handlebars": {
        "extend": [
          "handlebars-helpers.js",
          "helpers/**/*.js"
        ]
      }
    }
  }
```

Each file should export a function which takes Handlebars as an argument.

```js
module.exports = function(Handlebars) {
  // Put helpers here

  Handlebars.registerHelper('fullName', function(person) {
    // Example: person = {firstName: "Alan", lastName: "Johnson"}
    return person.firstName + " " + person.lastName;
  });
};
```
