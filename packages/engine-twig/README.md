## The Twig PatternEngine for Pattern Lab / Node

To install the Twig engine in your edition, `npm install @pattern-lab/engine-twig` should do the trick. This pattern engine uses the [`twing`](https://www.npmjs.com/package/twing) library.

## Supported features

Level of support for Twig constructs is on the level that the `twing` library supports. The following partial resolution schemes (`includes`, `extends`, `import`) are supported:

* relative file paths: standard by `twing` libary
* namespaces: standard by `twing` library, `engine-twig` only passes the configuration from `patternlab-config.json`
* Patternlab pattern names: integration between Patternlab and `twing` implemented by a custom [`loader`](https://nightlycommit.github.io/twing/api.html#create-your-own-loader)

Now that this engine uses a better Twig Javascript library, the following issues are resolved:

* [Pattern Lab does not support twig extends](https://github.com/pattern-lab/patternlab-node/issues/554)
* [Verify maturity of Twig engine](https://github.com/pattern-lab/patternlab-node/issues/285)

See https://github.com/pattern-lab/the-spec/issues/37 for more info.

## Adding Custom Extensions

Create a JS file in Pattern Lab root directory (e.g. `twingExtensions.js`) and set 
```javascript
"engine": {
  "twig": {
    "loadExtensionFile": "twingExtensions.js"
  }
}
```
in `patternlab-config.json`. See [Editing the Configuration Options](https://patternlab.io/docs/editing-the-configuration-options/#heading-loadextensionfile) for more info.

- this JS file must export a Map for `TwingEnvironment.addExtensions(extensions: Map<string, TwingExtensionInterface>)`
- Map will be added to the TwingEnvironment on startup

### Example

```javascript
// twingExtensions.js
const { TwingExtension, TwingFunction } = require('twing');

const extensionsMap = new Map();

class TestTwingExtension extends TwingExtension {
  getFunctions() {
    return [
      new TwingFunction('foobar', function (foo) {
        return Promise.resolve(`function foobar called with param "${foo}"`);
      }),
    ];
  }
}
extensionsMap.set('TestTwingExtension', new TestTwingExtension());

module.exports = extensionsMap;
```

See https://nightlycommit.github.io/twing/advanced.html#creating-an-extension for more details on how to create extensions
