---
title: Watching for Changes and Auto Regenerating Patterns
tags:
  - docs
---



Pattern Lab has the ability to watch for changes to patterns and frontend assets. When these files change, it will automatically rebuild the entire Pattern Lab website. You simply make your changes, save the file, and Pattern Lab will take care of the rest.

## How to Start the Watch

Open your terminal and navigate to the root of your project. Type:

```
gulp patternlab:build --watch
```

> If using grunt, substitute `grunt` for `gulp` above.

## How to Start the Watch and Self-Host the Pattern Lab Website

Rather than manually refreshing your browser when your patterns or frontend assets change you can have Pattern Lab watch for changes and [auto-reload your browser window](/docs/viewing-patterns.html#node) for you when it’s in watch mode.

## How to Stop the Watch

To stop watching files on Mac OS X and Windows you can press`CTRL+C` in the command line window where the process is running.

## The Default Files That Are Watched

By default, Pattern Lab monitors the following files:

* all of the JSON files under `source/_annotations/`
* all of the JSON files under `source/_data/`
* all of the files under `source/_meta/`
* all of the pattern templates under `source/_patterns/`
* all of the CSS files under `source/css/`
* all of the files under `source/images/` and `source/fonts/`
* all of the Javascript files under `source/js/`

The watch configuration is found within the Gruntfile or Gulpfile at the root of the project.

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/advanced-auto-regenerate'>The PHP docs for this topic can be viewed here.</a></strong>



