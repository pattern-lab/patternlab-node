# The React PatternEngine for Pattern Lab / Node

This is the **very preliminary** React PatternEngine for Patternlab / Node.

## Status

You can author standalone React components that include only the main React module, which I know isn't much yet. We're working on it.

The current release works with the 2.X series of Patternlab / Node. Support for the 3.X series is underway on the `dev` branch.

## Installing

To install the React PatternEngine in your edition, `npm install @pattern-lab/engine-react` should do the trick.

## Supported features

* [x] [Includes](https://patternlab.io/docs/including-patterns/)
* [x] Data inheritance: This can be achieved by combining react `props` & `defaultProps`
* [x] [Hidden Patterns](https://patternlab.io/docs/hiding-patterns-in-the-navigation/)
* [x] [Pseudo-Patterns](https://patternlab.io/docs/using-pseudo-patterns/)
* [x] [Pattern States](https://patternlab.io/docs/using-pattern-states/)
* [x] [Pattern Parameters](https://patternlab.io/docs/using-pattern-parameters/): With react props
* [x] [Style Modifiers](http://patternlab.io/docs/pattern-stylemodifier.html): With react props
* [x] Lineage
* [x] Incremental builds

## Usage

* `*.js` and `*.jsx` files are detected as patterns.
* To include patterns, import components using the standard Pattern Lab naming convention, as in: ```javascript
  import HelloWorld from 'atoms-hello-world';

```
* Standard pattern JSON is passed into React components as props.

## Notes
* Components are rendered statically to markup at build time using ReactDOMServer.renderToStaticMarkup(), but also transpiled and inlined as scripts in the pattern code to execute at runtime.
* We currently assume the React include (and others, once we figure that out) are written using es2015 module syntax.
* The Babel transforms are currently hard-coded into the engine, but we hope to make this configurable in the future.
```
