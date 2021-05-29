---
title: Using Pattern Parameters
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Using Pattern Parameters
  key: patterns
  order: 150
sitemapPriority: '0.8'
---

**Important:** Pattern parameters are supported by the Node Mustache PatternEngines. Other template languages provide better solutions to this problem.

Pattern parameters are a **simple** mechanism for replacing Mustache variables in an included pattern. They are limited to replacing variables in the included pattern and **only** the included pattern. They are especially useful when including a single pattern multiple times in a molecule, template, or page and you want to supply unique data to that pattern each time it's included. Pattern parameters **do not** currently support the following:

- sub-lists (_e.g. iteration of a section_),
- long strings of text (_can be unwieldy_)
- modifying/replacing variables in patterns included _within_ the targeted pattern

Pattern parameters are Pattern Lab-specific, have no relationship to Mustache, and are implemented outside of Mustache. Learn more about pattern parameters:

- [The Pattern Parameter Syntax](#pattern-parameter-syntax)
- [Adding Pattern Parameters to Your Pattern Partial](#adding-pattern-parameters)
- [Toggling Sections with Pattern Parameters](#toggling-sections)

## <span id="pattern-parameter-syntax"></span>The Pattern Parameter Syntax

The attributes listed in the pattern parameters need to match Mustache variable names in your pattern. The values listed for each attribute will replace the Mustache variables. For example:

    {% raw %}{{> patternGroup-pattern(attribute1: value, attribute2: "value string") }}{% endraw %}

Again, pattern parameters are a simple find and replace of Mustache variables with the supplied values.

## <span id="adding-pattern-parameters"></span>Adding Pattern Parameters to Your Pattern Partial

Let's look at a simple example for how we might use pattern parameters. First we'll set-up a pattern that might be included multiple times. We'll make it a simple "message" pattern with a single Mustache variable of `message`.

```html
<div class="message">{% raw %}{{ message }}{% endraw %}</div>
```

We'll organize it under Atoms > Global and call it "message" so it'll have the pattern partial of `atoms-message`.

Now let's create a pattern that includes our message pattern partial multiple times. It might look like this.

```html
<div class="main-container">
	{% raw %}{{> atoms-message }}{% endraw %}
	<div>
		A bunch of extra information
	</div>
	{% raw %}{{> atoms-message }}{% endraw %}
</div>
```

Using `data.json` or a pattern-specific JSON file we wouldn't be able to supply separate messages to each pattern partial. For example, if we defined `message` in our `data.json` as "this is an alert" then "this is an alert" would show up twice when our parent pattern was rendered.

Instead we can use pattern parameters to supply unique messages for each instance. So let's show what that would look like:

```html
{% raw %}
<div class="main-container">
	{{> atoms-message(message: "this is an alert message") }}
	<div>
		A bunch of extra information
	</div>
	{{> atoms-message(message: "this is an informational message") }}
</div>
{% endraw %}
```

Now each pattern would have its very own message.

## <span id="toggling-sections"></span>Toggling Sections with Pattern Parameters

While pattern parameters are not a one-to-one match for Mustache they do offer the ability to toggle sections of content. For example we might have the following in a generic header pattern called `organisms-header`:

```html
{% raw %}
<div class="main-container">
	{{# emergency }}
	<div class="alert">Emergency!!!</div>
	{{/ emergency }}
	<div class="header">
		... stuff ...
	</div>
</div>
{% endraw %}
```

We call the header pattern in a template like so:

```
{% raw %}{{> organisms-header }}{% endraw %}
... stuff ...
```

By default, if we don't have an `emergency` attribute in our `data.json` or the pattern-specific JSON file for the template the emergency alert will never be rendered. Instead of modifying either of those two files we can use a boolean pattern param to show it instead like so:

```
{% raw %}{{> organisms-header(emergency: true) }}{% endraw %}
... stuff ...
```

Again, because pattern parameters aren't leveraging Mustache this may not fit the normal Mustache workflow. We still wanted to offer a way to quickly turn on and off sections of an included pattern.
