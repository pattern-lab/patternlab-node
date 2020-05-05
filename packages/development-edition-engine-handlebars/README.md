![Pattern Lab Logo](/patternlab.png "Pattern Lab Logo")

# Pattern Lab Node - Development Edition Engine Handlebars

_here be dragons_

This Development Edition is a variant of [Edition Node](https://github.com/pattern-lab/patternlab-node/tree/master/packages/edition-node) for convience purposes only, loaded with the Handlebars Engine. The goals of this Development Edition are two-fold:

* Develop the [Handlebars Engine](https://github.com/pattern-lab/patternlab-node/tree/master/packages/engine-handlebars)
* Build and test against Handlebars pattern tree

> Development Editions of Pattern Lab provide the ability to work on and commit changes to select packages within the overall Pattern Lab [ecosystem](https://patternlab.io/docs/overview-of-pattern-lab's-ecosystem/). This Edition is NOT stable.


## Working on Pattern Lab's UI Locally

### Step 1: Install Dependencies
Run the following in the root of the Pattern Lab repo:

```
yarn run setup
```

### Step 2 (Optional)
If you want to build using a fuller set of examples than what comes with this default Handlebars demo, run `yarn run preview:hbs`. Otherwise skip to step 3.

### Step 3
Finally, go back into this folder, `cd packages/development-edition-engine-handlebars`, and start up the local dev server which watches UIKit and the local Pattern Lab instance for changes, live reloads, etc by running `yarn dev`
