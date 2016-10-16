# The Mustache engine for Pattern Lab / Node

## Installing
This one is included by default (as a dependency) with both [Pattern Lab Node Core](https://github.com/pattern-lab/patternlab-node) and [Node Editions](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node), so you normally won't need to install it yourself.

If it's missing from your project for any reason, `npm install patternengine-node-mustache` should do the trick.

## Supported features
- [x] [Includes](http://patternlab.io/docs/pattern-including.html)
- [x] Lineage
- [x] [Hidden Patterns](http://patternlab.io/docs/pattern-hiding.html)
- [x] [Pseudo-Patterns](http://patternlab.io/docs/pattern-pseudo-patterns.html)
- [x] [Pattern States](http://patternlab.io/docs/pattern-states.html)
- [x] [Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html)
- [x] [Style Modifiers](http://patternlab.io/docs/pattern-stylemodifier.html)

## Extensions to default Mustache functionality
[Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html) and [Style Modifiers](http://patternlab.io/docs/pattern-stylemodifier.html) are convenient syntax extensions to Mustache that allow you change the behavior of a pattern you're calling from within another. They're not necessary in other template engines because the others have natively supported ways of passing arguments to template partials.
