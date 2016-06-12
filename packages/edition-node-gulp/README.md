# Pattern Lab Node - Gulp Edition

The Gulp wrapper around [Pattern Lab Node Core](https://github.com/pattern-lab/patternlab-node), currently in 2.0.0-alpha, providing tasks to interact with the core library and move supporting frontend assets.

## Packaged Components

The Gulp Edition comes with the following components:

* `patternlab-node`: [GitHub](https://github.com/pattern-lab/patternlab-node), [npm](https://www.npmjs.com/package/patternlab-node)
* `patternengine-node-mustache`: [GitHub](https://github.com/pattern-lab/patternengine-node-mustache), [npm](https://www.npmjs.com/package/patternengine-node-mustache)
* `pattern-lab/styleguidekit-assets-default`: [GitHub](https://github.com/pattern-lab/styleguidekit-assets-default)
* `pattern-lab/styleguidekit-mustache-default`: [GitHub](https://github.com/pattern-lab/styleguidekit-mustache-default)

## Prerequisites

Pattern Lab Node uses [Node](https://nodejs.org) and  [npm](https://www.npmjs.com/) to manage project dependencies, and [gulp](http://gulpjs.com/) to run tasks and interface with core.

Please follow the directions for [installing Node](https://nodejs.org/en/download/) on the Node website. This should include `npm`.

It's also highly recommended that you [install gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) globally.

## Installing

There are two methods for downloading and installing the Gulp Edition:

* [Download a pre-built package](#download-a-pre-built-package)
* [Use Composer to create a project](#use-npm)

### Download a pre-built package

The fastest way to get started with the Gulp Edition is to [download the pre-built version](https://github.com/pattern-lab/edition-node-gulp/releases) from the [releases page](https://github.com/pattern-lab/edition-node-gulp/releases). The pre-built project comes with the [Default Starterkit for Mustache](https://github.com/pattern-lab/starterkit-mustache-default/tree/dev) installed by default.

**Please note:** Pattern Lab Node uses [npm](https://www.npmjs.com/) to manage project dependencies. To upgrade the Gulp Edition or to install plug-ins you'll need to be familiar with npm.

### Use npm

Most people want to run Pattern Lab Node standalone and not as a dependency. If you wish to install as a dependency you can do the following:

#### 1. Install the Gulp Edition of Pattern Lab Node

Use npm's [`install` command](https://docs.npmjs.com/cli/install) to install the Gulp Edition into a location of your choosing. In Terminal type:

    cd install/location/
    npm install edition-node-gulp

This will install the Gulp Edition into a directory called `node_modules` in `install/location/`.

## Updating Pattern Lab

To update Pattern Lab please refer to each component's GitHub repository, and the [master instructions for core](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading). The components are listed at the top of the README.

## Helpful Commands

These are some helpful commands you can use on the command line for working with Pattern Lab.

### List all of the available commands

To list all available commands type:

    gulp pl-help

### Generate Pattern Lab

To generate the front-end for Pattern Lab type:

    gulp pl-build

### Watch for changes and re-generate Pattern Lab

To watch for changes, re-generate the front-end, and server it via a BrowserSync server,  type:

    gulp pl-serve

BrowserSync should open [http://localhost:3000](http://localhost:3000) in your browser.

### Install a StarterKit

To install a specific StarterKit from GitHub type:

    npm install [starterkit-vendor/starterkit-name]

    gulp patternlab:starterkit-load --kit=[starterkit-name]
