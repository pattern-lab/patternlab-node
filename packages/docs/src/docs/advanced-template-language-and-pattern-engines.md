---
title: Template Language and PatternEngines
heading: Template Language and PatternEngines
patternEnginesScript: true
category: advanced
eleventyNavigation:
  title: Template Language and PatternEngines
  key: advanced
  order: 300
sitemapPriority: '0.8'
---

By default Pattern Lab uses the Mustache template language, extended with [pattern parameters](/docs/using-pattern-parameters/). PatternEngines let you add support for a template language of your personal choice. Each PatternEngine has it's own set of features and caveats.

Right now the most mature PatternEngines are Handlebars, Mustache and Twig.

## Official PatternEngines for Node

<ul id="pattern-engine-list">
  <!-- This list is automatically replaced by a script -->
  <li>See the <a href="https://github.com/pattern-lab/patternlab-node/tree/master/packages">Pattern Lab repository on GitHub</a> or <a href="https://www.npmjs.com/search?q=keywords%3A%27Pattern%20Lab%27%20engine">search on npmjs.com</a></li>
</ul>

## Install and Configure a PatternEngine

1. Install a new PatternEngine that you wish to use. For example, to install the Handlebars engine, run `npm install --save @pattern-lab/engine-handlebars`.
2. (Optional) Change the `"patternExtension"` property of your config. This sets the panel name and language for the code tab on the styleguide.

You'll need to restart Pattern Lab for changes to take effect. Some PatternEngines may provide further configuration.
