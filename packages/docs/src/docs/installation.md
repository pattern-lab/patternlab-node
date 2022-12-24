---
title: Installing Pattern Lab
tags:
  - docs
category: getting-started
eleventyNavigation:
  title: Installing Pattern Lab
  key: getting-started
  order: 0
sitemapPriority: '0.9'
sitemapChangefreq: 'monthly'
---

## Step 1: Install requirements

Make sure you have [Node.js](https://nodejs.org/en/download/) installed before setting up Pattern Lab, e.g. by checking for the node version: `node -v`

Please make sure to have at minimum version node 7 installed, but even better at least the node version that's being mentioned in [.nvmrc](https://github.com/pattern-lab/patternlab-node/blob/dev/); [Node version manager](https://github.com/nvm-sh/nvm) might be a good option if you can't update.

## Step 2: Run the create Pattern Lab command

Open [the command line](https://tutorial.djangogirls.org/en/intro_to_command_line/) and run the following command:

```
npm create pattern-lab
```

This will bring up an installation menu that presents the following steps:

## Step 3: Choose a directory

**`Please specify a directory for your Pattern Lab project.`** Choose the directory where you want to install Pattern Lab. The default location is the current directory.

## Step 4: Choose templating language

**`What templating language do you want to use with Pattern Lab?`** This determines what templating engine you'll use to author components. The options are:

- **`Handlebars`** - uses the [Handlebars](https://handlebarsjs.com/) templating engine
- **`Twig (PHP)*`** - uses the [Twig](https://twig.symfony.com/) templating engine

**\*A note on Twig:** while Pattern Lab is powered by Node, behind the scenes Twig files are compiled by Twig PHP, _not_ by twig.js (which isn't fully on par with Twig PHP).

## Step 5: Choose initial patterns

**`What initial patterns do you want included in your project?`** - Choose the [Starterkit](/docs/starterkits/) you want to begin your project with. The options are:

- **`Handlebars base patterns`** `(some basic patterns to get started with)`
- **`Handlebars demo patterns`** `(full demo website and patterns)`
- **`Twig (PHP) demo patterns`** `(full demo website and patterns)`
- **`Custom starterkit`** - point to a custom Pattern Lab starterkit TODO: include instructions on including custom starterkits
- **`Blank project (no patterns)`** - This won't include any initial patterns in your project so you can start completely from scratch

You can find all starter kits on our [demos page](/demos/)

## Step 6: Confirm your choices

**`Are you happy with your choices? (Hit enter for YES)?`** - Confirm your choices, and when done the Pattern Lab installation will begin.

