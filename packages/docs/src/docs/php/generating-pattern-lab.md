---

title: Generating Pattern Lab | Pattern Lab
heading: Generating Pattern Lab - PHP
---

Pattern Lab consists of an empty shell when you first install it. To populate the public-facing side of Pattern Lab with your content and patterns do the following:

1. In a terminal window navigate to the root of your project
2. Type `php core/console --generate`

Your Pattern Lab install should now be populated and [available for viewing](/docs/viewing-patterns.html). As you [make changes to your patterns](/docs/editing-source-files.html) you'll need re-generate your site using step 2 above.

Manually re-generating your site after each change or collection of changes can be cumbersome. Pattern Lab can [watch files in the `./source/` directory for changes and re-generate the site automatically](/docs/advanced-auto-regenerate.html). The Pattern Lab website can also be [automatically reloaded](/docs/advanced-reload-browser.html).
