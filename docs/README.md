# Pattern Lab Node API

[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

## [Installation](https://github.com/pattern-lab/patternlab-node#installation)

## Usage

`patternlab-node` can be required within any Node environment, taking in a configuration file at instantiation.

```javascript
const config = require('./patternlab-config.json');
const patternlab = require('patternlab-node')(config);
```

## Events

Pattern Lab emits numerous [events](https://github.com/pattern-lab/patternlab-node/tree/master/docs/events.md).

## Functions

Many of these functions are exposed to users within [Editions](https://github.com/pattern-lab/patternlab-node#editions), but [direct consumption](https://github.com/pattern-lab/patternlab-node#direct-consumption) is also encouraged.

## `getDefaultConfig()` ⇒ <code>object</code>

Returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.

**Returns**: <code>object</code> - Returns the object representation of the `patternlab-config.json`

## `version()` ⇒ <code>void</code>

Logs current version to standard output

**Returns**: <code>void</code> - current patternlab-node version as defined in `package.json`

## `v()` ⇒ <code>string</code>

Returns current version

**Returns**: <code>string</code> - current patternlab-node version as defined in `package.json`, as string

## `build(options)` ⇒ <code>Promise</code>

Builds patterns, copies assets, and constructs user interface

**Returns**: <code>Promise</code> - a promise fulfilled when build is complete

| Param               | Type                | Description                                                                                     |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| options             | <code>object</code> | an object used to control build behavior                                                        |
| options.cleanPublic | <code>bool</code>   | whether or not to delete the configured output location (usually `public/`) before build        |
| options.data        | <code>object</code> | additional data to be merged with global data prior to build                                    |
| options.watch       | <code>bool</code>   | whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild |

## `getDefaultConfig()` ⇒ <code>object</code>

Returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.

**Returns**: <code>object</code> - Returns the object representation of the `patternlab-config.json`

## `getSupportedTemplateExtensions()` ⇒ <code>Array.&lt;string&gt;</code>

Returns all file extensions supported by installed PatternEngines

**Returns**: <code>Array.&lt;string&gt;</code> - all supported file extensions

## `help()` ⇒ <code>void</code>

Logs usage to standard output

**Returns**: <code>void</code> - pattern lab API usage, as console output

## `installplugin(pluginName)` ⇒ <code>void</code>

Installs plugin already available via `node_modules/`

| Param      | Type                | Description    |
| ---------- | ------------------- | -------------- |
| pluginName | <code>string</code> | name of plugin |

## `liststarterkits()` ⇒ <code>Promise</code>

Fetches starterkit repositories from pattern-lab github org that contain 'starterkit' in their name

**Returns**: <code>Promise</code> - Returns an Array<{name,url}> for the starterkit repos

## `loadstarterkit(starterkitName, clean)` ⇒ <code>void</code>

Loads starterkit already available via `node_modules/`

| Param          | Type                 | Description                                              |
| -------------- | -------------------- | -------------------------------------------------------- |
| starterkitName | <code>string</code>  | name of starterkit                                       |
| clean          | <code>boolean</code> | whether or not to delete contents of source/ before load |

## `patternsonly(options)` ⇒ <code>Promise</code>

Builds patterns only, leaving existing user interface files intact

**Returns**: <code>Promise</code> - a promise fulfilled when build is complete

| Param               | Type                | Description                                                                              |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| options             | <code>object</code> | an object used to control build behavior                                                 |
| options.cleanPublic | <code>bool</code>   | whether or not to delete the configured output location (usually `public/`) before build |
| options.data        | <code>object</code> | additional data to be merged with global data prior to build                             |

## `serve(options)` ⇒ <code>Promise</code>

Build patterns, copies assets, and constructs user interface. Watches configured `source/` directories, and serves all output locally

**Returns**: <code>Promise</code> - a promise fulfilled when build is complete

| Param               | Type                | Description                                                                                                                     |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| options             | <code>object</code> | an object used to control build behavior                                                                                        |
| options.cleanPublic | <code>bool</code>   | whether or not to delete the configured output location (usually `public/`) before build                                        |
| options.data        | <code>object</code> | additional data to be merged with global data prior to build                                                                    |
| options.watch       | <code>bool</code>   | **ALWAYS OVERRIDDEN to `true`** whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild |

---

[Pattern Lab](http://patternlab.io) Node is [MIT Licensed](https://github.com/pattern-lab/patternlab-node/blob/master/LICENSE)
