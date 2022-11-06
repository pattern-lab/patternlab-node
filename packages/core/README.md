![Pattern Lab Logo](https://github.com/pattern-lab/patternlab-node/raw/master/patternlab.png 'Pattern Lab Logo')

[![Continuous Integration](https://github.com/pattern-lab/patternlab-node/actions/workflows/continuous-integration.yml/badge.svg?branch=dev)](https://github.com/pattern-lab/patternlab-node/actions/workflows/continuous-integration.yml)
[![CodeQL](https://github.com/pattern-lab/patternlab-node/actions/workflows/codeql-analysis.yml/badge.svg?branch=dev)](https://github.com/pattern-lab/patternlab-node/actions/workflows/codeql-analysis.yml)
![current release](https://img.shields.io/npm/v/@pattern-lab/core.svg)
![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/pattern-lab/patternlab-node/badge.svg?branch=master)](https://coveralls.io/github/pattern-lab/patternlab-node?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![node (scoped)](https://img.shields.io/node/v/@pattern-lab/patternlab-node.svg)]()
[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# Pattern Lab Node Core

This is the core API and orchestrator of the  [Pattern Lab ecosystem](https://patternlab.io/docs/overview-of-pattern-lab's-ecosystem/).

## Installation

Pattern Lab Node can be used different ways. Editions are **example** pairings of Pattern Lab code and do not always have an upgrade path or simple means to run as a dependency within a larger project. Users wishing to be most current and have the greatest flexibility are encouraged to consume `patternlab-node` directly. Users wanting to learn more about Pattern Lab and have a tailored default experience are encouraged to start with an Edition. Both methods still expect to interact with other elements of the [Pattern Lab Ecosystem](#ecosystem).

### Direct Consumption

As of Pattern Lab Node 3.X, `patternlab-node` can run standalone, without the need for task runners like gulp or grunt.

`npm install @pattern-lab/core`

See [Usage](#usage) for more information.

### Editions

For users wanting a more pre-packaged experience several editions are available.

* [Pattern Lab/Node: Vanilla Edition](https://github.com/pattern-lab/patternlab-node/tree/dev/packages/edition-node) contains info how to get started within a pure node environment.

* [Pattern Lab/Node: Gulp Edition](https://github.com/pattern-lab/patternlab-node/tree/dev/packages/edition-node-gulp) contains info how to get started within a Gulp task running environment.


## Ecosystem

![Pattern Lab Ecosystem](https://patternlab.io/images/pattern-lab-2-image_18-large-opt.png)

Core, and Editions, are part of the [Pattern Lab Ecosystem](https://patternlab.io/docs/overview-of-pattern-lab's-ecosystem/). With this architecture, we encourage people to write and maintain their own Editions, Starterkits, and even PatternEngines.

## Usage

`@pattern-lab/core` can be required within any Node environment, taking in a configuration file at instantiation.

```javascript
const config = require('./patternlab-config.json');
const patternlab = require('@pattern-lab/core')(config);

// build, optionally watching or choosing incremental builds
patternlab.build({
  cleanPublic: true,
  watch: true,
});

// or build, watch, and then self-host
patternlab.serve({
  cleanPublic: true,
});
```

* Read more about [configuration](https://patternlab.io/docs/editing-the-configuration-options/) via `patternlab-config.json`.

* Read more about the rest of [Public API](./docs), and already implemented for you within [Editions](#editions).

* A full-featured [command line interface](https://github.com/pattern-lab/patternlab-node/tree/dev/packages/cli) is also available.

### Events

Many [events](./docs/events.md) are emitted during Pattern Lab operations, originally built to support plugins. Below is a sample, allowing users to be informed of asset or pattern changes.

```javascript
patternlab.serve(...);

patternlab.events.on('patternlab-asset-change', (data) => {
  console.log(data); // {file: 'path/to/file.css', dest: 'path/to/destination'}
});

patternlab.events.on('patternlab-pattern-change', (data) => {
  console.log(data); // {file: 'path/to/file.ext'}
});

patternlab.events.on('patternlab-global-change', (data) => {
  console.log(data); // {file: 'path/to/file.ext'}
});
```

## Development Installation / Workflow

If you are interested in contributing to Pattern Lab, please do take some time to learn how we [develop locally](https://github.com/pattern-lab/patternlab-node/blob/master/.github/CONTRIBUTING.md#developing-locally) within the contribution guidelines.
## Upgrading

If you find yourself here and are looking to upgrade, check out how to upgrade from version to version of Pattern Lab Node here: [https://github.com/pattern-lab/patternlab-node/wiki/Upgrading](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading)

View the [latest releases](https://github.com/pattern-lab/patternlab-node/releases) for comprehensive changelogs.

## Contributing

If you'd like to contribute to Pattern Lab Node, please do so! There is always a lot of ground to cover and something for your wheelhouse.

Please read the [contribution guidelines](https://github.com/pattern-lab/patternlab-node/blob/master/.github/CONTRIBUTING.md).

## Core Team

* [@geoffp](https://github.com/geoffp) - Core Contributor
* [@tburny](https://github.com/tburny) - Core Contributor

## Community

The Pattern Lab Node team uses [our gitter.im channel, pattern-lab/node](https://gitter.im/pattern-lab/node) to keep in sync, share updates, and talk shop. Please stop by to say hello or as a first place to turn if stuck. Other channels in the Pattern Lab organization can be found on gitter too.

There is also a dedicated Pattern Lab channel on the [design system slack](http://designsystems.herokuapp.com) run by [@jina](https://twitter.com/jina).

Ask or answer Pattern Lab questions on Stack Overflow: https://stackoverflow.com/questions/tagged/patternlab.io

## License

[MIT](https://github.com/pattern-lab/patternlab-node/blob/master/LICENSE)
