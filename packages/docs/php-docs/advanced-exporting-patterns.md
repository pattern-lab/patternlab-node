---
title: Exporting Patterns
tags:
  - docs
---

Pattern Lab can export all of your patterns for you sans Pattern Lab's CSS and JavaScript. To export your patterns do the following:

1. In a terminal window navigate to the root of your project
2. Type `php core/console --export`

If you require your patterns to be exported without your global header and footer (_e.g. to export a clean molecule_) do the following:

1. In a terminal window navigate to the root of your project
2. Type `php core/console --export --clean`

In both cases the patterns will be exported to `./export/patterns`. The export directory is one of the many directories that can be [configured and changed](/docs/editing-source-files.html).
