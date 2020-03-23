---
title: Editing Pattern Lab Source Files
tags:
  - docs
category: getting-started
eleventyNavigation:
  title: Editing Pattern Lab Source Files
  key: getting-started
  order: 20
---

When editing Pattern Lab you must put your files and edit them in the `./source/` directory. This includes your static assets like [JavaScript, CSS, and images](/docs/pattern-managing-assets.html). Each time [your site is generated](/docs/generating-pattern-lab.html) your patterns will be compiled and your static assets will be moved to the `./public/` directory. Because of this you **should not edit** the files in the `./public/` directory.

## Pattern Lab Directories

For the most part you can organize `./source/` anyway you see fit. There are a few Pattern Lab-specific directories though. They are:

- `_annotations/` - where your annotations reside. [learn more](/docs/pattern-adding-annotations.html).
- `_data/` - where the global data used to render your patterns resides. [learn more](/docs/data-overview.html).
- `_meta/` - where the header and footer that get applied to all of your patterns resides. [learn more](/docs/pattern-header-footer.html).
- `_patterns/` - where your patterns, pattern documentation, and pattern-specific data reside. [learn more](/docs/pattern-organization.html).

## Configuring Pattern Lab Directories

All Pattern Lab directories can be configured to suit your needs.

```js
// base directories
exportDir: 'value'; // default is exports. where clean mark-up sans PL code is exported to.
publicDir: 'value'; // default is public
sourceDir: 'value'; // default is source

// exportDir is the base directory for the following directories  (e.g. ./exports/patterns)
patternExportDir: 'value'; // default is patterns

// publicDir is the base directory for the following directories  (e.g. ./public/patterns)
componentDir: 'value'; // default is patternlab-components. where plugin components are installed.
patternPublicDir: 'value'; // default is patterns

// sourceDir is the base directory for the following directories (e.g. ./source/_patterns)
annotationsDir: 'value'; // default is _annotations
dataDir: 'value'; // default is _data
metaDir: 'value'; // default is _meta
patternSourceDir: 'value'; // default is _patterns
```

In the Node version of Pattern Lab you can modify the following configuration options in `patternlab-config.json`:

```javascript
"paths" : {
  "source" : {
    "root": "./source/",
    "patterns" : "./source/_patterns/",
    "data" : "./source/_data/",
    "meta": "./source/_meta/",
    "annotations" : "./source/_annotations/",
    "styleguide" : "./node_modules/styleguidekit-assets-default/dist/",
    "patternlabFiles" : "./node_modules/styleguidekit-mustache-default/views/",
    "js" : "./source/js",
    "images" : "./source/images",
    "fonts" : "./source/fonts",
    "css" : "./source/css/"
  },
  "public" : {
    "root" : "./public/",
    "patterns" : "./public/patterns/",
    "data" : "./public/styleguide/data/",
    "annotations" : "./public/annotations/",
    "styleguide" : "./public/styleguide/",
    "js" : "./public/js",
    "images" : "./public/images",
    "fonts" : "./public/fonts",
    "css" : "./public/css"
  }
}
```

## Watching for Source File Changes

Manually generating the Pattern Lab website after each change can be cumbersome. The Node version of Pattern Lab comes with the ability to [watch files in the `./source/` directory for changes and re-generate the site automatically](/docs/advanced-auto-regenerate.html). The Pattern Lab website can also be [automatically reloaded](/docs/advanced-reload-browser.html).
