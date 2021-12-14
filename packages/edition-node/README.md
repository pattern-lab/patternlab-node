![Pattern Lab Logo](https://github.com/pattern-lab/patternlab-node/raw/master/patternlab.png 'Pattern Lab Logo')
![current release](https://img.shields.io/npm/v/@pattern-lab/edition-node.svg)
![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg)
[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# Pattern Lab - Node Edition

The pure wrapper around [Pattern Lab Node Core](https://github.com/pattern-lab/patternlab-node/tree/master/packages/core), the default pattern engine, and supporting frontend assets.

[Online Demo of Pattern Lab Output](https://demo.patternlab.io/)

## Packaged Components

This Edition comes with the following components:

* `@pattern-lab/core`: [GitHub](https://github.com/pattern-lab/patternlab-node/tree/master/packages/core) | [npm](https://www.npmjs.com/package/@pattern-lab/core)
* `@pattern-lab/cli`: [GitHub](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli) | [npm](https://www.npmjs.com/package/@pattern-lab/cli)
* `@pattern-lab/engine-handlebars`: [GitHub](https://github.com/pattern-lab/patternlab-node/tree/master/packages/engine-handlebars) | [npm](https://www.npmjs.com/package/@pattern-lab/engine-handlebars)
* `@pattern-lab/uikit-workshop`: [GitHub](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop) | [npm](https://www.npmjs.com/package/@pattern-lab/uikit-workshop)

## Prerequisites

This Edition uses [Node](https://nodejs.org) for core processing and [npm](https://www.npmjs.com/) to manage project dependencies. You can follow the directions for [installing Node](https://nodejs.org/en/download/) on the Node website if you haven't done so already. Installation of Node will include npm.

## Installing

Pattern Lab Node can be used different ways. Editions lilke this one are **example** pairings of Pattern Lab code and do not always have an upgrade path or simple means to run as a dependency within a larger project. Users wishing to be most current and have the greatest flexibility are encouraged to consume `core` directly. Users wanting to learn more about Pattern Lab and have a tailored default experience are encouraged to start with an Edition. Both methods still expect to interact with other elements of the [Pattern Lab Ecosystem](https://github.com/pattern-lab/patternlab-node/tree/master/packages/core#ecosystem).

Read the [installation instructions](https://github.com/pattern-lab/patternlab-node/tree/master#installation).

## Getting Started

This edition comes pre-packaged with a couple simple scripts. Extend them as needed.

**build** patterns, copy assets, and construct ui

```bash
npm run build
```

build patterns, copy assets, and construct ui, watch source files, and **serve** locally

```bash
npm run serve
```

logs Pattern Lab Node usage and **help** content

```bash
npm run help
```

To interact further with Pattern Lab Node, such as to install plugins or starterkits, it's suggested to incorporate the [Pattern Lab Node Command Line Interface](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli) or learn more about the [core API](https://github.com/pattern-lab/patternlab-node/tree/master/packages/core#usage).

## Updating Pattern Lab

To update Pattern Lab please refer to each component's GitHub repository, and the [master instructions for core](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading). The components are listed at the top of the README.
