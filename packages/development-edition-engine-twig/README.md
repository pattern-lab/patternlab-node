![Pattern Lab Logo](/patternlab.png "Pattern Lab Logo")

# Pattern Lab Node - Development Edition Engine Twig

_here be dragons_

This Development Edition is a variant of [Edition Node](https://github.com/pattern-lab/patternlab-node/tree/master/packages/edition-node) for convience purposes only, loaded with the Twig Engine. The goals of this Development Edition are two-fold:

* Develop the [Twig Engine](https://github.com/pattern-lab/patternlab-node/tree/master/packages/engine-twig)
* Build and test against Twig pattern tree

> Development Editions of Pattern Lab provide the ability to work on and commit changes to select packages within the overall Pattern Lab [ecosystem](http://patternlab.io/docs/advanced-ecosystem-overview.html). This Edition is NOT stable.


## Working on Pattern Lab's UI Locally

### Step 1: Install Dependencies
Run the following in the root of the Pattern Lab repo:

```
yarn run setup
```

### Step 2
Finally, go back into this folder, `cd packages/development-edition-engine-twig`, and start up the local dev server which watches UIKit and the local Pattern Lab instance for changes, live reloads, etc by running `yarn dev`
