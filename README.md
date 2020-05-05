<p align="center">
  <img src='/patternlab.png' width="300" alt="Pattern Lab Logo" style="max-width: 100%;" />
</p>

# Pattern Lab

This monorepo contains the core of Pattern Lab / Node and all related engines, UI kits, plugins and utilities. Pattern Lab helps you and your team build thoughtful, pattern-driven user interfaces using atomic design principles.

If you'd like to see what a front-end project built with Pattern Lab looks like, check out this [online demo of Pattern Lab output](https://demo.patternlab.io/).

[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node.svg?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node)
![current release](https://img.shields.io/npm/v/@pattern-lab/core.svg)
![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg)
[![Coverage Status](https://coveralls.io/repos/github/pattern-lab/patternlab-node/badge.svg?branch=master)](https://coveralls.io/github/pattern-lab/patternlab-node?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![node (scoped)](https://img.shields.io/node/v/@pattern-lab/patternlab-node.svg)]()
[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

Docs @ [![Netlify Status](https://api.netlify.com/api/v1/badges/d454dbde-02c5-4bd4-8393-4ab75e862b03/deploy-status)](https://app.netlify.com/sites/patternlab-docs-preview/deploys)

Pattern Lab Preview @ [![Netlify Status](https://api.netlify.com/api/v1/badges/a6db1666-cb4f-4d26-82d4-9d88d875f286/deploy-status)](https://app.netlify.com/sites/patternlab-handlebars-preview/deploys)

## Using Pattern Lab

Refer to the [core usage guidelines](https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/README.md#usage)

### Installation

As of Pattern Lab Node 3.0.0, installation of [Editions](https://patternlab.io/docs/overview-of-pattern-lab's-ecosystem/) is accomplished via the command line interface.

The below assumes a new directory and project is required. This is likely what you want to do if starting from scratch. You could also run this within an existing project. The CLI will ask you for the installation location.

1. Open a terminal window and following along below:
    ```bash
    mkdir new-project
    cd new-project
    npm create pattern-lab
    ```
    > If you get an error stating that `npx` is not installed, ensure you are on `npm 5.2.0` or later by running `npm -v` or install it globally with `npm install -g npx`. [Learn more about npx.](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)
1. Follow the on-screen prompts to choose your Edition and a Starterkit should you want one.
  - If you chose `edition-node`, new commands in the "scripts" will be added in your `package.json`.
  - If you chose `edition-node-gulp`, a `gulpfile.js` will be added to your project.

  > Notice that `@pattern-lab/cli` was installed as a depdendency. Learn how to further [use the cli in your own project](https://github.com/pattern-lab/patternlab-node/blob/dev/packages/cli/readme.md#configuring-your-project-to-use-the-cli).


## Ecosystem

![Pattern Lab Ecosystem](https://patternlab.io/images/pattern-lab-2-image_18-large-opt.png)

Core, and Editions, are part of the [Pattern Lab Ecosystem](https://patternlab.io/docs/overview-of-pattern-lab's-ecosystem/). With this architecture, we encourage people to write and maintain their own Editions, Starterkits, and even PatternEngines.

## Changelog

[Each package within this monorepo](https://github.com/pattern-lab/patternlab-node/tree/master/packages) has its own changelog. Below are the main ones to watch:

* [@pattern-lab/core changelog ](https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/CHANGELOG.md)
* [@pattern-lab/cli changelog ](https://github.com/pattern-lab/patternlab-node/blob/master/packages/cli/CHANGELOG.md)

## Support for Pattern Lab

Pattern Lab / Node wouldn't be what it is today without the support of the community. It will always be free and open source. Continued development is made possible in part from the support of [these wonderful project supporters](https://github.com/pattern-lab/patternlab-node/wiki/Thanks). If you want to learn more about supporting the project, visit the [Pattern Lab / Node Patreon page](https://www.patreon.com/patternlab).

**:100: Thanks for support from the following:**

* **[Brad Frost](http://bradfrost.com/)**
* Jan Ditze
* [Marcos Peebles](https://twitter.com/marcospeebles)
* [Maximilian Franzke](https://twitter.com/maedmaex)
* [Susan Simkins](https://twitter.com/susanmsimkins)

## Contributing

Refer to the [contribution guidelines](https://github.com/pattern-lab/patternlab-node/blob/master/.github/CONTRIBUTING.md).
