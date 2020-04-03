---
title: Installing Pattern Lab
tags:
  - docs
category: getting-started
eleventyNavigation:
  title: Installing Pattern Lab
  key: getting-started
  order: 0
---

## Step 1: Install requirements

Make sure you have [Node.js](https://nodejs.org/en/download/) installed before setting up Pattern Lab.

## Step 2: Run the create Pattern Lab command

Open [the command line](https://tutorial.djangogirls.org/en/intro_to_command_line/) and run the following command:

```
npm create pattern-lab
```

This will bring up an installation menu that presents the following steps:

## Step 3: Choose a directory

**`Please specify a directory for your Pattern Lab project.`** Choose the directory where you want to install Pattern Lab. The default location is the current directory.

!["choose directory"](/images/2choosedirectory.png)

## Step 4: Choose templating language

**`What templating language do you want to use with Pattern Lab?`** This determines what templating engine you'll use to author components. The options are:

- `Handlebars` - uses the [Handlebars](https://handlebarsjs.com/) templating engine
- `Twig (PHP)*` - uses the [Twig](https://twig.symfony.com/) templating engine

**\*A note on Twig:** while Pattern Lab is powered by Node, behind the scenes Twig files are compiled by Twig PHP, _not_ by twig.js (which isn't fully on par with Twig PHP).

## Step 5: Choose initial patterns

**`What initial patterns do you want included in your project?`** - Choose the <a href="/docs/advanced-starterkits.html">Starterkit</a> you want to begin your project with. The options are:

- **`Handlebars base patterns`** `(some basic patterns to get started with)` - TODO: include demo link
- **`Handlebars demo patterns`** `(full demo website and patterns)` - TODO: include demo link
- **`Twig (PHP) demo patterns`** `(full demo website and patterns)` - TODO: include demo link
- **`Custom starterkit`** - point to a custom Pattern Lab starterkit TODO: include instructions on including custom starterkits
- **`Blank project (no patterns)`** - This won't include any initial patterns in your project so you can start completely from scratch

## Step 6: Confirm your choices

**`Are you happy with your choices? (Hit enter for YES)?`** - Confirm your choices, and when done the Pattern Lab installation will begin.

!["are you happy yes or no"](/images/5areyouhappy.png)

With those questions answered, Pattern Lab will begin installing. Once the installation is complete, you're ready to <a href="/docs/generating-pattern-lab.html">generate Pattern Lab for the first time.</a>
