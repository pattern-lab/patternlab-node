# Contributing to the Default Pattern Lab Front End

If you'd like to contribute to the default front end for Pattern Lab Node, please do so! There is always a lot of ground to cover and something for your wheelhouse.

## Developing Locally

The best way to make changes to this repo and test them is through your existing edition.

### Node

* Fork this repository on Github.
* Create a new branch in your fork and push your changes in that fork.
* `npm install`
* `npm link`
* `cd /path/to/your/edition`
* `npm link @pattern-lab/uikit-workshop`

## Making Changes

To make changes **always edit files in `src/`**. To make sure that these changes are reflected in the front-end and `dist/` folder run the following:

    npm run build

To watch for changes you can use:

    npm run watch

At this point changes to the static assets should compile to the correct locations in the project as well as `dist/`.

## Guidelines

* Pattern Lab uses a standard [git flow model](http://nvie.com/posts/a-successful-git-branching-model/) unless otherwise noted in a repository. The `develop` branch is not considered stable. Tags and releases are cut from the `master` branch
* _USUALLY_ submit pull requests against the [develop branch](https://github.com/pattern-lab/uikit-workshop/tree/dev). If you have a major feature to stabilize over time, open an issue about making a dedicated `feature-branch` off of `develop`
* Please keep your pull requests concise and limited to **ONE** substantive change at a time. This makes reviewing and testing so much easier.
* Commits should reference the issue you are adressing.
* Large enhancements should begin with opening an issue. This will result in a more systematic way for us to review your contribution and determine if a [specifcation discussion](https://github.com/pattern-lab/the-spec/issues) needs to occur.

## Coding style

* The `.editorconfig` controls spaces / tabs within supported editors. Check out their [site](http://editorconfig.org/).
