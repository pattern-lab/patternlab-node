---
title: Modifying the Pattern Header & Footer
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Modifying the Pattern Header & Footer
  key: patterns
  order: 130
sitemapPriority: '0.8'
sitemapChangefreq: 'monthly'
---

To add your own assets like JavaScript and CSS to your patterns' header and footer you need to modify two files:

- `./source/_meta/_head.hbs`
- `./source/_meta/_foot.hbs`

These files are added to every rendered pattern, "view all" page and style guide. To see your changes simply re-generate your site.

## Important: Don't Remove Two Things...

**Do not remove the following two lines in these patterns:**

- a tag referencing `patternLabHead` in `_head.hbs`
- a tag referencing `patternLabFoot` in `_foot.hbs`

Pattern Lab will not so mysteriously stop working if you do.
