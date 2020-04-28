---
title: Overview of Patterns
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Overview of Patterns
  key: patterns
  order: 10
---

Patterns can be found in `./source/_patterns/`. Patterns must be written in the template languages supported by Pattern Lab's PatternEngines. For Node there are [several more PatternEngines to choose from](/docs/template-language-and-patternengines/).

## How Patterns Are Organized

Patterns are organized in a nested folder structure under `./source/_patterns/`. This allows the Node version of Pattern Lab to automatically find and build assets like the "view all" pages and the drop down navigation. Pattern Lab uses the following organizational structure:

    [patternType]/[patternSubtype]/[patternName].[patternExtension]

Here are the parts:

- `patternType` denotes the overall pattern type. If using Atomic Design this will be something like "atoms" or "molecules" but it can be anything you want. For example, "components" or "elements."
- `patternSubtype` denotes the sub-type of pattern and is _optional_. This helps to organize patterns under an overall pattern type in the drop downs in Pattern Lab. For example, a "blocks" pattern subtype under the "molecules" pattern type.
- `patternName` is the name of the pattern. This is used when the pattern is displayed in the drop downs in Pattern Lab.
- `patternExtension` is the file extension that tells the PatternEngine to render the pattern. For example, `.mustache`.

Dashes (`-`) in your pattern types, pattern subtypes or pattern names will be replaced with spaces. For example, if you want a pattern to be displayed in the drop-down as "Hamburger Navigation" and you're using the Mustache PatternEngine you should name it `hamburger-navigation.mustache`.

## Pattern Type Naming Conventions

You do **not** have to use the Atomic Design naming convention when organizing your patterns. You can name your pattern types whatever you like and use as many or as few as you like. For example, you could use the pattern types Nachos, Tacos, and Burritos instead of Atoms, Molecules, and Organisms.

## Ordering

By default, pattern types, pattern subtypes and patterns are ordered alphabetically. If you want more control over their ordering please refer to "[Reorganizing Patterns](/docs/reorganizing-patterns/)."

## Deeper Nesting

Node versions support nesting of folders under `patternSubtype`. For example, you may want to organize your [pattern documentation](/docs/documenting-patterns/), pattern, Sass files and [pseudo-patterns](/docs/using-pseudo-patterns/) in one directory like so:

    - molecules/
      - blocks/
        - media-block/
          - media-block.md
          - media-block.mustache
          - media-block.scss
          - media-block~variant1.json
          - media-block~variant2.json

In this example the `media-block/` directory is ignored for the purposes of generating breadcrumbs and navigation in the Pattern Lab front-end but the documentation, pattern and pseudo-patterns are still rendered.

Folders can be nested under `media-block/` if desired but this is discouraged because of possible collisions when using the [shorthand partial syntax](/docs/including-patterns/).
