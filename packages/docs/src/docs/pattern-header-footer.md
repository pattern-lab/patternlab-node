---
title: Modifying the Pattern Header & Footer
tags:
  - docs
category: patterns
---

To add your own assets like JavaScript and CSS to your patterns' header and footer you need to modify two files:

- `./source/_meta/_00-head.mustache`
- `./source/_meta/_01-foot.mustache`

These files are added to every rendered pattern, "view all" page and style guide. To see your changes simply re-generate your site.

## Important: Don't Remove Two Things...

**Do not remove the following two lines in these patterns:**

- a tag referencing `patternLabHead` in `_00-head.mustache`
- a tag referencing `patternLabFoot` in `_00-foot.mustache`

Pattern Lab will not so mysteriously stop working if you do.
