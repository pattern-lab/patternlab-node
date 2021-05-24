---
title: Creating Pattern-specific Values
tags:
  - docs
category: data
eleventyNavigation:
  title: Creating Pattern-specific Values
  key: data
  order: 300
sitemapPriority: '0.8'
---

> **Note:** This article uses JSON because it is a standard between with the Node version of Pattern Lab.

Storing data for your atoms, molecules, and organisms in `./source/_data` may work just fine. When fleshing out templates and pages, where data may need to be unique to each page even if they use the same molecules and organisms, data stored in `./source/_data` can become cumbersome. In order to work around this the Node version of Pattern Lab allows you to define pattern-specific data files that allow you to override the default values found in `./source/_data`.

## Setting Up Pattern-specific Data

In order to tell the Node version of Pattern Lab to use pattern-specific data to override the default global data create a JSON file with the same name as the pattern and put it in the same directory as the pattern. For example, if you wanted to provide pattern-specific data for the `article` pattern under the pattern type `pages` your `pages` directory would look like this:

```
pages/article.mustache
pages/article.json
```

## Overriding the Default Variables

To override the global data using pattern-specific data make sure the latter has the same variable names as the former. For example, the 4x3 landscape image source may look like this in `data.json`:

```javascript
"landscape-4x3": {
    "src": "../../images/fpo-landscape-4x3.jpg",
    "alt": "Landscape 4x3 Image"
}
```

In our pattern-specific data file, `article.json`, we'd simply copy that structure and provide our own information:

```javascript
"landscape-4x3": {
    "src": "../../images/a-team-hero.jpg"
}
```

Now the article pattern will display an image of the A-Team when using `{% raw %}{{ landscape-4x3.src }}{% endraw %}`. All other patterns using `{% raw %}{{ landscape-4x3.src }}{% endraw %}` will display the default 4x3 image. Also, note that we **didn't** override the `landscape-4x3.alt` attribute. If we were to use that attribute in our pattern the default value, "Landscape 4x3 Image", would be displayed.

**Important note:** You don't have to override every attribute. You can limit the data in your pattern-specific data file to just those variables you want. The Node version of Pattern Lab will fallback to using the default attributes from `data.json` if the attributes aren't defined in the pattern-specific data file.

## Working With Includes

The only data that is loaded to render a pattern is its own data and global data. It will not include the data for any included patterns. For example, the pages template, `article`, might include the molecule, `block-hero`. `block-hero` may have its own pattern-specific data file, `block-hero.json`. The Node version of Pattern Lab **will not** use the `block-hero` data when rendering `article`. It will only use `article.json` (_if available_) and data found in `./source/_data`.
