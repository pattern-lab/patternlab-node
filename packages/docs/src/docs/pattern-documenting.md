---
title: Documenting Patterns
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Documenting Patterns
  key: patterns
  order: 110
---

Pattern documentation gives developers and designers the ability to provide context for their patterns. The documentation file consists of Markdown with YAML front matter. It should follow this format:

```
---
title: Title for my pattern
---
This is a *Markdown* description of my pattern.
```

Attributes overview:
* The `title` attribute is used in Pattern Lab's navigation as well as in the styleguide views. Format: `string`
* Pattern `tags` has to be an array, like `tags: [new, relaunch, dev]`
* [Pattern `states`](/docs/using-pattern-states/) are defined like `state: incomplete` and [provide a simple visual indication](/docs/using-pattern-states/)
* The `order` property to [Reorganize Patterns](/docs/reorganizing-patterns/)
* The `hidden` property to [Hide Patterns in the Navigation](/docs/hiding-patterns-in-the-navigation/)

Both `tags` and `states` could be used for [not including patterns in a UIKit specific build](/docs/editing-the-configuration-options/#heading-uikits).

The `description` is used in the styleguide views.

Pattern documentation needs to have a `.md` file extension and match the name of the pattern it's documenting. For example, to document the following pattern:

    atoms/images/landscape-16x9.mustache

We'd name our documentation file:

    atoms/images/landscape-16x9.md

## Documenting Pseudo-Patterns

To add documentation to [pseudo-patterns](/docs/using-pseudo-patterns/), create an companion `.md` file for that pseudo-pattern.

For example, to document the following pseudo-pattern:

```
atoms/button/button~red.mustache
```

We'd name our documentation file:

```
atoms/button/button~red.md
```

## Adding More Attributes to the Front Matter

A future update of Pattern Lab will support more front matter attributes including: excludeFromStyleguide and links.
It will also support adding custom attributes that could be utilized by plugins. For example, GitHub issues related to patterns.
