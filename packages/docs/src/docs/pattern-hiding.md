---

title: Hiding Patterns in the Navigation | Pattern Lab
heading: Hiding Patterns in the Navigation
---

To remove a pattern from Pattern Lab's drop-down navigation and style guide add an underscore (`_`) to the beginning of the pattern name. For example, we may have a Google Map-based pattern that we don't need for a particular project. The path might look like:

    molecules/media/map.mustache

To "hide" the pattern we add the underscore and re-generate our site:

    molecules/media/_map.mustache

A hidden pattern can still be included in other patterns.

Not all PatternEngines support hiding patterns.