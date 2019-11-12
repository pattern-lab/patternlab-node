---
title: Adding Annotations
tags:
  - docs
category: patterns
---

Annotations provide an easy way to add notes to elements that may appear inside patterns. Annotations can be saved as a single JSON file at `./source/_annotations/annotations.js` or as multiple Markdown files in `./source/_annotations/`. They're _not_ tied to any specific patterns. When annotations are active they are compared against every pattern using a CSS selector syntax.

## The Elements of an Annotation

The elements of an annotation are:

- **el** - the selector to be used to attach the annotation to a pattern
- **title** - the title for a given annotation
- **comment** - the description for a given annotation

## JSON Example

This is an example of an annotation saved as part of `annotations.js` that will be added to an element with the class `logo`:

```javascript
{
	"el": ".logo",
 	"title" : "Logo",
 	"comment": "The logo image is an SVG file, which ensures that the logo displays crisply even on high resolution displays. A PNG fallback is provided for browsers that don't support SVG images.</p><p>Further reading: <a href=\"http://bradfrostweb.com/blog/mobile/hi-res-optimization/\">Optimizing Web Experiences for High Resolution Screens</a></p>"
}
```

## Markdown Example

This is an example of an annotation saved as part of `annotations.md` that will be added to an element with the class `logo`:

```
---
el: .logo
title: Logo
---
The logo image is an SVG file, which ensures that the logo displays crisply even on high resolution displays. A PNG fallback is provided for browsers that don't support SVG images.

Further reading: [Optimizing Web Experiences for High Resolution Screens](http://bradfrostweb.com/blog/mobile/hi-res-optimization/)
```

To separate multiple annotations within one file use `~*~` between annotations.

```
---
el: .logo
title: Logo
---
The logo image is an SVG file, which ensures that the logo displays crisply even on high resolution displays. A PNG fallback is provided for browsers that don't support SVG images.

Further reading: [Optimizing Web Experiences for High Resolution Screens](http://bradfrostweb.com/blog/mobile/hi-res-optimization/)
~*~
---
el: .hamburger
title: Sandwiches Considered Harmful
---
According to everyone, hamburger menus are not obvious, and obvious always wins.

Further reading: [Hamburger Menus and Hidden Navigation Hurt UX Metrics](https://www.nngroup.com/articles/hamburger-menus/)
```

## Viewing Annotations

In order to view annotations click "Show Pattern Info" in the Pattern Lab toolbar.
