---

title: Pattern Lab 1 to Pattern Lab 2 Changes | Pattern Lab
heading: Pattern Lab 1 to Pattern Lab 2 Changes - PHP
---

With Pattern Lab 2 in development for almost two years many under-the-hood changes have been implemented. For the most part a Pattern Lab 1 project should work with minimal changes in Pattern Lab 2. Here is a non-exhaustive list of new features in Pattern Lab 2:

* complete rebuilding of core
* support for Composer
* support for more template languages (_currently Mustache and Twig_)
* support for StarterKits allowing separation of a team's unique needs from Pattern Lab proper
* event notification system, getters, setters, and a clean install process to allow for plugins
* redesigned and rebuilt modal view
* redesigned and rebuilt styleguide view
* multi-source directory support
* support for YAML in global data, pattern-specific data, and pseudo-patterns
* can have multiple JSON/YAML files in `./_data/`
* support for JSON/YAML linting to find errors
* can set multiple classes using the style modifier
* can use link.[pattern-name] within data to link to other patterns
* pattern parameters support simple lists
* pattern parameters act more like mustache (_but not exactly!_)
* patternParameters can over listItem loop numbers
* global pattern header and footer is now in `./source/_meta`
* upgraded console utility
* patterns and pattern subtypes can be documented in the styleguide by using `[pattern-name].md` or `[pattern-subtype].md`
* view all pages for pattern sub-types
* annotations can be defined using Markdown
* patterns can be exported minus Pattern Lab mark-up
* can hide individual patterns from "view all" view still available via the nav
* can set a pattern to be the default pattern when loading Pattern Lab
* can turn on modal view by default
* implemented server
* sayings can now be defined in the config
* install process that makes it easier to install various components

These are the features of Pattern Lab 1 that have become plugins:

* Automatic Browser Reload

These are the features of Pattern Lab 1 that have been removed in Pattern Lab 2:

* QR Code Generator
* Page Follow
* MQs
