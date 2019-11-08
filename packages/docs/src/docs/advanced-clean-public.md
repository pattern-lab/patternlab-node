---
title: Stopping public/ from Being "Cleaned"
tags:
  - docs
---



By default Pattern Lab deletes most of the files and directories found in `public/` when generating your site or starting the watch. Developers are supposed to use `source/` to store their files. This includes static assets like images, JavaScript and CSS. When generating your site Pattern Lab moves all of the static assets found in `source/` to `public/` (_after cleaning it_) so there shouldn't be a reason not to use `source/`.

That said, developers might be more comfortable storing their static assets in `public/`. In order to turn-off the automatic cleaning of `public/` do the following:

1. Open patternlab-config.json` at the root of your project
2. Change the `cleanPublic` from `"true"` to `"false"`

When you next generate your site or start the watch `public/` will no longer be cleaned. Identically named files will be overridden, however.

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/advanced-clean-public'>The PHP docs for this topic can be viewed here.</a></strong>



