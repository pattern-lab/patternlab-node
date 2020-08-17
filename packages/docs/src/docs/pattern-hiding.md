---
title: Hiding Patterns in the Navigation
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Hiding Patterns in the Navigation
  key: patterns
  order: 170
---

Removing a pattern from Pattern Lab's drop-down navigation and style guide is accomplished by setting the `hidden` frontmatter key on any pattern's companion `.md` file. For example, we may have a Google Map-based pattern that we don't need for a particular project. The path might look like:

    molecules/media/map.mustache

We would create or edit a file in the same location, calling it `map.md`:

```
---
hidden: true
---
The map component...
```

## Hiding Pattern Groups

The same concept applies to `pattern-groups`. For example, we have a `pattern-group` named `atoms` and we create a companion `.md` file for that group under `_patters/atoms/atoms.md`. In that case the whole `pattern-group` and all its components will be hidden in the UI.

```
---
hidden: true
---
# atoms.md file
```

## Hiding Pattern Sub Groups

The same concept applies to `pattern-sub-groups`. For example, we have a `pattern-sub-group` named `buttons` which is structured under `atoms` and we create a companion `.md` file for that group under `_patters/atoms/buttons/buttons.md`. In that case the whole `pattern-sub-group` and all its components will be hidden in the UI.

```
---
hidden: true
---
# buttons.md file
```

## Additional Information

A hidden pattern can still be included in other patterns.

Not all PatternEngines support hiding patterns.