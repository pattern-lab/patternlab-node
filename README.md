![Pattern Lab Logo](/patternlab.png 'Pattern Lab Logo')

[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.svg?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node) ![current release](https://img.shields.io/npm/v/@pattern-lab/patternlab-node.svg) ![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg) [![Coverage Status](https://coveralls.io/repos/github/pattern-lab/patternlab-node/badge.svg?branch=master)](https://coveralls.io/github/pattern-lab/patternlab-node?branch=master) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

# Pattern Lab Node Core

This repository contains the core functionality for Pattern Lab Node. Pattern Lab helps you and your team build thoughtful, pattern-driven user interfaces using atomic design principles.

[Online Demo of Pattern Lab Output](http://demo.patternlab.io/)

## Support for Pattern Lab Node

Pattern Lab Node wouldn't be what it is today without the support of the community. It will always be free and open source. Continued development is made possible in part from the support of [these wonderful project supporters](https://github.com/pattern-lab/patternlab-node/wiki/Thanks). If you want to learn more about supporting the project, visit the [Pattern Lab Node Patreon page](https://www.patreon.com/patternlab).

**:100: Thanks for support from the following:**

* **[Brad Frost](http://bradfrost.com/)**
* [Marcos Peebles](https://twitter.com/marcospeebles)
* [Susan Simkins](https://twitter.com/susanmsimkins)
* [Wilfred Nas](https://twitter.com/wnas)

## Installation

Pattern Lab Node can be used different ways. Editions are **example** pairings of Pattern Lab code and do not always have an upgrade path or simple means to run as a dependency within a larger project. Users wishing to be most current and have the greatest flexibility are encouraged to consume `patternlab-node` directly. Users wanting to learn more about Pattern Lab and have a tailored default experience are encouraged to start with an Edition. Both methods still expect to interact with other elements of the [Pattern Lab Ecosystem](#ecosystem).

### Direct Consumption

As of Pattern Lab Node 3.X, `patternlab-node` can run standalone, without the need for task runners like gulp or grunt.

`npm install @pattern-lab/patternlab-node`

See [Usage](#usage) for more information.

### Editions

For users wanting a more pre-packaged experience several editions are available.

* [Pattern Lab/Node: Gulp Edition](https://github.com/pattern-lab/edition-node-gulp) contains info how to get started within a Gulp task running environment.
* [Pattern Lab/Node: Grunt Edition](https://github.com/pattern-lab/edition-node-grunt) contains info how to get started within a Grunt task running environment.
* [Pattern Lab/Node: Vanilla Edition](https://github.com/pattern-lab/edition-node) contains info how to get started within a pure node environment.
* [Pattern Lab/Node: Webpack Edition](https://github.com/Comcast/patternlab-edition-node-webpack) contains info how to get started within a webpack environment.
  > Thanks to the team at Comcast for open-sourcing this stellar work!

## Ecosystem

![Pattern Lab Ecosystem](http://patternlab.io/assets/pattern-lab-2-image_18-large-opt.png)

Core, and Editions, are part of the [Pattern Lab Ecosystem](http://patternlab.io/docs/advanced-ecosystem-overview.html). With this architecture, we encourage people to write and maintain their own Editions, Starterkits, and even PatternEngines.

## Usage

`patternlab-node` can be required within any Node environment, taking in a configuration file at instantiation.

```javascript
const config = require('./patternlab-config.json');
const patternlab = require('patternlab-node')(config);

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

* Read more about [configuration](http://patternlab.io/docs/advanced-config-options.html#node) via `patternlab-config.json`.

* Read more about the rest of [Public API](https://github.com/pattern-lab/patternlab-node/wiki/Public-API), and already implemented for you within [Editions](#editions).

* A full-featured [command line interface](https://github.com/pattern-lab/patternlab-node-cli) is also available courtesy of [@raphaelokon](https://github.com/raphaelokon).

### Events

Many [events](https://github.com/pattern-lab/patternlab-node/wiki/Creating-Plugins#events) are emitted during Pattern Lab operations, originally built to support plugins. Below is a sample, allowing users to be informed of asset or pattern changes.

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

If you are interested in [contributing to Pattern Lab](https://github.com/pattern-lab/patternlab-node/blob/master/.github/CONTRIBUTING.md), it's suggested to install an Edition of your choice and then run a local copy of this repository via [`npm link`](https://docs.npmjs.com/cli/link).

```bash
mkdir /patternlab-node
cd /patternlab-node
git clone https://github.com/pattern-lab/patternlab-node.git
npm install
npm link
cd location/of/editionOrSourceAndConfig
npm link patternlab-node
```

The above is a bit verbose, but illustrates:

1. how to clone this repository to an arbitrary location
2. install all dependencies (run `npm install --dev` if your NODE_ENV is production for some reason)
3. setup the `npm link` to your local copy
4. use the local copy of patternlab-node in your edition / working directory

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
