---
title: Installing Pattern Lab
tags:
  - docs
category: getting-started
---

Once you have the requisite [requirements installed](/docs/requirements), install Pattern Lab by running the following command in your terminal:

```
npm create pattern-lab
```

This will bring up an installation menu that presents the following steps:

- `Please specify a directory for your Pattern Lab project.` - Choose the directory where you want to install Pattern Lab. The default location is the current directory.
- `Which edition do you want to use (defaults to edition-node)?` - Choose the Pattern Lab edition that you want to install. The options are:
  - `edition-node (handlebars engine)`
  - `edition-twig (php engine)`
  - `edition-node-gulp (legacy)`
- `Which starterkit do you want to use?` - Choose the <a href="/docs/advanced-starterkits.html">Starterkit</a> you want to begin your project with. Starterkits define the initial components and assets that are included in the initial project. Start from scratch, start from a full demo, or a lightweight boilerplate.
- `Are you happy with your choices? (Hit enter for YES)?` - Confirm your choices, and when done the Pattern Lab installation will begin.

With those questions answered, Pattern Lab will begin installing. Once the installation is complete, you're ready to <a href="/docs/generating-pattern-lab.html">generate Pattern Lab for the first time.</a>

---

Legacy versions of Pattern Lab Node 2.X are also available:

- <a class="link-desc-list__link" href="https://github.com/pattern-lab/edition-node-gulp/releases/tag/v1.3.4">Gulp Edition</a> - The Gulp wrapper around <a href="https://github.com/pattern-lab/patternlab-node/tree/master/packages/core">Pattern Lab Node Core</a>
- <a class="link-desc-list__link" href="https://github.com/Comcast/patternlab-edition-node-webpack">Webpack Edition</a> - The Webpack wrapper around <a href="https://github.com/pattern-lab/patternlab-node/tree/master/packages/core">Pattern Lab Node Core</a> Thanks to the team at Comcast for <a href="https://comcast.github.io">open-sourcing</a> this stellar work!
