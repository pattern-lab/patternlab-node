[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.png?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node) ![current release](https://img.shields.io/github/release/pattern-lab/patternlab-node.svg) ![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg) [![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# Pattern Lab Node Core

This repository contains the core functionality for Pattern Lab Node. Pattern Lab Core is designed to be included as a dependency within [Node Editions](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node).
If this looks **REALLY DIFFERENT** from what you expected, check out the [ChangeLog](https://github.com/pattern-lab/patternlab-node/wiki/ChangeLog).

* [Pattern Lab/Node: Gulp Edition](https://github.com/pattern-lab/edition-node-gulp) contains info how to get started within a Gulp task running environment.
* [Pattern Lab/Node: Grunt Edition](https://github.com/pattern-lab/edition-node-grunt) contains info how to get started within a Grunt task running environment.

## Core Team

* [@bmuenzenmeyer](https://github.com/bmuenzenmeyer) - Lead Maintainer
* [@geoffp](https://github.com/geoffp) - Core Contributor

## Upgrading

If you find yourself here and are looking to upgrade, check out how to upgrade from version to version of Pattern Lab Node here: [https://github.com/pattern-lab/patternlab-node/wiki/Upgrading](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading)

## Command Line Interface

The [command line interface](https://github.com/pattern-lab/patternlab-node/wiki/Command-Line-Interface) is documented in the wiki, and already implemented for you within [Node Editions](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node).

## Contributing

If you'd like to contribute to Pattern Lab Node, please do so! There is always a lot of ground to cover and something for your wheelhouse.

No pull request is too small. Check out any [up for grabs issues](https://github.com/pattern-lab/patternlab-node/labels/up%20for%20grabs) as a good way to get your feet wet, or add some more unit tests.

## Guidelines
1. Please keep your pull requests concise and limited to **ONE** substantive change at a time. This makes reviewing and testing so much easier.
2. _ALWAYS_ submit pull requests against the [dev branch](https://github.com/pattern-lab/patternlab-node/tree/dev). If this does not occur, I will first, try to redirect you gently, second, port over your contribution manually if time allows, and/or third, close your pull request. If you have a major feature to stabilize over time, talk to @bmuenzenmeyer about making a dedicated `feature-branch`
3. If you can, add some unit tests using the existing patterns in the `./test` directory
4. To help hack on core from an edition, read [this wiki page](https://github.com/pattern-lab/patternlab-node/wiki/Running-an-Edition-Against-Local-Core)

## Coding style
Two files combine within the project to define and maintain our coding style.

* The `.editorconfig` controls spaces / tabs within supported editors. Check out their [site](http://editorconfig.org/).
* The `.eslintrc` defines our javascript standards. Some editors will evaluate this real-time - otherwise it's run using `grunt|gulp build`

## Gitter

The Pattern Lab Node team uses [our gitter.im channel, pattern-lab/node](https://gitter.im/pattern-lab/node) to keep in sync, share updates, and talk shop. Please stop by to say hello or as a first place to turn if stuck. Other channels in the Pattern Lab organization can be found on gitter too.
