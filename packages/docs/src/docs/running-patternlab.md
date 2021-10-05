---
title: Running Pattern Lab
tags:
  - docs
category: getting-started
eleventyNavigation:
  title: Running Pattern Lab
  key: getting-started
  order: 1
sitemapPriority: '0.8'
sitemapChangefreq: 'monthly'
---

## Running Pattern Lab

It's as easy as running the following command:

```
npm run start
```

This will start the system and open the URL it's running on within your browser.
Relevant information regarding and step and possible errors are being logged to the console so it's recommended to watch out for any problems possibly occuring with your installation or any of the content or data you're setting up.

### Problems and errors after restructuring files and folders

If you're doing bigger changes especially to the file and folder structure and recognize some errors on the console like e.g. `TypeError: Cannot read property 'render' of undefined` or `Error building BuildFooterHTML`, it's recommended to stop Pattern Lab, delete the cache file `dependencyGraph.json` within the projects root and start Pattern Lab again, as these changes might conflict with the existing cache structures.
