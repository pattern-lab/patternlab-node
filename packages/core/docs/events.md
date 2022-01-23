# Pattern Lab Node Events

[![Join the chat at Gitter](https://badges.gitter.im/pattern-lab/node.svg)](https://gitter.im/pattern-lab/node)

Pattern Lab emits numerous events during the [build](../docs/) process. Some uses of events:

* Core uses `patternlab-pattern-change` events when watching for changes in order to trigger another build
* Plugins such as [plugin-tab](https://github.com/pattern-lab/patternlab-node/tree/master/packages/plugin-tab) can use an event like `patternlab-pattern-write-end` to define additional code tabs to the pattern viewer / modal

Learn more about [Creating Plugins](https://github.com/pattern-lab/patternlab-node/wiki/Creating-Plugins).

<a name="module_Events"></a>

## Events

<a name="exp_module_Events--EVENTS"></a>

### `EVENTS` ⏏

**Kind**: Exported constant  
<a name="module_Events--EVENTS..PATTERNLAB_BUILD_START"></a>

#### `EVENTS~PATTERNLAB_BUILD_START`

Emitted before any logic run inside `build()`, which is the entry point for single builds, pattern-only builds, run singly or when watched.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name       | Type                | Description       |
| ---------- | ------------------- | ----------------- |
| patternlab | <code>object</code> | global data store |

<a name="module_Events--EVENTS..PATTERNLAB_BUILD_END"></a>

#### `EVENTS~PATTERNLAB_BUILD_END`

Emitted after all logic run inside `build()`, which is the entry point for single builds, pattern-only builds, run singly or when watched.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name       | Type                | Description       |
| ---------- | ------------------- | ----------------- |
| patternlab | <code>object</code> | global data store |

<a name="module_Events--EVENTS..PATTERNLAB_PATTERN_ITERATION_END"></a>

#### `EVENTS~PATTERNLAB_PATTERN_ITERATION_END`

Emitted after patterns are iterated over to gather data about them. Right before Pattern Lab processes and renders patterns into HTML

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name       | Type                | Description       |
| ---------- | ------------------- | ----------------- |
| patternlab | <code>object</code> | global data store |

<a name="module_Events--EVENTS..PATTERNLAB_BUILD_GLOBAL_DATA_END"></a>

#### `EVENTS~PATTERNLAB_BUILD_GLOBAL_DATA_END`

Emitted after global `data.json` and `listitems.json` are read, and the supporting Pattern Lab templates are loaded into memory (header, footer, patternSection, patternSectionSubgroup, viewall). Right before patterns are iterated over to gather data about them.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name       | Type                | Description       |
| ---------- | ------------------- | ----------------- |
| patternlab | <code>object</code> | global data store |

<a name="module_Events--EVENTS..PATTERNLAB_PATTERN_BEFORE_DATA_MERGE"></a>

#### `EVENTS~PATTERNLAB_PATTERN_BEFORE_DATA_MERGE`

Emitted before all data is merged prior to a Pattern's render. Global `data.json` is merged with any pattern `.json`. Global `listitems.json` is merged with any pattern `.listitems.json`.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**See**: [Pattern](https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/src/lib/object_factory.js#L16)
**Properties**

| Name       | Type                 | Description       |
| ---------- | -------------------- | ----------------- |
| patternlab | <code>object</code>  | global data store |
| pattern    | <code>Pattern</code> | current pattern   |

<a name="module_Events--EVENTS..PATTERNLAB_PATTERN_WRITE_BEGIN"></a>

#### `EVENTS~PATTERNLAB_PATTERN_WRITE_BEGIN`

Emitted before a pattern's template, HTML, and encoded HTML files are written to their output location

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**See**: [Pattern](https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/src/lib/object_factory.js#L16)
**Properties**

| Name       | Type                 | Description       |
| ---------- | -------------------- | ----------------- |
| patternlab | <code>object</code>  | global data store |
| pattern    | <code>Pattern</code> | current pattern   |

<a name="module_Events--EVENTS..PATTERNLAB_PATTERN_WRITE_END"></a>

#### `EVENTS~PATTERNLAB_PATTERN_WRITE_END`

Emitted after a pattern's template, HTML, and encoded HTML files are written to their output location

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**See**: [Pattern](https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/src/lib/object_factory.js#L16)
**Properties**

| Name       | Type                 | Description       |
| ---------- | -------------------- | ----------------- |
| patternlab | <code>object</code>  | global data store |
| pattern    | <code>Pattern</code> | current pattern   |

<a name="module_Events--EVENTS..PATTERNLAB_PATTERN_ASSET_CHANGE"></a>

#### `EVENTS~PATTERNLAB_PATTERN_ASSET_CHANGE`

Invoked when a watched asset changes. Assets include anything in `source/` that is not under `['root', 'patterns', 'data', 'meta', 'annotations', 'patternlabFiles']` which are blacklisted for specific copying.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name     | Type                | Description                                               |
| -------- | ------------------- | --------------------------------------------------------- |
| fileInfo | <code>object</code> | `{file: 'path/to/file.css', dest: 'path/to/destination'}` |

<a name="module_Events--EVENTS..PATTERNLAB_GLOBAL_CHANGE"></a>

#### `EVENTS~PATTERNLAB_GLOBAL_CHANGE`

Invoked when a watched global file changes. These are files within the directories specified in `['data', 'meta']`paths.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name     | Type                | Description                  |
| -------- | ------------------- | ---------------------------- |
| fileInfo | <code>object</code> | `{file: 'path/to/file.ext'}` |

<a name="module_Events--EVENTS..PATTERNLAB_PATTERN_CHANGE"></a>

#### `EVENTS~PATTERNLAB_PATTERN_CHANGE`

Invoked when a pattern changes.

**Kind**: inner property of [<code>EVENTS</code>](#exp_module_Events--EVENTS)  
**Properties**

| Name     | Type                | Description                  |
| -------- | ------------------- | ---------------------------- |
| fileInfo | <code>object</code> | `{file: 'path/to/file.ext'}` |

---

[Pattern Lab](https://patternlab.io) Node is [MIT Licensed](https://github.com/pattern-lab/patternlab-node/blob/master/LICENSE)
