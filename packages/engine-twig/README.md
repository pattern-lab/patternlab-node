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
