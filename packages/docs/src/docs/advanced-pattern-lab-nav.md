---
title: Modifying Pattern Lab's Navigation
tags:
  - docs
category: advanced
eleventyNavigation:
  title: Modifying Pattern Lab's Navigation
  key: advanced
  order: 300
---

When sharing Pattern Lab with a client it may be beneficial to turn-off certain elements in the default navigation. To turn-off navigation elements, alter the flags inside the `ishControlsHide` object within `patternlab-config.json` and then re-generate the site. The following keys are supported and will hide their respective elements if toggled on:

```javascript
"ishControlsHide": {
  "s": false,
  "m": false,
  "l": false,
  "full": false,
  "random": false,
  "disco": false,
  "hay": true,
  "find": false,
  "views-all": false,
  "views-annotations": false,
  "views-code": false,
  "views-new": false,
  "tools-all": false,
  "tools-docs": false
},
```

By default all navigation elements are visible except Hay Mode.
