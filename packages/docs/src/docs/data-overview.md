---
title: Overview of Data
tags:
  - docs
category: data
eleventyNavigation:
  title: Overview of Data
  key: data
  order: 300
sitemapPriority: '0.8'
---

The primary default global source of data used when rendering Pattern Lab patterns can be found in `./source/_data/`.

## Supported Data Formats

The Node version of Pattern Lab only supports JSON.

## Locations for Data

There are three places to store data in Pattern Lab:

- in `./source/_data`.
- in [pattern-specific](/docs/creating-pattern-specific-values/) files in `./source/_patterns`.
- in [pseudo-pattern](/docs/using-pseudo-patterns/) files in `./source/_patterns`.

### A Special Note About Pattern Parameters (Mustache engine)

[Pattern parameters](/docs/using-pattern-parameters/) are a simple find and replace of variables in the included pattern. As such they do not affect the context stack of Mustache and we don't consider them true data. They have no impact on overall data inheritance and they cannot be used any deeper than the included pattern. They are a hack.

## Data Inheritance

Data inheritance in Pattern Lab follows this flow:

```
Pattern-specific data for the pattern being rendered > Global data in _data
```

The only data that is loaded to render a pattern is its own data and global data. It will not include the data for any included patterns. For example, the pages template, `article`, might include the molecule, `block-hero`. `block-hero` may have its own pattern-specific data file, `block-hero.json`. The Node version of Pattern Lab **will not** use the `block-hero` data when rendering `article`. It will only use `article.json` (_if available_) and data found in `./source/_data`.
