---
title: Managing Pattern Assets
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Managing Pattern Assets
  key: patterns
  order: 120
sitemapPriority: '0.8'
---

Assets for patterns - including JavaScript, CSS, and images - should be stored and edited in the `./source/` directory. Pattern Lab will move these assets to the `./public/` directory for you when you generate your site or when you watch the `./source/` directory for changes. _You can name and organize your assets however you like._ If you would like to use `./source/stylesheets/` to store your styles instead of `./source/css/` you can do that. The structure will be maintained when they're moved to the `./public/` directory.

Pattern Lab ships with copy tasks in the `Gruntfile.js` or `Gulpfile.js` of [the Editions](https://github.com/pattern-lab/?utf8=%E2%9C%93&query=edition-node) that copy your assets for you.

This structure is meant to be extended to suit your purposes. Change targets, move files, or ignore certain filetypes altogether. **Note**: If you make changes to `Gruntfile.js` or `Gulpfile.js`, such as to copy a new directory, and have auto re-generation and browser reload enable, you will need to stop and start your tasks to pick up the changes.

## Configuring Asset Locations

Pattern Lab has a configuration object which allows users to separate source patterns and assets from what is generated. The paths are managed within `patternlab-config.json`, found at the root of the edition project. The contents are sampled here:

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

Note how some sets of files even extend into the "vendor" `./node_modules/` directory. Relative paths are the default but absolute paths are supported also. You may also use these paths within the Grunt or Gulp taskfiles by referring to the `paths()` function.

## Preventing specific filetypes from being copied

If you'd like to prevent specific filetypes from being copied from your `source` to your `public` folder like e.g. CSS preprocessor source files (`.scss`), you could specify those within an array of your pattern lab config:
``` json
{
  "transformedAssetTypes": ["scss"],
}
```

## Adding Assets to the Pattern Header &amp; Footer

Static assets like Javascript and CSS **are not** added automagically to your patterns. You need to add them manually to the [shared pattern header and footer](/docs/modifying-the-pattern-header-and-footer/).
