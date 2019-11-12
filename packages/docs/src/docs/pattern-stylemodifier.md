---
title: Using styleModifiers
tags:
  - docs
category: patterns
---

**Important:** styleModifiers are only supported by the PHP and Node Mustache PatternEngines. Other template languages provide better solutions to this problem.

styleModifiers provide a way to extend the shorthand include syntax to quickly pass one or more class names to the included pattern.

## Syntax

The basic syntax:

    {% raw %}{{> patternType-pattern:styleModifier }}{% endraw %}

To include multiple classes just separate styleModefiers by a pipe. For example:

    {% raw %}{{> patternType-pattern:styleModifier1|styleModifier2 }}{% endraw %}

## Example

Let's look at a simple example where we add a `styleModifier` Mustache variable to a pattern called `atoms-message`. For this feature to work the Mustache variable _has_ to be called `styleModifier`.

```html
{% raw %}
<div class="message {{ styleModifier }}">{{ message }}</div>
{% endraw %}
```

Now let's include the pattern partial:

```html
{% raw %}
<div>
  {{> atoms-message:error }}
</div>
{% endraw %}
```

This would render as:

```html
<div>
  <div class="message error"></div>
</div>
```

We forgot to provide a message so we can do that too with [pattern parameters](/docs/pattern-parameters.html):

```html
{% raw %}
<div>
  {{> atoms-message:error(message: "some error message") }}
</div>
{% endraw %}
```

Which would render as:

```html
<div>
  <div class="message error">some error message</div>
</div>
```
