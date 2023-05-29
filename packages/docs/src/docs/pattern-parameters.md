---
title: Using Pattern Parameters
tags:
  - docs
category: patterns
eleventyNavigation:
  title: Using Pattern Parameters
  key: patterns
  order: 150
sitemapPriority: '0.8'
sitemapChangefreq: 'monthly'
---

Passing parameters parameters to included patterns are a **simple** mechanism for replacing variables in an included pattern, by each of the standard ways of how to do it either in handlebars ([Partial Parameters](https://handlebarsjs.com/guide/partials.html#partial-parameters)) or twig ([include with `with` keyword](https://twig.symfony.com/doc/3.x/tags/include.html#:~:text=You%20can%20add%20additional%20variables%20by%20passing%20them%20after%20the%20with%20keyword%3A)) template language. They are limited to replacing variables in the included pattern and **only** the included pattern. They are especially useful when including a single pattern multiple times in a molecule, template, or page and you want to supply unique data to that pattern each time it's included.
