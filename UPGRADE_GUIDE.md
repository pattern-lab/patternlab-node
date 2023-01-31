# Upgrading Pattern Lab Node

To upgrade the Node version of Pattern Lab do the following:

## Version 6 instructions

- Ensure that you're using at least Node.js version 14, to which we've upgraded to with [!1430](https://github.com/pattern-lab/patternlab-node/pull/1430)
- If you haven't migrated from `mustache` to `handlebars` engine and templates so far, now would be a good time as `mustache` has been replaced by `handlebars` as the default template language with version 5 of pattern lab, and `mustache` might get removed sooner rather than later. To make a long story short, `handlebars` is mostly compatible, but more mature than `mustache`, so a migration shouldn't be too hard, and even beneficial. Additionally using `mustache` templates most likely won't work anymore starting with this new major version 6 due to these potentially breaking changes for `mustache` usage:
  - Removed `styleModifiers` with [!1452](https://github.com/pattern-lab/patternlab-node/pull/1452), that haven't been mentioned in the documentation any more anyhow.
  - replaced `hogan.js` by `handlebars` rendering [!1456](https://github.com/pattern-lab/patternlab-node/pull/1456), that would expect the usage of block helpers instead of typical mustache iterations over objects.
- Please explicitly configure your used engine within `patternlab-config.json` as described within the documentations section https://patternlab.io/docs/editing-the-configuration-options/#heading-engines. The previous way of scanning `node_modules` folder for pattern engines is deprecated and will be removed with version 7.

