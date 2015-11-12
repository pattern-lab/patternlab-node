[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.png?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node)

## About the Node Version of Pattern Lab

The Node version of [Pattern Lab](http://patternlab.io/) is, at its core, a static site generator. It combines platform-agnostic assets, like the Mustache-based patterns, the JavaScript-based viewer, and the self-contained webserver, with a Node-based "builder" that transforms and dynamically builds the Pattern Lab site.

This repository contains the vanilla builder logic, grunt and gulp configurations, and some sample template/css/data to illustrate the power and flexibility of the tool.

### Download

* Download the [latest release of patternlab-node](https://github.com/pattern-lab/patternlab-node/releases/latest) from Github
* Via npm, run `npm install patternlab-node` (Note this will auto install the grunt version currently. see below)
* **NOTE** Node version 4.X and 5.X have tentative support, citing [a lot of Windows issues](https://github.com/nodejs/node-gyp/issues/629), including [mine](https://github.com/pattern-lab/patternlab-node/issues/162). Upgrade node at your own risk until otherwise stated. I've tried to catalog some issues and troubleshooting steps on the [wiki](https://github.com/pattern-lab/patternlab-node/wiki/Windows-Issues).

### Choose Your Adventure! Now Vanilla, Grunt & Gulp

This repository ships with two `package.json` files, a `Gruntfile.js`, and a `gulpfile.js`. The default is grunt currently. The core builder is not dependent on either.

### Getting Started - Grunt

To run patternlab-node using grunt, do the following in the directory you downloaded and extracted the zipped release:

1. Run `npm install` from the command line
2. Optionally, delete `package.gulp.json`, `gulpfile.js`, and `builder/patternlab_gulp.js` files if you are certain you don't need it.
* Not deleting `builder/patternlab_gulp.js` may cause a harmless error when running grunt. Delete it.
3. Run `grunt` or `grunt serve` from the command line

This creates all patterns, the styleguide, and the pattern lab site. It's strongly recommended to run `grunt serve` to have BrowserSync spin up and serve the files to you.

### Getting Started - Gulp

To run patternlab-node using gulp, you need to swap out the default grunt configuration. Do the following in the directory you downloaded and extracted the zipped release:

1. Rename `package.json` to `package.grunt.json` or delete it if you don't intend on going back
2. Rename `package.gulp.json` to `package.json`
3. Run `npm install` from the command line
4. Run `gulp` or `gulp serve` from the command line

This creates all patterns, the styleguide, and the pattern lab site. It's strongly recommended to run `grunt serve` to see have BrowserSync spin up and serve the files to you.

### There and Back Again, or Switching Between Grunt and Gulp

It's not expected to toggle between the two build systems, but for those migrating between the two configs, here's some general guidelines:

* Make sure your `package.json` files are correct per the Getting Started sections.
* Run `npm cache clear` before installation
* Delete the contents of `./node_modules` if you want a cleaner installation.
* Regarding speed, Gulp is faster. BrowserSync takes a bit longer than the old static server to spin up, but its capabilities far outweigh the startup cost.

### Upgrading

You can find some simple upgrade documenation in it's current home here (unreleased but confirmed to work): [https://github.com/pattern-lab/website/blob/dev/patternlabsite/docs/node/upgrading.md](https://github.com/pattern-lab/website/blob/dev/patternlabsite/docs/node/upgrading.md)

### Command Line Interface

The following are grunt/gulp task arguments you may execute:

##### `patternlab`
With no arguments, patternlab runs the full builder, compiling patterns, and constructing the front-end site.

##### `patternlab:only_patterns`
Compile the patterns only, outputting to ./public/patterns

##### `patternlab:v`
Retrieve the version of patternlab-node you have installed

##### `patternlab:help`
Get more information about patternlab-node, pattern lab in general, and where to report issues.

### Further Configuration

##### Watching Changes
To have patternlab-node watch for changes to either a mustache template, data, or stylesheets, run `grunt|gulp watch` or `grunt|gulp serve`. The `Gruntfile|Gulpfile` governs what is watched. It should be easy to add scss or whatever preprocessor you fancy.

##### Preprocessor Support
The patternlab-node release package ships with some `.scss` files utilized in the creation of the style guide and sample templates, but these are not required. The compilation tasks are commented out in the `Gruntfiles|Gulpfiles` but can be uncommented or changed to meet your needs. Sass modules are not included in `package.json` files - the prevailing thought being if you are familiar enough with preprocessors, you can use the instructions for [grunt-contrib-sass](https://github.com/gruntjs/grunt-contrib-sass) / [gulp-sass](https://github.com/dlmanning/gulp-sass) / _preprocessor of choice_ to install them. Uncomment the preprocessor configuration to fully utilize the example templates, css and style guide.

**NOTE:** You may run into issues installing gulp-sass if you don't have the latest Visual Studio on Windows. See [here](https://github.com/sass/node-sass/issues/469) for more information and [this query](https://github.com/sass/node-sass/issues?utf8=%E2%9C%93&q=is%3Aissue+install) for a slew of installation problems related to gulp-sass.

##### Nav Bar Controls
If you don't have a need for some of the nav-bar tools in the Pattern Lab frontend, you can turn them off in `config.json`.

The current selection is as follows.

```
"ishControlsVisible": {
	"s": true,
	"m": true,
	"l": true,
	"full": true,
	"random": true,
	"disco": true,
	"hay": true,
	"mqs": false,
	"find": false,
	"views-all": true,
	"views-annotations": true,
	"views-code": true,
	"views-new": true,
	"tools-all": true,
	"tools-follow": false,
	"tools-reload": false,
	"tools-shortcuts": false,
	"tools-docs": true
}
```
##### Pattern States
You can set the state of a pattern by including it in `config.json` too. The out of the box styles are in progress (orange), in review (yellow), and complete (green).
Pattern states should be lowercase and use hyphens where spaces are present.
```
"patternStates": {
	"colors" : "inprogress",
	"fonts" : "inreview",
	"three-up" : "complete"
}
```

##### Pattern Export
`config.json` also has two properties that work together to export completed patterns for use in a production environment. Provide an array of keys and an output directory. Pattern Lab doesn't ship with any pattern export keys, but the default directory is `"./pattern_exports/"` created inside the install directory.

```
"patternExportKeys": ["molecules-primary-nav", "organisms-header", "organisms-header"],
"patternExportDirectory": "./pattern_exports/"
```

Coupled with exported css (much easier to extract with existing tools like [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy)), pattern export can help to maintain the relevancy of the design system by directly placing partials in a directory of your choosing.

##### baseurl

If your instance of Pattern Lab lives in a subdirectory of your server, for instance on github pages (ex: yourusername.github.io/patterns-demo/), then add the baseurl here. The baseurl is everything after the hostname - ie: `patterns-demo`

```
"baseurl" : "/patterns-demo"
```

Default: blank

##### excluding patterns

If you'd like to exclude an individual pattern you can do so by prepending the filename with an underscore, like: `_filename.mustache`

You can also exclude complete directories by prepending the directory name with an underscore, like: `/_experiment/...`

##### Style Guide Excludes

Exclude whole pattern types from the "All patterns" styleguide by adding entries to `config.json`. This is quite useful to make speedier. Pattern Lab Node ships with the following:

```
"styleGuideExcludes": [
	"templates",
	"pages"
]
```


##### Debug Mode
`patternlab.json` is a file created for debugging purposes. Set `debug` to true in `.config.json` to see all the secrets.

##### Server &amp; BrowserSync
Running `grunt serve` or `gulp serve` will compile the Pattern Lab frontend and host it by default on <a href="http://localhost:3000">http://localhost:3000</a> via [BrowserSync](http://www.browsersync.io/docs/). After it starts, templates, `data.json`, and scss/css changes in your source code will be automatically injected into the page.

You'll notice that if you have this open across different browsers, we do our best to keep the frontend in sync, but there is a known issue with synced navigation using the main menu.

### Roadmap


A roadmap exists for Pattern Lab Node. Check it out [here](https://github.com/pattern-lab/patternlab-node/issues/134). The Node version of Pattern Lab is maintained by [@bmuenzenmeyer](https://twitter.com/bmuenzenmeyer) and contributors. Pull requests welcome, but please take a moment to read the [guidelines](https://github.com/pattern-lab/patternlab-node/blob/master/CONTRIBUTING.md).

Dave Olsen has also published the [specification](https://github.com/pattern-lab/the-spec/blob/draft/SPEC.md) for Pattern Lab ports. Development will be oriented toward compliance with this as the spec and the port mature together. Post v1 work will focus on other pattern engines and a plugin architecture.

### Advanced Pattern Library Features

##### Pattern Parameters
Pattern parameters are a simple mechanism for replacing Mustache variables via attributes on a pattern partial tag rather than having to use a pattern-specific json file. They are especially useful when you want to supply distinct values for Mustache variables in a specific pattern partial instance that may be included multiple times in a molecule, template, or page.

The basic syntax is this:

```
{{> molecules-single-comment(description: 'A life is like a garden. Perfect moments can be had, but not preserved, except in memory.') }}
```

The attributes listed in the pattern parameters should match Mustache variable names in your pattern. The values listed for each attribute will replace the Mustache variables. Again, pattern parameters are a simple find and replace of Mustache variables with the supplied values.

Pattern parameters **do not** currently support the following:

* sub-lists (e.g. iteration of a section),
* and the use of long strings of text can be unwieldy
* nested properties within the parameter data, such as `{{> molecules-single-comment(foo.bar: 'baz') }}`

You can read the full documentation on pattern parameters here: [Using Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html)

##### Pattern Style Modifiers
Style Modifiers allow you to create a base pattern that you can easily modify by adding a class name to the pattern partial. Read more about them [here](http://patternlab.io/docs/pattern-stylemodifier.html), including support with pattern parameters. Below is the gist.

The basic syntax is this:

```
{{> atoms-message:error }}
```

This works by using a reserved mustache variable of sorts called {{ styleModifier }} applied to the atoms-message mustache file itself:

```
<div class="message {{ styleModifier }}">{{ message }}</div>
```

Once rendered, it looks like this:

```
<div>
    <div class="message error"></div>
</div>
```




##### Pseudo-Patterns
Pseudo-patterns are meant to give developers the ability to build multiple and unique **rendered** patterns off of one base pattern and its mark-up while giving them control over the data that is injected into the base pattern. This feature is especially useful when developing template- and page-style patterns.

Pseudo-patterns are, essentially, the pattern-specific JSON files that would accompany a pattern. Rather than require a Mustache pattern, though, pseudo-patterns are hinted so a developer can reference a shared pattern. The basic syntax:

`patternName~pseudoPatternName.json`

The tilde, `~`, and JSON extension denotes that this is a pseudo-pattern. `patternName` is the parent pattern that will be used when rendering the pseudo-pattern. `patternName` and `pseudoPatternName` are combined when adding the pseudo-pattern to the navigation.

The JSON file itself works exactly like the [pattern-specific JSON file](http://patternlab.io/docs/data-pattern-specific.html). It has the added benefit that the pseudo-pattern will also import any values from the parent pattern's pattern-specific JSON file. Here is an example (which ships with the package) where we want to show an emergency notification on our homepage template. Our `03-templates/` directory looks like this:

```
00-homepage.mustache
01-blog.mustache
02-article.mustache
```

Our `00-homepage.mustache` template might look like this:

```
<div id="main-container">
    {{# emergency }}
        <div class="emergency">Oh Noes! Emergency!</div>
    {{/ emergency }}
    { ...a bunch of other content... }
</div>
```

If our `_data.json` file doesn't give a value for `emergency` that section will never show up when `00-homepage.mustache` is rendered.

We want to show both the regular and emergency states of the homepage but we don't want to duplicate the entire `00-homepage.mustache` template. That would be a maintenance nightmare. So let's add our pseudo-pattern:

```
00-homepage.mustache
00-homepage~emergency.json
01-blog.mustache
02-article.mustache
```

In our pseudo-pattern, `00-homepage~emergency.json`, we add our `emergency` attribute:

```
{
    "emergency": true
}
```

Now when we generate our site we'll have our homepage template rendered twice. Once as the regular template and once as a pseudo-pattern showing the emergency section. Note that the pseudo-pattern will show up in our navigation as `Homepage Emergency`.

##### Pattern Linking
You can build patterns that link to one another to help simulate using a real website. This is especially useful when working with the Pages and Templates pattern types. The basic format is:

`{{ link.pattern-name }}`

For example, if you wanted to add a link to the `home page` template from your `blog` template you could write the following:

`<a href="{{ link.templates-homepage }}">Home</a>`

This would compile to:

`<a href="/patterns/templates-homepage/templates-homepage.html">Home</a>`

As you can see, it's a much easier way of linking patterns to one another.

===

## Working with Patterns

(The following documentation is built for the PHP version of Pattern Lab, but most applies to the node version too. If you find omissions or mistakes please open an issue.)

Patterns are the core element of Pattern Lab. Understanding how they work is the key to getting the most out of the system. Patterns use [Mustache](http://mustache.github.io/) so please read [Mustache's docs](http://mustache.github.io/mustache.5.html) as well.

* [How Patterns Are Organized](http://patternlab.io/docs/pattern-organization.html)
* [Adding New Patterns](http://patternlab.io/docs/pattern-add-new.html)
* [Reorganizing Patterns](http://patternlab.io/docs/pattern-reorganizing.html)
* [Including One Pattern Within Another via Partials](http://patternlab.io/docs/pattern-including.html)
* [Managing Assets for a Pattern: JavaScript, images, CSS, etc.](http://patternlab.io/docs/pattern-managing-assets.html)
* [Modifying the Pattern Header and Footer](http://patternlab.io/docs/pattern-header-footer.html)
* [Using Pattern Parameters](http://patternlab.io/docs/pattern-parameters.html)
* [Using Pattern State](http://patternlab.io/docs/pattern-states.html)
* ["Hiding" Patterns in the Navigation](http://patternlab.io/docs/pattern-hiding.html)
* [Adding Annotations](http://patternlab.io/docs/pattern-adding-annotations.html)
* [Viewing Patterns on a Mobile Device](http://patternlab.io/docs/pattern-mobile-view.html)

## Creating & Working With Dynamic Data for a Pattern

The Node version of Pattern Lab utilizes Mustache as the template language for patterns. In addition to allowing for the [inclusion of one pattern within another](http://patternlab.io/docs/pattern-including.html) it also gives pattern developers the ability to include variables. This means that attributes like image sources can be centralized in one file for easy modification across one or more patterns. The Node version of Pattern Lab uses a JSON file, `source/_data/data.json`, to centralize many of these attributes.

* [Introduction to JSON & Mustache Variables](http://patternlab.io/docs/data-json-mustache.html)
* [Overriding the Central `data.json` Values with Pattern-specific Values](http://patternlab.io/docs/data-pattern-specific.html)
* [Linking to Patterns with Pattern Lab's Default `link` Variable](http://patternlab.io/docs/data-link-variable.html)
* [Creating Lists with Pattern Lab's Default `listItems` Variable](http://patternlab.io/docs/data-listitems.html)

## Using Pattern Lab's Advanced Features

By default, the Pattern Lab assets can be manually generated and the Pattern Lab site manually refreshed but who wants to waste time doing that? Here are some ways that Pattern Lab can make your development workflow a little smoother:

* [Watching for Changes and Auto-Regenerating Patterns](http://patternlab.io/docs/advanced-auto-regenerate.html) - Node version coming soon
* [Auto-Reloading the Browser Window When Changes Are Made](http://patternlab.io/docs/advanced-reload-browser.html) - Node version coming soon
* [Multi-browser & Multi-device Testing with Page Follow](http://patternlab.io/docs/advanced-page-follow.html)
* [Keyboard Shortcuts](http://patternlab.io/docs/advanced-keyboard-shortcuts.html)
* [Special Pattern Lab-specific Query String Variables ](http://patternlab.io/docs/pattern-linking.html)
* [Preventing the Cleaning of public/](http://patternlab.io/docs/advanced-clean-public.html) - Node version coming soon
* [Modifying the Pattern Lab Nav](http://patternlab.io/docs/advanced-pattern-lab-nav.html) - Node version coming soon
* [Editing the config.ini Options](http://patternlab.io/docs/advanced-config-options.html) - Node version coming soon
