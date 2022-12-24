---
title: Pattern Wrap Classes
tags:
  - docs
category: advanced
eleventyNavigation:
  title: Pattern Wrap Classes
  key: advanced
  order: 300
sitemapPriority: '0.8'
---

This feature allows you to add a wrapper div with css class(es) around a pattern when shown in the single preview.
If it gets included in another pattern, the wrapper is not added.

This comes in handy if you, for example, use theming classes to visualize different backgrounds, colors etc.

## Configuration

Enable this feature with the configuration options 
[patternWrapClassesEnable](/docs/editing-the-configuration-options/#heading-patternwrapclassesenable) and 
[patternWrapClassesKey](/docs/editing-the-configuration-options/#heading-patternwrapclasseskey).

## How does it work?

Patternlab will look for any "data key" added to the `patternWrapClassesKey` array and adds that
date to the wrapper element classes.

Data key can be set inside the Markdown or JSON file of any pattern.

### Example Config

```json
"patternWrapClassesKey": ["theme-class"]
```

## Use in Markdown

Usage [Documenting Patterns](/docs/documenting-patterns/)

### my-pattern.md
```markdown
---
theme-class: my-theme-class
---
```

### Result
```html
<div class="pl-pattern-wrapper-element my-theme-class">...markup of pattern...</div>
```

## Use in JSON

Usage [Creating Pattern-specific Values](/docs/creating-pattern-specific-values/)

### my-pattern.json
```json
{
  "theme-class": "my-other-theme-class"
}
```

### Result
```html
<div class="pl-pattern-wrapper-element my-other-theme-class">...markup of pattern...</div>
```

## Pseudo-Patterns

This will work with pseudo-patterns too ([Using Pseudo-Patterns](/docs/using-pseudo-patterns/))

### my-pattern~variant.json
```json
{
  "theme-class": "my-variant-theme-class"
}
```

### Result
```html
<div class="pl-pattern-wrapper-element my-variant-theme-class">...markup of pattern...</div>
```

## Multiple entries in "patternWrapClassesKey"

Will result in multiple classes in the wrapper div.

### Example Config
```json
"patternWrapClassesKey": ["theme-class", "other-class"]
```

### my-pattern.json
```json
{
  "theme-class": "theme-class",
  "other-class": "some-other-class"
}
```

### Result
```html
<div class="pl-pattern-wrapper-element theme-class some-other-class">...markup of pattern...</div>
```
