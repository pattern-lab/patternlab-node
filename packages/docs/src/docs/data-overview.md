---
title: Overview of Data
tags:
  - docs
---

The primary default global source of data used when rendering Pattern Lab patterns can be found in `./source/_data/`.

## Supported Data Formats

The PHP version of Pattern Lab supports JSON and YAML. To use JSON or YAML simply use the appropriate file extension with the files holding your data. They are `.json` for JSON and `.yml` or `.yaml` for YAML. You can mix JSON and YAML files in the same project.

The Node version of Pattern Lab only supports JSON.

## Locations for Data

There are three places to store data in Pattern Lab:

* in `./source/_data`. The PHP version of Pattern Lab supports an unlimited number of data files in this directory.
* in [pattern-specific](/docs/data-pattern-specific.html) files in `./source/_patterns`.
* in [pseudo-pattern](/docs/pattern-pseudo-patterns.html) files in `./source/_patterns`.

### A Special Note About Pattern Parameters

[Pattern parameters](/docs/pattern-parameters.html) are a simple find and replace of variables in the included pattern. As such they do not affect the context stack of Mustache and we don't consider them true data. They have no impact on overall data inheritance and they cannot be used any deeper than the included pattern. They are a hack.

## Data Inheritance

Data inheritance in Pattern Lab follows this flow:

```
Pattern-specific data for the pattern being rendered > Global data in _data
```

The only data that is loaded to render a pattern is its own data and global data. It will not include the data for any included patterns. For example, the pages template, `article`, might include the molecule, `block-hero`. `block-hero` may have its own pattern-specific data file, `block-hero.json`. The PHP and Node versions of Pattern Lab **will not** use the `block-hero` data when rendering `article`. It will only use `article.json` (_if available_) and data found in `./source/_data`.

If you need to load data based on included patterns or pseudo-patterns the [Data Inheritance Plugin for PHP](https://github.com/pattern-lab/plugin-php-data-inheritance) may fit your needs.
