# The React engine for Pattern Lab / Node
This is the **very preliminary** React engine for Patternlab/Node.

## Status
You can author standalone React components that include only the main React module, which I know isn't much yet.
We're still working out how React components will resolve and load the modules they depend on. We believe this is tricky, but doable.

## Supported Pattern Lab

- [x] [Includes](http://patternlab.io/docs/pattern-including.html)
- [x] Data inheritance: This can be achieved by combining react `props` & `defaultProps`
- [x] [Hidden Patterns](http://patternlab.io/docs/pattern-hiding.html)
- [x] [Pseudo-Patterns](http://patternlab.io/docs/pattern-pseudo-patterns.html)
- [x] [Pattern States](http://patternlab.io/docs/pattern-states.html#node)
- [x] [Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html): With react props
- [x] [Style Modifiers](http://patternlab.io/docs/pattern-stylemodifier.html): With react props
- [x] Lineage
- [x] Incremental builds

## Usage
* `*.jsx` files are detected as patterns.
* Standard pattern JSON is passed into React components as props.

## Notes
* Components are rendered statically to markup at build time using ReactDOMServer.renderToStaticMarkup(), but also transpiled and inlined as scripts in the pattern code to execute at runtime.
* We currently assume the React include (and others, once we figure that out) are written using es2015 module syntax.
* The Babel transforms are currently hard-coded into the engine, but we hope to make this configurable in the future.
