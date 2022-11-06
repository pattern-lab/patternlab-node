# Pattern Lab Node API

[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

## [Installation](https://github.com/pattern-lab/patternlab-node#installation)

## Usage

`patternlab-node` can be required within any Node environment, taking in a configuration file at instantiation.

``` javascript
const config = require('./patternlab-config.json');
const patternlab = require('@pattern-lab/core')(config);
```

<a name="patternlab"></a>

## `patternlab` : <code>object</code>
Build thoughtful, pattern-driven user interfaces using atomic design principles.
Many of these functions are exposed to users within [Editions](https://github.com/pattern-lab/patternlab-node#editions), but [direct consumption](https://github.com/pattern-lab/patternlab-node#direct-consumption) is also encouraged.

**Kind**: global namespace
**See**

- [patternlab.io](patternlab.io) for more documentation.
- [https://github.com/pattern-lab/patternlab-node](https://github.com/pattern-lab/patternlab-node) for code, issues, and releases

**License**: MIT

* [`patternlab`](#patternlab) : <code>object</code>
    * _instance_
        * [`.version`](#patternlab+version) ⇒ <code>string</code>
        * [`.build`](#patternlab+build) ⇒ <code>Promise</code>
        * [`.getDefaultConfig`](#patternlab+getDefaultConfig) ⇒ <code>object</code>
        * [`.getSupportedTemplateExtensions`](#patternlab+getSupportedTemplateExtensions) ⇒ <code>Array.&lt;string&gt;</code>
        * [`.liststarterkits`](#patternlab+liststarterkits) ⇒ <code>Promise</code>
        * [`.loadstarterkit`](#patternlab+loadstarterkit) ⇒ <code>void</code>
        * [`.patternsonly`](#patternlab+patternsonly) ⇒ <code>Promise</code>
    * _static_
        * [`.getDefaultConfig`](#patternlab.getDefaultConfig) ⇒ <code>object</code>
        * [`.getVersion`](#patternlab.getVersion) ⇒ <code>string</code>
        * [`.server`](#patternlab.server) : <code>object</code>
            * [`.serve(options)`](#patternlab.server.serve) ⇒ <code>Promise</code>
            * [`.reload()`](#patternlab.server.reload) ⇒ <code>Promise</code>
            * [`.refreshCSS()`](#patternlab.server.refreshCSS) ⇒ <code>Promise</code>
        * [`.events`](#patternlab.events) : <code>EventEmitter</code>

<a name="patternlab+version"></a>

### `patternlab.version` ⇒ <code>string</code>
Returns current version

**Kind**: instance property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>string</code> - current patternlab-node version as defined in `package.json`, as string
<a name="patternlab+build"></a>

### `patternlab.build` ⇒ <code>Promise</code>
Builds patterns, copies assets, and constructs user interface

**Kind**: instance property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>Promise</code> - a promise fulfilled when build is complete
**Emits**: <code>event:PATTERNLAB_BUILD_START</code>, <code>event:PATTERNLAB_BUILD_END</code>
**See**: [all events](./events.md)

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | an object used to control build behavior |
| [options.cleanPublic] | <code>bool</code> | <code>true</code> | whether or not to delete the configured output location (usually `public/`) before build |
| [options.data] | <code>object</code> | <code>{}</code> | additional data to be merged with global data prior to build |
| [options.watch] | <code>bool</code> | <code>true</code> | whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild |

<a name="patternlab+getDefaultConfig"></a>

### `patternlab.getDefaultConfig` ⇒ <code>object</code>
Returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.

**Kind**: instance property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>object</code> - Returns the object representation of the `patternlab-config.json`
<a name="patternlab+getSupportedTemplateExtensions"></a>

### `patternlab.getSupportedTemplateExtensions` ⇒ <code>Array.&lt;string&gt;</code>
Returns all file extensions supported by installed PatternEngines

**Kind**: instance property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>Array.&lt;string&gt;</code> - all supported file extensions

<a name="patternlab+liststarterkits"></a>

### `patternlab.liststarterkits` ⇒ <code>Promise</code>
Fetches starterkit repositories from pattern-lab github org that contain 'starterkit' in their name

**Kind**: instance property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>Promise</code> - Returns an Array<{name,url}> for the starterkit repos
<a name="patternlab+loadstarterkit"></a>

### `patternlab.loadstarterkit` ⇒ <code>void</code>
Loads starterkit already available via `node_modules/`

**Kind**: instance property of [<code>patternlab</code>](#patternlab)

| Param | Type | Description |
| --- | --- | --- |
| starterkitName | <code>string</code> | name of starterkit |
| clean | <code>boolean</code> | whether or not to delete contents of source/ before load |

<a name="patternlab+patternsonly"></a>

### `patternlab.patternsonly` ⇒ <code>Promise</code>
Builds patterns only, leaving existing user interface files intact

**Kind**: instance property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>Promise</code> - a promise fulfilled when build is complete

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options.cleanPublic] | <code>bool</code> | <code>true</code> | whether or not to delete the configured output location (usually `public/`) before build |
| [options.data] | <code>object</code> | <code>{}</code> | additional data to be merged with global data prior to build |
| [options.watch] | <code>bool</code> | <code>true</code> | whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild |

<a name="patternlab.getDefaultConfig"></a>

### `patternlab.getDefaultConfig` ⇒ <code>object</code>
Static method that returns the standardized default config used to run Pattern Lab. This method can be called statically or after instantiation.

**Kind**: static property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>object</code> - Returns the object representation of the `patternlab-config.json`
<a name="patternlab.getVersion"></a>

### `patternlab.getVersion` ⇒ <code>string</code>
Static method that returns current version

**Kind**: static property of [<code>patternlab</code>](#patternlab)
**Returns**: <code>string</code> - current @pattern-lab/core version as defined in `package.json`
<a name="patternlab.server"></a>

### `patternlab.server` : <code>object</code>
Server module

**Kind**: static property of [<code>patternlab</code>](#patternlab)

* [`.server`](#patternlab.server) : <code>object</code>
    * [`.serve(options)`](#patternlab.server.serve) ⇒ <code>Promise</code>
    * [`.reload()`](#patternlab.server.reload) ⇒ <code>Promise</code>
    * [`.refreshCSS()`](#patternlab.server.refreshCSS) ⇒ <code>Promise</code>

<a name="patternlab.server.serve"></a>

#### `server.serve(options)` ⇒ <code>Promise</code>
Build patterns, copies assets, and constructs user interface. Watches configured `source/` directories, and serves all output locally

**Kind**: static method of [<code>server</code>](#patternlab.server)
**Returns**: <code>Promise</code> - a promise fulfilled when build is complete

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>object</code> |  | an object used to control build behavior |
| [options.cleanPublic] | <code>bool</code> | <code>true</code> | whether or not to delete the configured output location (usually `public/`) before build |
| [options.data] | <code>object</code> | <code>{}</code> | additional data to be merged with global data prior to build |
| [options.watch] | <code>bool</code> | <code>true</code> | whether or not Pattern Lab should watch configured `source/` directories for changes to rebuild |

<a name="patternlab.server.reload"></a>

#### `server.reload()` ⇒ <code>Promise</code>
Reloads any active live-server instances

**Kind**: static method of [<code>server</code>](#patternlab.server)
**Returns**: <code>Promise</code> - a promise fulfilled when operation is complete
<a name="patternlab.server.refreshCSS"></a>

#### `server.refreshCSS()` ⇒ <code>Promise</code>
Reloads CSS on any active live-server instances

**Kind**: static method of [<code>server</code>](#patternlab.server)
**Returns**: <code>Promise</code> - a promise fulfilled when operation is complete
<a name="patternlab.events"></a>

### `patternlab.events` : <code>EventEmitter</code>
**Kind**: static property of [<code>patternlab</code>](#patternlab)
**See**

- [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter)
- [All Pattern Lab events](./events.md)


* * *

[Pattern Lab](https://patternlab.io) Node is [MIT Licensed](https://github.com/pattern-lab/patternlab-node/blob/master/LICENSE)
