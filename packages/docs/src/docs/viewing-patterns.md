---
title: Viewing Patterns
tags:
  - docs
category: getting-started
---

Pattern Lab ships with [BrowserSync](https://www.browsersync.io/) to serve generated files to a browser. BrowserSync does a lot of cool things like reload files without a refresh, expose the site to your network, and synchronize page views across devices. To start the server do the following:

1. In a terminal window navigate to the root of your project
2. Type `gulp patternlab:serve`

> If using grunt, substitute `grunt` for `gulp` above.

Doing so will launch your local Pattern Lab install in your default browser at <a href="http://localhost:3000">http://localhost:3000</a>. The `Gruntfile|Gulpfile` at the root of your project contains additional configuration for BrowserSync.

## How to Stop the Server

To stop watching and serving files on Mac OS X and Windows you can press`CTRL+C` in the command line window where the process is running.

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/viewing-patterns'>The PHP docs for this topic can be viewed here.</a></strong>
