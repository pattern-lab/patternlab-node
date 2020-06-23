---
title: Overview of Pattern Lab's Ecosystem
tags:
  - docs
category: advanced
eleventyNavigation:
  key: advanced
  title: Overview of Pattern Lab's Ecosystem
  order: 300
---

Pattern Lab 2 introduces the beginnings of an ecosystem that will allow teams to mix, match and extend Pattern Lab to meet their specific needs. It will also make it easier for the Pattern Lab team to push out new features. Documentation that explains how best to take advantage of the ecosystem will be released in the coming weeks.

## Editions

Editions let teams and agencies bundle all the things that support their unique workflows with Pattern Lab. An Edition can become the starting point for all of your projects while teams share and update functionality. The Node version of Pattern Lab uses [npm](https://www.npmjs.com/) to pull in separate components.

## Components of an Edition

The following is good overview of what components might make up an edition:

<img src="/images/pattern-lab-2-image_18-large-opt.png">

This is by no means exhaustive and can be added to as needed. Here is a description of each component:

### Pattern Lab Core

Core is the guts of Pattern Lab and enables all of the other features. Because Core is standalone a team can update and stay current with the latest Pattern Lab features without disrupting the rest of their project.

### StarterKits

Have a trusty set of boilerplate code that you start every project with? Perhaps a common set of basic patterns, Sass mix-ins, and JavaScript libraries that are your go-to tools? A StarterKit is perfect for bundling these assets together into a boilerplate that makes sure each project starts off on the right foot.

[Several starterkits](https://github.com/pattern-lab?utf8=%E2%9C%93&q=starterkit&type=&language=) already exist to kick your project off, whether you’re looking for a blank start, begin with a demo that showcases Pattern Lab’s features, or start with a popular framework like Bootstrap, Foundation, or Material Design. And you can roll your own, which can be fully version-controlled so your team’s StarterKit can evolve along with your tools.

Importing a starterkit is only a few keystrokes away after installation.

[Learn more about Starterkits](/docs/starterkits/)

### StyleguideKits

StyleguideKits are the front-end of Pattern Lab. We call this “The Viewer.” StyleguideKits allow agencies and organizations to develop custom, branded Pattern Lab UIs to show off their patterns.

### PatternEngines

PatternEngines are the templating engines that are responsible for parsing patterns and turning them into HTML. PatternEngines give Pattern Lab Core the flexibility to render many different types of template languages. Current PatternEngines include Mustache and Twig, with others like Handlebars and Underscore in development. And there’s no stopping you from adding another templating engine to Pattern Lab.

### Plugins

Plugins allow developers to extend Pattern Lab Core and other parts of the ecosystem. Pattern Lab’s architecture allows developers to modify data at different stages, add their own commands or pattern rules, or change the front-end to modify and extend Pattern Lab’s capabilities.

#### Node Plugins

Currently the following plugins are provided by the community:
* [plugin-tab](https://github.com/pattern-lab/patternlab-node/tree/master/packages/plugin-tab): Displaying sibling files next to a pattern in the filesystem as further code tab panels
* [plugin-node-minify-html](https://github.com/JosefBredereck/plugin-node-minify-html): Patternlab Node HTML tabs panel compressor/minifier/beautifier
* [patternlab-plugin-node-wrappable](https://github.com/networkteam/patternlab-plugin-node-wrappable): Configuration to wrap patterns styleguide HTML output (e.g. for inverse backgrounds)
* [plugin-node-patternlab-inline-assets](https://github.com/michaelworm/plugin-node-patternlab-inline-assets): Consume and inline assets (out of the file system) into your templates before compiling

Please feel to contribute and [add your plugin to this list as well](https://github.com/pattern-lab/patternlab-node/edit/dev/packages/docs/src/docs/advanced-ecosystem-overview.md).

### Other Types of Components

The flexibility of the Pattern Lab ecosystem means that teams can develop tools on top of Pattern Lab that meet _their_ needs. Want to standardize and push entire data sets to teams? Want to develop with granular collections of components instead of entire StarterKits? Only want to customize the CSS for the default StyleguideKit and distribute it as part of your projects? All of this and more is possible. We feel we're just scratching the surface on what it means to develop projects and design systems with a tool like Pattern Lab

## Guidance and Help

If you have ideas or would like guidance before we have all of the documentation done please learn how you can [engage with the Pattern Lab community](/support/).
