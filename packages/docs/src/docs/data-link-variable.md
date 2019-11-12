---
title: Linking to Patterns with Pattern Lab's Default `link` Variable
category: data
---

# Linking to Patterns with Pattern Lab's Default `link` Variable

You can build patterns that link to one another to help simulate using a real website. This is especially useful when working with the Pages and Templates pattern types. Rather than having to remember the actual path to a pattern you can use the same shorthand syntax you'd use to include one pattern within another. **Important:** Pattern links _do not_ support the same fuzzy matching of names as the shorthand partials syntax does. The basic format is:

```html
{% raw %}{{ link.pattern-name }}{% endraw %}
```

For example, if you wanted to add a link to the `article` page from your `blog` page you could write the following:

```html
<a href="{% raw %}{{ link.pages-article }}{% endraw %}">Article Headline</a>
```

This would compile to:

```html
<a href="/patterns/pages-layouts-article/pages-layouts-article.html">Article Headline</a>
```

Additionally, you can use pattern links within JSON to link to other pages, templates, or patterns within Pattern Lab. For instance, if you had a pattern containing the following:

```html
<a href="{% raw %}{{ url }}{% endraw %}">This is a link</a>
```

You can set the URL to a pattern link via JSON like so:

```javascript
{
    "url" : "link.pages-article"
}
```

Using pattern links in JSON is especially helpful at keeping the pattern's structure and content entirely separate.
