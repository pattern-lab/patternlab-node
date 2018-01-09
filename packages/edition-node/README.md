![Pattern Lab Logo](/patternlab.png "Pattern Lab Logo")

![current release](https://img.shields.io/github/release/pattern-lab/edition-node.svg) ![license](https://img.shields.io/github/license/pattern-lab/edition-node.svg)[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# Pattern Lab Node

The pure wrapper around [Pattern Lab Node Core](https://github.com/pattern-lab/patternlab-node), the default pattern engine, and supporting frontend assets.

[Online Demo of Pattern Lab Output](http://demo.patternlab.io/)

## Packaged Components

This Edition comes with the following components:

* `pattern-lab/patternlab-node`: [GitHub](https://github.com/pattern-lab/patternlab-node) | [npm](https://www.npmjs.com/package/@pattern-lab/patternlab-node)
* `pattern-lab/patternengine-node-mustache`: [GitHub](https://github.com/pattern-lab/patternengine-node-mustache) | [npm](https://www.npmjs.com/package/@pattern-lab/patternengine-node-mustache)
* `pattern-lab/styleguidekit-assets-default`: [GitHub](https://github.com/pattern-lab/styleguidekit-assets-default) | [npm](https://www.npmjs.com/package/@pattern-lab/styleguidekit-assets-default)
* `pattern-lab/styleguidekit-mustache-default`: [GitHub](https://github.com/pattern-lab/styleguidekit-mustache-default) | [npm](https://www.npmjs.com/package/@pattern-lab/styleguidekit-mustache-default)

## Prerequisites

The Pattern Lab Node uses [Node](https://nodejs.org) for core processing and [npm](https://www.npmjs.com/) to manage project dependencies. You can follow the directions for [installing Node](https://nodejs.org/en/download/) on the Node website if you haven't done so already. Installation of Node will include npm.

## Installing

Pattern Lab Node can be used different ways. Editions lilke this one are **example** pairings of Pattern Lab code and do not always have an upgrade path or simple means to run as a dependency within a larger project. Users wishing to be most current and have the greatest flexibility are encouraged to consume `patternlab-node` directly. Users wanting to learn more about Pattern Lab and have a tailored default experience are encouraged to start with an Edition. Both methods still expect to interact with other elements of the [Pattern Lab Ecosystem](https://github.com/pattern-lab/patternlab-node#ecosystem).

As an edition, the simplest installation sequence is to clone this repository.

``` bash
mkdir newApp && cd newApp
git clone https://github.com/pattern-lab/edition-node.git
npm install
```

## Getting Started

This edition comes pre-packaged with a couple simple scripts. Extend them as needed.

**build** patterns, copy assets, and construct ui

``` bash
npm run build
```

build patterns, copy assets, and construct ui, watch source files, and **serve** locally

``` bash
npm run serve
```

logs Pattern Lab Node usage and **help** content

``` bash
npm run help
```

To interact further with Pattern Lab Node, such as to install plugins or starterkits, it's suggested to incorporate the [Pattern Lab Node Command Line Interface](https://github.com/pattern-lab/patternlab-node-cli) or learn more about the [core API](https://github.com/pattern-lab/patternlab-node#usage).

## Updating Pattern Lab

To update Pattern Lab please refer to each component's GitHub repository, and the [master instructions for core](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading). The components are listed at the top of the README.
