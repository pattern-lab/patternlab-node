---
title: Adding New Patterns
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Adding New Patterns
  key: patterns
  order: 70
sitemapPriority: '0.8'
sitemapChangefreq: 'monthly'
---

To add new patterns to the Node version of Pattern Lab just add new Mustache templates under the appropriate pattern type or pattern subgroup directories in `./source/_patterns`. For example, let's add a new pattern under the pattern type "molecules" and the pattern sub-type "blocks". The `./source/_patterns/molecules/blocks/` directory looks like:

    block-hero.hbs
    headline-byline.hbs
    media-block.hbs

If we want to add a new pattern we simply tack it onto the end:

    block-hero.hbs
    headline-byline.hbs
    media-block.hbs
    new-pattern.hbs

If you want more control over their ordering please refer to "[Reorganizing Patterns](/docs/reorganizing-patterns/)."
