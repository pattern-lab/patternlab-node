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

By default, the Node version of Pattern Lab organizes pattern groups, pattern subgroups, and patterns alphabetically when displaying them in the drop-down navigation, pattern subgroup "view all" pages, and the "all" style guide. This may not meet your needs. You can re-order pattern groups, pattern subgroups, and patterns by prefixing them with two-digit numbers.

For example, we'll look at how we can re-organize patterns. Using alphabetical ordering the `lists` pattern subgroup in `atoms` looks like:

```
definition.mustache
ordered.mustache
unordered.mustache
```

This is also the order they'll show up in the drop-down navigation. Because you rarely need to see the definition list pattern, maybe you want to have it show up last in the navigation. To re-order the patterns add the parameter `order` to the documentation `.md` file of the pattern. If no documentation `.md` file exists, you can create one:

The default value for `order` is `0`. That's why there is no file for `ordered.mustache` required.

```
---
order: 2
---
# definition.md
```

```
---
order: 1
---
# unordered.md
```

Result

```
ordered.mustache
unordered.mustache
definition.mustache
```

## Re-ordering Pseudo-Patterns

The rules for re-ordering [pseudo-patterns](/docs/using-pseudo-patterns/) are slightly different than normal patterns. By default, the `order` parameter will be inherited from the main-pattern but can be overwritten by creating a documentation `.md` file for the pattern variant and set the `order` parameter. There is no need to ensure that the order is higher or lower than the main pattern because the mechanism will sort your patterns the following way:

- First: order by main-pattern `.md` - `order`
- Second: order by pattern-variant `.md` - `order`
- Third: order by `pattern-name` / `variant-name`

```
- some-other-pattern.mustache
- some-pattern.mustache
- some-pattern.yml
- some-pattern~variation1.yml
- some-pattern~variation2.yml
- some-pattern~variation3.yml
```

```
---
order: -1
---
# some-pattern.md
```

```
---
order: 2
---
# some-pattern~variation1.md
```

```
---
order: 1
---
# some-pattern~variation3.md
```

Result

```
- some-pattern
- some-pattern-variation2
- some-pattern-variation3
- some-pattern-variation1
- some-other-pattern
```

## Re-ordering pattern groups and subgroups

To re-order pattern groups and subgroups, you need to create a companion `.md` file for that group. For example create `_patters/atoms/_atoms.md` for a pattern group or `_patters/atoms/buttons/_buttons.md` for a pattern subgroup. In the `.md` file, the above concept can be applied. The doc-file resolving works the following `{patternsRoot}/{pattern-group folder name}/{pattern-sub-group folder name}/_{pattern-sub-group raw name without prefixes}.md`


```
---
order: 1
---
# _patters/atoms/_atoms.md
# or
# _patters/atoms/buttons/_buttons.md
```

## Deactivate deprecation warning

To deactivate the deprecation warning for ordering patterns, add 

```
disableDeprecationWarningForOrderPatterns: true
```

to the `patternlab-config.json`