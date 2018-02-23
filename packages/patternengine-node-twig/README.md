# The Twig engine for Pattern Lab / Node

## Installing
To install the Twig engine in your edition, `npm install patternengine-node-twig` should do the trick.

## Stability
This engine is considered experimental. Please try it out and let us know if you run into any problems. We know that some of the more interesting features of Twig are missing or improperly dealt with, but it should basically work.

## Supported features
- [x] [Includes](http://patternlab.io/docs/pattern-including.html)
- [x] Lineage
- [x] [Hidden Patterns](http://patternlab.io/docs/pattern-hiding.html)
- [x] [Pseudo-Patterns](http://patternlab.io/docs/pattern-pseudo-patterns.html)
- [x] [Pattern States](http://patternlab.io/docs/pattern-states.html)
- [ ] [Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html) (Accomplished instead using native Twig include arguments)
- [ ] [Style Modifiers](http://patternlab.io/docs/pattern-stylemodifier.html) (Accomplished instead using native Twig include arguments)

Level of Support is more or less full. Partial calls and lineage hunting are supported. Twig does not support the mustache-specific syntax extensions, style modifiers and pattern parameters, because their use cases are addressed by the core Twig feature set.
