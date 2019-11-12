---
title: Generating CSS
tags:
  - docs
category: advanced
---

**Note:** _The [CSS Rule Saver](https://github.com/dmolsen/css-rule-saver) library and CSS generation feature was added in v0.6.0 of the PHP version of Pattern Lab._

When using this feature, Pattern Lab can display only those CSS rules that affect a given pattern on the pattern detail view. This might be useful if you have a large Sass-generated CSS file or framework but only need a sub-set of styles that may affect a small piece of mark-up or pattern.

## How to Generate the CSS

To generate your Pattern Lab site with CSS support on Mac OS X you can do the following:

1. Open `core/scripts/`
2. Double-click `generateSiteWithCSS.command`
3. Refresh the Pattern Lab site

For Linux and Windows users you can also start the service from the command line. To do so open your command prompt and navigate to the root of the patternlab-php directory. Type:

```
php core/builder.php -gc
```

## Important Note About Performance

It may take several seconds for the PHP version of Pattern Lab to generate a site when it's also calculating the CSS rules. Be patient.
