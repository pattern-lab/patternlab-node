---
title: Hiding Patterns in the Navigation
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Hiding Patterns in the Navigation
  key: patterns
  order: 170
sitemapPriority: '0.8'
sitemapChangefreq: 'monthly'
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

The same concept applies to `pattern-groups`. For example, you have a `pattern-group` named `atoms`, and you create a companion `.md` file for that group under `_patters/atoms/_atoms.md`. In that case, the whole `pattern-group` and all its components will be hidden in the UI. The doc-file resolving works the following `{patternsRoot}/{pattern-group folder name}/_{pattern-group raw name without prefixes}.md`

```
---
hidden: true
---
# _atoms.md file
```

## Hiding Pattern Sub Groups

The same concept applies to `pattern-sub-groups`. For example, you have a `pattern-sub-group` named `buttons` which is structured under `atoms`, and you create a companion `.md` file for that group under `_patters/atoms/buttons/_buttons.md`. In that case, the whole `pattern-sub-group` and all its components will be hidden in the UI. The doc-file resolving works the following `{patternsRoot}/{pattern-group folder name}/{pattern-sub-group folder name}/_{pattern-sub-group raw name without prefixes}.md`

```
---
hidden: true
---
# _buttons.md file
```

## Additional Information

A hidden pattern can still be included in other patterns.

## Deactivate deprecation warning

To deactivate the deprecation warning for hidden patterns, add 

```
disableDeprecationWarningForHiddenPatterns: true
```

to the `patternlab-config.json`