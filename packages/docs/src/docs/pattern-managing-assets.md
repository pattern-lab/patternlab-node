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
sitemapChangefreq: 'monthly'
---

Assets for patterns - including JavaScript, CSS, and images - should be stored and edited in the `./source/` directory. Pattern Lab will move these assets to the `./public/` directory for you when you generate your site or when you watch the `./source/` directory for changes. _You can name and organize your assets however you like._ If you would like to use `./source/stylesheets/` to store your styles instead of `./source/css/` you can do that. The structure will be maintained when they're moved to the `./public/` directory.

Pattern Lab ships with copy tasks in the `Gruntfile.js` or `Gulpfile.js` of [the Editions](https://github.com/pattern-lab/?utf8=%E2%9C%93&query=edition-node) that copy your assets for you.

This structure is meant to be extended to suit your purposes. Change targets, move files, or ignore certain filetypes altogether. **Note**: If you make changes to `Gruntfile.js` or `Gulpfile.js`, such as to copy a new directory, and have auto re-generation and browser reload enable, you will need to stop and start your tasks to pick up the changes.

## Configuring Asset Locations

Pattern Lab has a configuration object which allows users to separate source patterns and assets from what is generated. The paths are managed within `patternlab-config.json`, found at the root of the edition project. The contents are sampled here:

```javascript
  "paths" : {
    "source" : {
      "root": "source/",
      "patterns" : "source/_patterns/",
      "data" : "source/_data/",
      "meta": "source/_meta/",
      "annotations" : "source/_annotations/",
      "styleguide" : "dist/",
      "patternlabFiles": {
        "general-header": "views/partials/general-header.hbs",
        "general-footer": "views/partials/general-footer.hbs",
        "patternSection": "views/partials/patternSection.hbs",
        "patternSectionSubgroup": "views/partials/patternSectionSubgroup.hbs",
        "viewall": "views/viewall.hbs"
      },
      "js" : "source/js",
      "images" : "source/images",
      "fonts" : "source/fonts",
      "css" : "source/css/"
    },
    "public" : {
      "root" : "public/",
      "patterns" : "public/patterns/",
      "data" : "public/styleguide/data/",
      "annotations" : "public/annotations/",
      "styleguide" : "public/styleguide/",
      "js" : "public/js",
      "images" : "public/images",
      "fonts" : "public/fonts",
      "css" : "public/css"
    }
  }
```

Note how some sets of files even extend into the "vendor" `./node_modules/` directory. Relative paths are the default but absolute paths are supported also. You may also use these paths within the Grunt or Gulp taskfiles by referring to the `paths()` function.

## Preprocessed files

In case you're using a preprocessor to e.g. compile TypeScript files to JavaScript files, or SCSS/SASS files to CSS files, you might want to use your solution of choice, that perfectly fits your needs. Pattern Lab doesn't restrict you at all on this, and as well doesn't deliver any defaults for the general pattern files. So e.g. you could install [`sass` node package](https://www.npmjs.com/package/sass) to compile `.scss` files, add a script to your `package.json` as well, and let those files get generated at the `./source/css` folder.

You might want to even also ignore those source files from being copied over to your `public` folders, as they won't need to get delivered to a hosting environment, which we describe in the next section.

## Preventing specific filetypes from being copied

If you'd like to prevent specific filetypes from being copied from your `source` to your `public` folder like e.g. CSS preprocessor source files (`.scss`), you could specify those within an array of your pattern lab config:
``` json
{
  "transformedAssetTypes": ["scss"],
}
```

## Adding Assets to the Pattern Header &amp; Footer

Static assets like Javascript and CSS **are not** added automagically to your patterns. You need to add them manually to the [shared pattern header and footer](/docs/modifying-the-pattern-header-and-footer/).
