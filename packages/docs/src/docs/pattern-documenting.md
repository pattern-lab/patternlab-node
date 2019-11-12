---
title: Documenting Patterns
tags:
  - docs
category: patterns
---

Pattern documentation gives developers and designers the ability to provide context for their patterns. The documentation file consists of Markdown with YAML front matter. It should follow this format:

```
---
title: Title for my pattern
---
This is a *Markdown* description of my pattern.
```

The `title` attribute is used in Pattern Lab's navigation as well as in the styleguide views. The `description` is used in the styleguide views.

Pattern documentation needs to have a `.md` file extension and match the name of the pattern it's documenting. For example, to document the following pattern:

    00-atoms/images/landscape-16x9.mustache

We'd name our documentation file:

    00-atoms/images/landscape-16x9.md

## Documenting Pseudo-Patterns

To add documentation to [pseudo-patterns](/docs/pattern-pseudo-patterns.html), replace the tilde sign (`~`) with a dash (`-`) when naming your documentation file.

For example, to document the following pseudo-pattern:

```
00-atoms/button/button~red.mustache
```

We'd name our documentation file:

```
00-atoms/button/button-red.md
```

## Adding More Attributes to the Front Matter

A future update of Pattern Lab will support more front matter attributes including: state, order, hidden, links and tags.
It will also support adding custom attributes that could be utilized by plugins. For example, GitHub issues related to patterns.
