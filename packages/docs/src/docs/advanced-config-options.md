---
title: Editing the Configuration Options
tags:
  - docs
category: getting-started
eleventyNavigation:
  key: getting-started
  title: Editing the Configuration Options
  order: 30
---

Pattern Lab Node comes with a configuration file [(`patternlab-config.json`)](https://github.com/pattern-lab/patternlab-node/blob/master/packages/core/patternlab-config.json) that allows you to modify certain aspects of the system. The latest default values are included within. This file is shipped within [the editions](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node) or can be supplied from core and the command line interface. Below is a description of each configuration option and how it affects Pattern Lab Node.

### cacheBust

Instructs Pattern Lab to append a unique query string to Javascript and CSS assets throughout the frontend.

```javascript
"cacheBust": true
```

**default**: `true`

### cleanPublic

Sets whether or not to delete `public.patterns/` upon each build of Pattern Lab. When set to false, [incremental builds](https://github.com/pattern-lab/patternlab-node/wiki/Incremental-Builds) are also enabled.

**default**: `true`

### defaultPattern

Sets a specific pattern upon launch of the styleguide. This pattern will not be available in the navigation, or in view all pages. The only way to get to it will be via a refresh. Set it using the [short-hand pattern-include syntax](/docs/including-patterns/):

```javascript
"defaultPattern": "pages-welcome",
```

A special value of `all` can also be supplied to display all patterns on load.

**default**: `all`

### defaultShowPatternInfo

Sets whether or not you want the styleguide to load with the pattern info open or closed.

**default**: `false`

### defaultPatternInfoPanelCode (optional)

Sets default active pattern info code panel by file extension - if unset, uses the value out of _patternExtension_ config value, or instead use value `html` to display the html code initially, or the value defined for the _patternExtension_.

**default**: _patternExtension_ value (`"hbs"` | `"mustache"` | `"twig"` | `"html"`)

### ishControlsHide

Sets whether or not to hide navigation options within the styleguide.

**default**:

```javascript
"ishControlsHide": {
  "s": false,
  "m": false,
  "l": false,
  "full": false,
  "random": false,
  "disco": false,
  "hay": true,
  "mqs": false,
  "find": false,
  "views-all": false,
  "views-annotations": false,
  "views-code": false,
  "views-new": false,
  "tools-all": false,
  "tools-docs": false
}
```

### ishViewportRange

Sets the boundaries of each of the viewport toggles, 'S'mall, 'M'edium, and 'L'arge. Clicking on one of these buttons will randomly set the ish Viewport to a value within the given range. Setting the range to the same number can effectively set an exact value. The first entry in `ishViewportRange.s` is the `ishViewportMinimum`, which is now obsolete. The second entry in `ishViewportRange.l` is the `ishViewportMaximum`, which is now also obsolete.

**default**:

```javascript
"ishViewportRange": {
  "s": [240, 500],
  "m": [500, 800],
  "l": [800, 2600]
},
```

### logLevel

Sets the level of verbosity for Pattern Lab Node logging.

- `error` will output a message as a thrown error
- `warning` will output all warnings plus above
- `info` will output all info messages, plus above (intended default)
- `debug` will output all debug messages, plus above
- `quiet` will output ZERO logs

This replaces the now obsolete `debug` flag.

**default**: `info`

### outputFileSuffixes

Sets the naming of output pattern files. Suffixes are defined for 'rendered', 'rawTemplate', and 'markupOnly' files. This configuration is needed for some PatternEngines that use the same input and output file extensions. Most users will not have to change this.

```javascript
"outputFileSuffixes": {
  "rendered": ".rendered",
  "rawTemplate": "",
  "markupOnly": ".markup-only"
},
```

### paths

Sets the configurable source and public directories for files Pattern Lab Node operates within. Build, copy, output, and server operations rely upon these paths. Some paths are relative to the current UIKit. See UIKit configuration for more info. Note the `patternlabFiles` which help create the front end styleguide. Note also the intentional repetition of the nested structure, made this way for maximum flexibility. These are unlikely to change unless you customize your environment or write custom UIKits.

**default** :

```javascript
  "paths": {
    "source": {
      "root": "./source/",
      "patterns": "./source/_patterns/",
      "data": "./source/_data/",
      "meta": "./source/_meta/",
      "annotations": "./source/_annotations/",
      "styleguide": "dist/",
      "patternlabFiles": {
        "general-header": "views/partials/general-header.mustache",
        "general-footer": "views/partials/general-footer.mustache",
        "patternSection": "views/partials/patternSection.mustache",
        "patternSectionSubtype": "views/partials/patternSectionSubtype.mustache",
        "viewall": "views/viewall.mustache"
      },
      "js": "./source/js",
      "images": "./source/images",
      "fonts": "./source/fonts",
      "css": "./source/css"
    },
    "public": {
      "root": "public/",
      "patterns": "public/patterns/",
      "data": "public/styleguide/data/",
      "annotations": "public/annotations/",
      "styleguide": "public/styleguide/",
      "js": "public/js",
      "images": "public/images",
      "fonts": "public/fonts",
      "css": "public/css"
    }
  },
```

### patternExtension

Sets the panel name and language for the code tab on the styleguide. Since this only accepts one value, this is a place where mixed pattern trees (different PatternEngines in the same instance of Pattern Lab) does not quite work.

**default**: `mustache`

### patternStateCascade

See the [Pattern State Documentation](/docs/using-pattern-states/)

**default**:

```javascript
"patternStateCascade": ["inprogress", "inreview", "complete"],
```

### patternExportDirectory

Sets the location that any export operations should output files to. This may be a relative or absolute path.

**default**: `./pattern_exports/`

### patternExportPatternPartials

Sets an array of patterns (using the [short-hand pattern-include syntax](/docs/including-patterns/)) to be exported after a build.

For example, to export the navigation, header, and footer, one might do:

```javascript
"patternExportPatternPartials": ["molecules-primary-nav", "organisms-footer", "organisms-header"],
```

**default**: `[]`

### patternMergeVariantArrays

Used to override the merge behavior of pattern variants. For more information see [The Pseudo-Pattern File Data](docs/using-pseudo-patterns/#heading-the-pseudo-pattern-file data).

- `true` will merge arrays of the pattern and pseudo-pattern with [lodash merge](https://lodash.com/docs/4.17.15#merge)
- `false` will override arrays from the pattern with pseudo-patterns arrays

```javascript
"patternMergeVariantArrays": true,
```

**default**: `true` | `undefined`

### renderFlatPatternsOnViewAllPages

Used to activate rendering flat patterns on view all pages and generate view all pages if only flat patterns are available

- `true` will render flat patterns on view all pages
- `false` will make flat patterns available only in the menu

```javascript
"renderFlatPatternsOnViewAllPages": true,
```

**default**: `false` | `undefined`

### serverOptions

Sets live-server options. See the [live-server documentation](https://github.com/pattern-lab/live-server#usage-from-node) for more details.

**default**:

```javascript
"serverOptions": {
  "wait": 1000
},
```

### starterkitSubDir

[Starterkits](/docs/starterkits/) by convention house their files within the `dist/` directory. Should someone ever wish to change this, this key is available.

**default**:

```javascript
"starterkitSubDir": "dist",
```

### styleGuideExcludes

Sets whole pattern types to be excluded from the "All" patterns page on the styleguide. This is useful to decrease initial load of the styleguide. For example, to exlude all patterns under `templates` and `pages`, add the following:

```javascript
"styleGuideExcludes": [
	"templates",
	"pages"
]
```

These template and page patterns would still be accessible via navigation.

**default**: `[]`

### theme

Sets the theme options for the styleguide. There are five options:
* `"color"`
* `"density"`
* `"layout"`
* `"noViewAll"` (optional)
* `"logo"` (optional)

Available values are:

```javascript
"theme" : {
  "color" : "dark" | "light",
  "density" : "compact" | "cozy" | "comfortable",
  "layout" : "horizontal" | "vertical",
  "noViewAll" : true | false,
  "logo": {
    "text": "Pattern Lab",
    "altText": "Pattern Lab Logo",
    "url": "/",
    "srcLight": "styleguide/images/pattern-lab-logo--on-light.svg",
    "srcDark": "styleguide/images/pattern-lab-logo--on-dark.svg",
    "width": "187",
    "height": "185"
  }
}
```

See the [initial release notes](https://github.com/pattern-lab/styleguidekit-assets-default/releases/tag/v4.0.0-alpha.2) for the theme feature for example output on `"color"`, `'density"` and `"layout"`.

`"noViewAll"` provides the possibility to hide the "View All" pages and links within the navigation.

And `"logo"` lets you finetune the different aspects of the logo displayed on the left top corner of the styleguide.

**default**:

```javascript
"theme" : {
  "color" : "dark",
  "density" : "compact",
  "layout" : "horizontal"
}
```

### uikits

Introduced in Pattern Lab Node v3, UIKits are a new term in the Pattern Lab [Ecosystem](/docs/overview-of-pattern-lab's-ecosystem/). They are an evolution of the original Styleguidekit pattern which separated front-end templates from front-end assets like stylesheets and code. The existing `styleguidekit-assets-default` and `styleguidekit-mustache-default` have merged into `uikit-workshop`.

`uikits` accepts an array of UIKit objects, shipping with the one above.

- `name`: the name of the UIKit
- `package`: the NodeJS package name. This property was introduced in version 5.13 to allow for a uikit package to be used multiple times with different names. Add the package as a dependency in `package.json` before you configure it here.
- `outputDir` where to output this UIKit relative to the current root. By leaving this empty we retain the existing Pattern Lab 2.X behavior, outputting to `<project_root>/public`. If you had multiple UIKits, however, you would provide different values, such as:

```javascript
  "uikits": [
    {
      "name": "uikit-workshop",
      "package": "@pattern-lab/uikit-workshop",
      "outputDir": "workshop",
      ...
    },
    {
      "name": "uikit-storefront",
      "package": "@pattern-lab/uikit-storefront",
      "outputDir": "storefront",
      ...
    }
  ]
```

- `enabled`: quickly turn on or off the building of this UIKit
- `excludedPatternStates`: tell Pattern Lab not to include patterns with these states in this UIKit's output
- `excludedTags`: tell Pattern Lab not to include patterns with these tags in this UIKit's output

Important details:

- the [default `paths.source` object paths](https://github.com/pattern-lab/patternlab-node/pull/840/commits/a4961bd5d696a05fb516cdd951163b0f918d5e19) within `patternlab-config.json` are now relative to the current UIKit. See the [structure of uikit-workshop](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop) for more info
- the [default `paths.public` object paths](https://github.com/pattern-lab/patternlab-node/pull/840/commits/812bab3659f504043e8b61b1dc1cdac71f248449) within `patternlab-config.json` are now relative to the current UIKit's `outputDir`. Absolute paths will no longer work. Someone could test putting an absolute path in a UIKit `outputDir` property and see what happens I suppose.
- `dependencyGraph.json` has moved to the project root rather than `public/` as we should only retain one
- The lookup of the uikit by `name` is deprecated and the user will be notified of it. If the `package` property isn't defined, there is a default fallback lookup strategy where the value of `name` is tried as:
  - `<name>`
  - `uikit-<name>`
  - `@pattern-lab/<name>`
  - `@pattern-lab/uikit-<name>`

**default**:

```javascript
  "uikits": [
    {
      "name": "uikit-workshop",
      "package": "@pattern-lab/uikit-workshop",
      "outputDir": "",
      "enabled": true,
      "excludedPatternStates": [],
      "excludedTags": []
    }
  ]
```
