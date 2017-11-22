
# Pattern Lab Node API

``` javascript

const config = require('./patternlab-config.json');
const patternlab = require('patternlab-node')(config);

```

## `build(options)` ⇒ <code>Promise</code>

  build patterns, copy assets, and construct ui

**Returns**: <code>Promise</code> - a promise fulfilled when build is complete  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | an object used to control build behavior |

## `getDefaultConfig()` ⇒ <code>object</code>

  Returns the standardized default config

**Returns**: <code>object</code> - Returns the object representation of the patternlab-config.json  
## `getSupportedTemplateExtensions()` ⇒ <code>Array.&lt;string&gt;</code>

  returns all file extensions supported by installed PatternEngines

**Returns**: <code>Array.&lt;string&gt;</code> - all supported file extensions  
## `help()` ⇒ <code>void</code>

  logs usage

**Returns**: <code>void</code> - pattern lab API usage, as console output  
## `installplugin(pluginName)` ⇒ <code>void</code>

  install plugin already available via `node_modules/`


| Param | Type | Description |
| --- | --- | --- |
| pluginName | <code>string</code> | name of plugin |

## `liststarterkits()` ⇒ <code>Promise</code>

  fetches starterkit repos from pattern-lab github org that contain 'starterkit' in their name

**Returns**: <code>Promise</code> - Returns an Array<{name,url}> for the starterkit repos  
## `loadstarterkit(starterkitName, clean)` ⇒ <code>void</code>

  load starterkit already available via `node_modules/`


| Param | Type | Description |
| --- | --- | --- |
| starterkitName | <code>string</code> | name of starterkit |
| clean | <code>boolean</code> | whether or not to delete contents of source/ before load |

## `v()` ⇒ <code>string</code>

  return current version

**Returns**: <code>string</code> - current patternlab-node version as defined in package.json, as string  
## `version()` ⇒ <code>void</code>

  logs current version

**Returns**: <code>void</code> - current patternlab-node version as defined in package.json, as console output  
## `patternsonly(options)` ⇒ <code>Promise</code>

  build patterns only, leaving existing public files intact

**Returns**: <code>Promise</code> - a promise fulfilled when build is complete  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | an object used to control build behavior |

## `serve(options)` ⇒ <code>Promise</code>

  build patterns, copy assets, and construct ui, watch source files, and serve locally

**Returns**: <code>Promise</code> - TODO: validate  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | an object used to control build, copy, and serve behavior |

* * *

[Pattern Lab](http://patternlab.io) Node is [MIT Licensed](https://github.com/pattern-lab/patternlab-node/blob/master/LICENSE)
