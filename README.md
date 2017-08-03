![Pattern Lab Logo](/patternlab.png "Pattern Lab Logo")

[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.svg?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node) ![current release](https://img.shields.io/github/release/pattern-lab/patternlab-node.svg) ![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg) [![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# Pattern Lab Node Core

This repository contains the core functionality for Pattern Lab Node. Pattern Lab helps you and your team build thoughtful, pattern-driven user interfaces using atomic design principles.

[Online Demo of Pattern Lab Output](http://demo.patternlab.io/)

## Support for Pattern Lab Node

Pattern Lab Node wouldn't be what it is today without the support of the community. It will always be free and open source. Continued development is made possible in part from the support of [these wonderful project supporters](https://github.com/pattern-lab/patternlab-node/wiki/Thanks). If you want to learn more about supporting the project, visit the [Pattern Lab Node Patreon page](https://www.patreon.com/patternlab).   

**:100: Thanks for support from the following:** 

* **[Brad Frost](http://bradfrost.com/)**
* Marcos Peebles

## Installation

Pattern Lab Node Core is designed to be consumed, and by default is included as a dependency within two example [Node Editions](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node).


* [Pattern Lab/Node: Gulp Edition](https://github.com/pattern-lab/edition-node-gulp) contains info how to get started within a Gulp task running environment.
* [Pattern Lab/Node: Grunt Edition](https://github.com/pattern-lab/edition-node-grunt) contains info how to get started within a Grunt task running environment.

![Pattern Lab Ecosystem](http://patternlab.io/assets/pattern-lab-2-image_18-large-opt.png)

Core, and Editions, are part of the [Pattern Lab Ecosystem](http://patternlab.io/docs/advanced-ecosystem-overview.html). With this architecture, we encourage people to write and maintain their own editions.

## Usage

``` javascript
const config = require('./patternlab-config.json');
const patternlab = require('patternlab-node')(config);
patternlab.build(doneCallBack, boolCleanOutputDir);
```

* Read more about configuration via `patternlab-config.json`: https://github.com/pattern-lab/patternlab-node/wiki/Configuration
* The rest of the [api / command line interface](https://github.com/pattern-lab/patternlab-node/wiki/Command-Line-Interface) is documented in the wiki, and already implemented for you within [Node Editions](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node).
A [full-featured command line interface](https://github.com/pattern-lab/patternlab-node-cli) is in the works, courtesy of [@raphaelokon](https://github.com/raphaelokon).


## Development Installation / Workflow

If you are interested in [contributing to Pattern Lab](https://github.com/pattern-lab/patternlab-node/blob/master/.github/CONTRIBUTING.md), it's suggested to install an Edition of your choice and then run a local copy of this repository via [`npm link`](https://docs.npmjs.com/cli/link).

``` bash
mkdir /patternlab-node
cd /patternlab-node
git clone https://github.com/pattern-lab/patternlab-node.git
npm install
npm link
cd location/of/edition
npm link patternlab-node
```

The above is a bit verbose, but illustrates:

1. how to clone this repository to an arbitrary location
2. install all dependencies (run `npm install --dev` if your NODE_ENV is production for some reason)
3. setup the `npm link` to your local copy
4. use the local copy of patternlab-node in your edition

> Make sure to change to whichever branch you intend to hack on or test within your cloned repository, such as `dev` or `bugfix/fixes-broken-unittest`

## Upgrading

If you find yourself here and are looking to upgrade, check out how to upgrade from version to version of Pattern Lab Node here: [https://github.com/pattern-lab/patternlab-node/wiki/Upgrading](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading)

View the [ChangeLog](https://github.com/pattern-lab/patternlab-node/wiki/ChangeLog) for the latest Pattern Lab Node updates.

## Contributing

If you'd like to contribute to Pattern Lab Node, please do so! There is always a lot of ground to cover and something for your wheelhouse.

Please read the guidelines: https://github.com/pattern-lab/patternlab-node/blob/master/.github/CONTRIBUTING.md


## Core Team

* [@bmuenzenmeyer](https://github.com/bmuenzenmeyer) - Lead Maintainer
* [@geoffp](https://github.com/geoffp) - Core Contributor
* [@raphaelokon](https://github.com/raphaelokon) - CLI Contributor
* [@tburny](https://github.com/tburny) - Core Contributor

## Community

The Pattern Lab Node team uses [our gitter.im channel, pattern-lab/node](https://gitter.im/pattern-lab/node) to keep in sync, share updates, and talk shop. Please stop by to say hello or as a first place to turn if stuck. Other channels in the Pattern Lab organization can be found on gitter too.

There is also a dedicated Pattern Lab channel on the [design system slack](http://designsystems.herokuapp.com) run by [@jina](https://twitter.com/jina).

Ask or answer Pattern Lab questions on Stack Overflow: http://stackoverflow.com/questions/tagged/patternlab.io

## License

[MIT](https://github.com/pattern-lab/patternlab-node/blob/master/LICENSE)
