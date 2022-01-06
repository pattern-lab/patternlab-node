![license](https://img.shields.io/github/license/pattern-lab/patternlab-node.svg)
![current release](https://img.shields.io/npm/v/@pattern-lab/uikit-workshop.svg)
[![Gitter](https://img.shields.io/gitter/room/pattern-lab/frontend-viewer.svg)](https://gitter.im/pattern-lab/frontend-viewer)

# UIKit Default

Front-end assets and templates for the default Pattern Lab [workshop](https://bradfrost.com/blog/post/the-workshop-and-the-storefront/) view.

This code is responsible for creating Pattern Lab's default workshop UI look, feel, and functionality.

## Installation

### Node

Pattern Lab Node uses [npm](https://www.npmjs.com/) to manage project dependencies. To install the default static assets run:

    npm install @pattern-lab/uikit-workshop

## Development Requirements

In order to modify these assets you need to install the following:

* [Node.js](https://nodejs.org/) and NPM
* [Bower](https://bower.io/)
* [Ruby Sass](https://sass-lang.com/install)

## Development Set-up

Read the [contribution guidelines](https://github.com/pattern-lab/patternlab-node/blob/master/packages/uikit-workshop/.github/CONTRIBUTING.md)


## Working on Pattern Lab's UI Locally

### Step 1: Install Dependencies
Run the following in the root of the Pattern Lab repo:

```
yarn run setup
```

### Step 2 (Optional)
If you want to build using a fuller set of examples than what comes with the default Handlebars demo, run `yarn run preview:hbs`. Otherwise skip to step 3.

### Step 3
Finally, go into the `packages/development-edition-engine-handlebars` or `packages/edition-twig` folder and start up the local dev server which watches UIKit and the local Pattern Lab instance for changes, live reloads, etc by running `yarn dev`

```
cd packages/development-edition-engine-handlebars
yarn dev
```
