<p align="center">
  <img src='/patternlab.png' height="300" alt="Pattern Lab Logo" />
</p>

# Pattern Lab

This monorepo contains the core of Pattern Lab / Node and all related engines, UI kits, plugins and utilities. Pattern Lab helps you and your team build thoughtful, pattern-driven user interfaces using atomic design principles.

If you'd like to see what a front-end project built with Pattern Lab looks like, check out this [online demo of Pattern Lab output](http://demo.patternlab.io/).

[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.svg?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node)
![current release](https://img.shields.io/npm/v/@pattern-lab/core.svg)
![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/pattern-lab/patternlab-node/badge.svg?branch=master)](https://coveralls.io/github/pattern-lab/patternlab-node?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![node (scoped)](https://img.shields.io/node/v/@pattern-lab/patternlab-node.svg)]()
[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

## Using Pattern Lab

### Installation

Installation is still in flux due to the monorepo transition. Bear with us as we figure this out.

## Support for Pattern Lab

Pattern Lab / Node wouldn't be what it is today without the support of the community. It will always be free and open source. Continued development is made possible in part from the support of [these wonderful project supporters](https://github.com/pattern-lab/patternlab-node/wiki/Thanks). If you want to learn more about supporting the project, visit the [Pattern Lab / Node Patreon page](https://www.patreon.com/patternlab).

**:100: Thanks for support from the following:**

* **[Brad Frost](http://bradfrost.com/)**
* [Marcos Peebles](https://twitter.com/marcospeebles)
* [Susan Simkins](https://twitter.com/susanmsimkins)
* [Wilfred Nas](https://twitter.com/wnas)

## Contributing

### Prerequisites

To get started, you'll need Node 8 or higher. Managing Node with `nvm` is recommended.

### Testing

#### Unit tests

Unit tests are currently in `packages/core`. We use Tap

#### Cold start testing

To ensure that developers can bootstrap the repo from a fresh clone, do this in your working copy:

```sh
git reset --hard && git clean -dfx && npm install && npm run bootstrap
```

This ensures that any changes you've made will still result in a clean and functional developer experience. **Note**: be sure you've committed any outstanding work before doing this -- it will blow away whatever's still outstanding, including anything staged but not commited.
