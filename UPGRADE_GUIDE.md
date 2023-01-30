# Upgrading Pattern Lab Node

To upgrade the Node version of Pattern Lab do the following:

## Version 6 instructions

- Ensure that you're using at least Node.js version 14, to which we've upgraded to with [!1430](https://github.com/pattern-lab/patternlab-node/pull/1430)
- Please explicitly configure you're used engine within `patternlab-config.json` as described within the documentations section https://patternlab.io/docs/editing-the-configuration-options/#heading-engines. The previous way of scanning `node_modules` folder for pattern engines is deprecated and will be removed with version 7.

If you haven't migrated from `mustache` to `handlebars` engine and templates so far, now would be a good time as `mustache` has been replaced by `handlebars` as the default template language with version 5 of pattern lab, and `mustache` might get removed sooner rather than later.
