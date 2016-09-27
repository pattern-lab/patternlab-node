![license](https://img.shields.io/github/license/pattern-lab/plugin-node-tab.svg)
[![npm](https://img.shields.io/npm/v/plugin-node-tab.svg)](https://www.npmjs.com/package/plugin-node-tab)
[![Gitter](https://img.shields.io/gitter/room/pattern-lab/php.svg)](https://gitter.im/pattern-lab/php)

# Tab Plugin for Pattern Lab Node

The Tab Plugin allows Pattern Lab Node users to see sibling files next to a pattern in the filesystem, displaying them as additional tabs alongside the template and HTML tabs in both the Style Guide frontend and the single-pattern info modal.

## Installation

To add the Tab Plugin to your project using [npm](http://npmjs.com/) type:

    npm install plugin-node-tab --save

Or add it directly to your project's `package.json` file and run `npm install`

Post installation, the plugin will prompt you for what filetypes you want to add tabs for.

```
$ Specify filetype(s) to create a tab for. Separate multiple filetypes with a space, pipe or comma. Example: js css >>>
```

## Expected Structure

With the Tab Plugin installed, you can now accompany pattern template files with the file types of your choice and expect Pattern Lab to show them as tabs. The file structure would be similar to that of `pattern.json` or `pattern.md` files, except that it will be `pattern.<<type>>`.

For example, if we added a` css` tab:

```
./_patterns/foo/bar
├── pattern.mustache (the pattern template)
├── pattern.md (optional pattern-specific documentation and metadata)
├── pattern.json (optional pattern-specific data)
└── pattern.css (the tab you added.)
```

## Enabling / Disabling the Plugin

After install, you may manually enable or disable the plugin by removing it from the `patternlab-config.json` file. Installation added a key called `plugin-node-tab` to it. In the future this will be possible via CLI.
