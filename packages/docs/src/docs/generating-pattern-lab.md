---
title: Generating Pattern Lab
tags:
  - docs
category: getting-started
eleventyNavigation:
  title: Generating Pattern Lab
  key: getting-started
  order: 10
---

Running Pattern Lab for the first time will vary depending on which version was [installed](/docs/installation.html).

## edition-node

If you installed [edition-node](https://github.com/pattern-lab/edition-node), run the following command to serve Pattern Lab and watch for changes:

```
npm run pl:serve
```

## edition-node-gulp (legacy)

If you installed Pattern Lab [edition-node-gulp](https://github.com/pattern-lab/edition-node-gulp), run the following command to serve Pattern Lab and watch for changes:

```
gulp patternlab:serve
```

## TODO: Brought over from "Viewing Patterns"

Pattern Lab ships with [BrowserSync](https://www.browsersync.io/) to serve generated files to a browser. BrowserSync does a lot of cool things like reload files without a refresh, expose the site to your network, and synchronize page views across devices. To start the server do the following:

1. In a terminal window navigate to the root of your project
2. Type `gulp patternlab:serve`

> If using grunt, substitute `grunt` for `gulp` above.

Doing so will launch your local Pattern Lab install in your default browser at <a href="http://localhost:3000">http://localhost:3000</a>. The `Gruntfile|Gulpfile` at the root of your project contains additional configuration for BrowserSync.

## How to Stop the Server

To stop watching and serving files on Mac OS X and Windows you can press`CTRL+C` in the command line window where the process is running.

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/viewing-patterns'>The PHP docs for this topic can be viewed here.</a></strong>

## // End Viewing Patterns

## Pattern Lab is now running: now what?

Your Pattern Lab should now be populated and [available for viewing](/docs/viewing-patterns.html#node) and you can [make changes to your patterns](/docs/editing-source-files.html).
