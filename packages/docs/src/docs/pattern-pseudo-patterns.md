---
title: Using Pseudo-Patterns
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Using Pseudo-Patterns
  key: patterns
  order: 140
---

Pseudo-patterns give developers and designers the ability to quickly build multiple unique variants of an existing pattern. This feature is especially useful when developing template- and page-style patterns or showing the states of other patterns.

## The Pseudo-Pattern File Naming Convention

Pseudo-patterns are similar to [pattern-specific JSON files](/docs/creating-pattern-specific-values/) but are hinted in such a way that a developer can build a variant of an existing pattern. The basic syntax:

    patternName~pseudo-pattern-name.json

The tilde (`~`) and `.json` file extension are the hints that Pattern Lab uses to determine that this is a pseudo-pattern. The `patternName` tells Pattern Lab which existing pattern it should use when rendering the pseudo-pattern. The JSON file itself works exactly like the [pattern-specific JSON file](/docs/creating-pattern-specific-values/). It has the added benefit that the pseudo-pattern will also inherit any values from the existing pattern's pattern-specific JSON file.

As default arrays in pseudo-pattern data will be concatenated with the base patterns array data. To override this behavior globally you can set the parameter `patternMergeVariantArrays` in you `patternlab-config.json` to `false`.

```json
"patternMergeVariantArrays": false
```

From a navigation and naming perspective `patternName` and `pseudoPatternName` will be combined.

## Adding Pseudo-Patterns to Your Project

Adding a pseudo-pattern is as simple as naming it correctly and following the [pattern-specific JSON file](/docs/creating-pattern-specific-values/) instructions for organizing its content. Let's look at a simple example where we want to show an emergency notification on our homepage Mustache template. Our `03-templates/` directory might look like this:

    article.mustache
    blog.mustache
    homepage.mustache

Our `homepage.mustache` template might look like this:

```html
{% raw %}
<div id="main-container">
	{{# emergency }}
	<div class="emergency">Oh Noes! Emergency!</div>
	{{/ emergency }} { ...a bunch of other content... }
</div>
{% endraw %}
```

If our `_data.json` file doesn't give a value for `emergency` that section will never show up when `homepage.mustache` is rendered. Obviously we'd need to show _both_ the regular and emergency states of the homepage but we don't want to duplicate the entire `homepage.mustache` template. That would be a maintenance nightmare. So let's add our pseudo-pattern:

```
article.mustache
blog.mustache
homepage.mustache
homepage~emergency.json
```

In our pseudo-pattern, `00-homepage~emergency.json`, we add our `emergency` attribute:

```javascript
{% raw %}{
    "emergency": true
}{% endraw %}
```

Now when we generate our site we'll have our homepage template rendered twice. Once as the regular template and once as a pseudo-pattern showing the emergency section. Note that the pseudo-pattern will show up in our navigation as `Homepage Emergency`.

## Using Pseudo-Patterns as Pattern Includes

By default, pseudo-patterns **cannot** be used as pattern includes. The data included in the pseudo-pattern, the bit that actually controls the magic, cannot be accessed when rendering the pattern include.

## Re-ordering Pseudo-Patterns

To learn how to re-order pseudo-patterns, check the documentation for [Reorganizing Patterns](/docs/reorganizing-patterns/).

## Documenting Pseudo-Patterns

To learn how to document pseudo-patterns, check the documentation for [Documenting Patterns](/docs/documenting-patterns/) to learn more.
