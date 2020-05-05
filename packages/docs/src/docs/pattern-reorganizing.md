---
title: Reorganizing Patterns
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Reorganizing Patterns
  key: patterns
  order: 80
---

By default, the Node version of Pattern Lab organizes pattern types, pattern subtypes, and patterns alphabetically when displaying them in the drop-down navigation, pattern subtype "view all" pages, and the "all" style guide. This may not meet your needs. You can re-order pattern types, pattern subtypes and patterns by prefixing them with two digit numbers.

For example, we'll look at how we can re-organize patterns. Using alphabetical ordering the `lists` pattern subtype in `atoms` looks like:

```
definition.mustache
ordered.mustache
unordered.mustache
```

This is also the order they'll show up in the drop-down navigation. Because you rarely need to see the definition list pattern maybe you want to have it show up last in the navigation. To re-order the patterns just add numbers to the beginning:

```
01-ordered.mustache
02-unordered.mustache
03-definition.mustache
```

You may want to put some space between the numbers just in case you want to further re-order and not touch the other patterns. For example, a better default ordering might be:

```
01-ordered.mustache
05-unordered.mustache
10-definition.mustache
```

The numbers will not show up when Pattern Lab displays the name of the pattern in the drop-down navigation. They're simply a re-ordering mechanism.

## Re-ordering Pseudo-Patterns

The rules for re-ordering [pseudo-patterns](/docs/pattern-pseudo-patterns.html) are slightly different than normal patterns. The numbers go **after** the tilde sign (`~`) rather than at the beginning of the file name. For instance:

```
- pattern.mustache
- pattern.yml
- pattern~01-variation2.yml
- pattern~02-variation3.yml
- pattern~03-variation1.yml
```
