---
title: Pattern Lab's Special Query String Variables
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Pattern Lab's Special Query String Variables
  key: patterns
  order: 100
---

Pattern Lab comes with support for a number of special query string variables to help you share patterns with clients. These query string variables include ways to link to patterns, set the Pattern Lab viewport to a specific width, open various views as well as start Hay and disco modes on page load. There are lots of options:

- [Linking to Specific Patterns](#link-pattern)
- [Setting the Default Width for the Viewport](#default-width)
- [Opening Annotations View on Page Load](#annotations-view)
- [Opening Code View on Page Load](#code-view)
- [Starting Hay Mode on Page Load](#hay-mode)
- [Starting Disco Mode on Page Load](#disco-mode)

## <span id="link-pattern"></span>Linking to Specific Patterns

You can link directly to any pattern listed on the Pattern Lab website. This might be useful when asking clients for feedback on a particular template or page pattern. If you want to [link from one pattern to another use the `link` variable](/docs/linking-to-patterns-with-pattern-lab's-default-link-variable/).

### Copy & Paste

The simplest method is to copy the address found in the address bar.

### Manually Creating the Link

It's also very easy to create a link manually. Simply append `?p=pattern-name` to the end of the address for your Pattern Lab website. For example, if we wanted to link to the `templates-article` pattern we'd add the following to the address for our Pattern Lab website:

```
?p=templates-article
```

The direct link feature supports the [shorthand partials syntax](/docs/including-patterns/) found in the Node version of Pattern Lab. Just provide part of a pattern name and Pattern Lab will attempt to resolve it.

## <span id="default-width"></span>Setting the Default Width for the Viewport

You can load a specific viewport size by using the `w` query string variable.

```
http://patternlab.localhost/?w=320   (sets the viewport to 320px)
http://patternlab.localhost/?w=400px (sets the viewport to 400px)
http://patternlab.localhost/?w=40em  (sets the viewport to 40em or 640px)
```

And it works with the `p` query string variable so you can also do:

```
http://patternlab.localhost/?p=atoms-landscape-4x3&w=400px
```

## <span id="annotations-view"></span>Opening Annotations View on Page Load

When sending a particular pattern to a client for review you may not want to include directions for how to open annotations. You can force the annotations view to open on page load by using the `view` query string variables with the values `annotations` or `a`:

```
http://patternlab.localhost/?p=templates-homepage&view=annotations
http://patternlab.localhost/?p=templates-homepage&view=a
```

You can also force the annotations panel to scroll to a particular item by including the query string variable `number`. To scroll to the fifth element in the list of annotations you'd do the following:

```
http://patternlab.localhost/?p=templates-homepage&view=annotations&number=5
```

## <span id="code-view"></span>Opening Code View on Page Load

When sending a particular pattern to a client for review you may not want to include directions for how to open the code view. You can force the code view to open on page load by using the `view` query string variables with the values `code` or `c`:

```
http://patternlab.localhost/?p=templates-homepage&view=code
http://patternlab.localhost/?p=templates-homepage&view=c
```

You can also force the HTML tab mark-up to be highlighted for copying by including the query string variable `copy`.

```
http://patternlab.localhost/?p=templates-homepage&view=code&copy=true
```

## <span id="hay-mode"></span>Starting Hay Mode on Page Load

You can start Hay mode automatically when the page is loaded by using the `h` or `hay` query string variables.

```
http://patternlab.localhost/?h=true
http://patternlab.localhost/?hay=true
```

And it works with the `p` query string variable so you can also do:

```
http://patternlab.localhost/?p=atoms-landscape-4x3&h=true
```

## <span id="disco-mode"></span>Starting Disco Mode on Page Load

You can start disco mode automatically when the page is loaded by using the `d` or `disco` query string variables.

```
http://patternlab.localhost/?d=true
http://patternlab.localhost/?disco=true
```

And it works with the `p` query string variable so you can also do:

```
http://patternlab.localhost/?p=atoms-landscape-4x3&d=true
```
