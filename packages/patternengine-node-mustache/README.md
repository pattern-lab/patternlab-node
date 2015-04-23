[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.png?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node) 

## About the Node Version of Pattern Lab

The Node version of Pattern Lab is, at its core, a static site generator. It combines platform-agnostic assets, like the [Mustache](http://mustache.github.io/)-based patterns and the JavaScript-based viewer, with a Node-based "builder" that transforms and dynamically builds the Pattern Lab site. By making it a static site generator, the Node version of Pattern Lab strongly separates patterns, data, and presentation from build logic. The Node version is a work in progress, the [PHP version](https://github.com/pattern-lab/patternlab-php) should be seen as a reference for other developers to improve upon as they build their own Pattern Lab Builders in their language of choice.

### Getting Started

To run patternlab-node, run the following from the command line at the root of whichever directory you want to initialize your project in: 

1. `npm install`
2. `npm install -g grunt-cli`
3. `grunt`  

This creates all patterns, the styleguide, and the pattern lab site.

### Command Line Interface

The following are grunt task arguments you may execute:

##### `patternlab`
With no arguments, patternlab runs the full builder, compiling patterns, and constructing the front-end site.

##### `patternlab:only_patterns`
Compile the patterns only, outputting to ./public/patterns

##### `patternlab:v`
Retrieve the version of patternlab-node you have installed

##### `patternlab:help`
Get more information about patternlab-node, pattern lab in general, and where to report issues.

### Config Options

##### Watching Changes
To have patternlab-node watch for changes to either a mustache template, data, or stylesheets, run `grunt watch`. The `Gruntfile` governs what is watched. It should be easy to add scss or whatever preprocessor you fancy.

##### Nav Bar Controls
If you don't have a need for some of the nav-bar tools in the patternlab frontend, you can turn them off in `config.json`.

The current selection is as follows. It reflects support versus patternlab-php.

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


##### Pattern Export
`config.json` also has two properties that work together to export completed patterns for use in a production environment. Provide an array of keys and an output directory. Pattern Lab doesn't ship with any pattern export keys, but the default directory is `"./pattern_exports/"` created inside the install directory. 

```
"patternExportKeys": ["molecules-primary-nav", "organisms-header", "organisms-header"],
"patternExportDirectory": "./pattern_exports/"
```

Coupled with exported css (much easier to extract with existing tools like [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy)), pattern export can help to maintain the relevancy of the design system by directly placing partials in a directory of your choosing.


##### Verbose Mode
`patternlab.json` is a file created for debugging purposes. Set `debug` to true in `.config.json` to see all the secrets.

##### Server
Running `grunt serve` will compile the patternlab front end and host it on <a href="http://localhost:9001">http://localhost:9001</a> by default. Page will reload on any saved source code change.

===

The Node version of Pattern Lab is maintained by [@bmuenzenmeyer](https://twitter.com/bmuenzenmeyer) and contributors. Pull requests welcome, but please take a moment to read the [guidelines](https://github.com/pattern-lab/patternlab-node/blob/master/CONTRIBUTING.md).

### Upgrading

You can find some simple upgrade documenation in it's current home here (unreleased but confirmed to work): [https://github.com/pattern-lab/website/blob/dev/patternlabsite/docs/node/upgrading.md](https://github.com/pattern-lab/website/blob/dev/patternlabsite/docs/node/upgrading.md)

### Forward, To the Specification!

Dave Olsen has published the [specification](https://github.com/pattern-lab/the-spec/blob/draft/SPEC.md) for Pattern Lab ports. Development will be oriented toward compliance with this as the spec and the port mature together. 

### Is Pattern Lab a Platform or a Build Tool?

A lot of good conversation has revolved around whether Pattern Lab is a platform or a tool in the toolbox, part of a larger solution. It's my goal to #1) adhere to the specification and #2) meet the needs of both use cases.

If you want to only build the patterns, alter your `Gruntfile.js` patternlab task to the following:

```
grunt.registerTask('default', ['clean', 'concat', 'patternlab:only_patterns', /*'sass',*/ 'copy']);
```

This will output compiled patterns to ./public/patterns/

### Where is the Gulp Version?

The core patternlab engine is free of any dependencies to grunt, allowing users to integrate with gulp if desired. Future efforts here will orient towards [this gulp implementation](https://github.com/oscar-g/patternlab-node/tree/dev-gulp) by [oscar-g](https://github.com/oscar-g).

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
