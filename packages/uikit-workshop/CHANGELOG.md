# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="1.0.0-beta.0"></a>
# [1.0.0-beta.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/compare/@pattern-lab/uikit-workshop@1.0.0-alpha.7...@pattern-lab/uikit-workshop@1.0.0-beta.0) (2018-09-07)


### Bug Fixes

* add missing node-sass dependency ([643808b](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/643808b))
* add webpack-cli as a uikit-workshop dependency; update npm script to use locally installed version vs globally / temp version via npx ([812efe9](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/812efe9))
* adjust how PL's viewport is sized / positioned when the sidebar layout is active so iframed content is centered properly ([3caffbf](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/3caffbf))
* change const back to var since PL's Uikit JS isn't run through Babel just yet.. update Prettier config to ignore Uikit's JavaScript for the time being ([35c5726](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/35c5726))
* check to make sure the code panel-related <script> tag contains data before attempting to parse expected JSON. Partial fix to [#761](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/issues/761) as this should at least help prevent the current batch of JS errors from getting thrown ([9c16675](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/9c16675))
* fix broken / missing closing HTML tag ([100ea8f](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/100ea8f))
* fix JS paths imported ([1d7dec8](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/1d7dec8))
* update ish-controls to be vertically centered in the global PL header by default ([f75de74](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/f75de74))
* update PL code viewer to open and resize as expected + animate much more performantly using CSS transforms; update existing JS logic to clean up inlined CSS styles when closing PL modal / code viewer panel ([a5be07b](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/a5be07b))
* **ui:**  fix keyboard shortcut for M link ([b4286ca](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/b4286ca))
* **uikit:** correct ishViewportRange logic ([365c626](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/365c626))
* **uikit:** remove indent from code panels ([e263fb0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/e263fb0))
* update PrismJS import ([564da7a](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/564da7a))
* update typeahead selector so styles work as expected ([da13765](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/da13765))
* workaround fix for the PL UIKit viewport resizer width occasionally getting stuck with a width of 0px in Safari and Firefox when the JS is initially booting up ([64c971d](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/64c971d))


### Features

* 1st pass wiring up automatic critical CSS generation to UIkit ([7a982d6](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/7a982d6))
* lay down prep work for adding full on service worker support to Pattern Lab's UI. Cache busting logic will likely need to get added but the overall setup being added pretty much works! ([c6051e3](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/c6051e3))
* wire up new PL-specific iframe loader toast to display before the JS updating the iframe content kicks in ([4cb08d5](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/4cb08d5))
* **package:** add test command which bails on error ([3118cac](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/3118cac))





<a name="1.0.0-alpha.7"></a>

# [1.0.0-alpha.7](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/compare/@pattern-lab/uikit-workshop@1.0.0-alpha.6...@pattern-lab/uikit-workshop@1.0.0-alpha.7) (2018-07-06)

### Features

* **package:** add npmrc file ([55f5bc2](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/55f5bc2))
* **package:** pin all dependencies ([415698e](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/415698e))
* **package:** remove package-lock.json files ([5ab3995](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/5ab3995))

<a name="1.0.0-alpha.6"></a>

# [1.0.0-alpha.6](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/compare/@pattern-lab/uikit-workshop@1.0.0-alpha.5...@pattern-lab/uikit-workshop@1.0.0-alpha.6) (2018-07-05)

### Features

* **tests:** use lerna run test at the monorepo level ([38a01b1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/38a01b1))

<a name="1.0.0-alpha.5"></a>

# [1.0.0-alpha.5](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/compare/@pattern-lab/uikit-workshop@1.0.0-alpha.4...@pattern-lab/uikit-workshop@1.0.0-alpha.5) (2018-05-04)

**Note:** Version bump only for package @pattern-lab/uikit-workshop

<a name="1.0.0-alpha.4"></a>

# [1.0.0-alpha.4](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/compare/@pattern-lab/uikit-workshop@1.0.0-alpha.3...@pattern-lab/uikit-workshop@1.0.0-alpha.4) (2018-03-21)

### Bug Fixes

* **lint:** run code through prettier ([ca52fde](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/ca52fde)), closes [#825](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/issues/825)
* **package:** remove files obsoleted by monorepo ([9abb8ac](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/9abb8ac))
* **package:** update LICENSE ([337aa32](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/337aa32))
* **polyfill:** Remove classList reference ([f0978da](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/f0978da))
* **README:** update content for consistency ([4edf0d4](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/4edf0d4)), closes [#815](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/issues/815)
* **README:** update installation command ([026e810](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/026e810))

### Features

* **package:** Add bower as an explicit dependency ([c070b80](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/c070b80))

<a name="1.0.0-alpha.3"></a>

# [1.0.0-alpha.3](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/compare/@pattern-lab/uikit-workshop@1.0.0-alpha.2...@pattern-lab/uikit-workshop@1.0.0-alpha.3) (2018-03-05)

### Bug Fixes

* **config:** Add npm registry to lerna config ([1473cd5](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/1473cd5))

<a name="1.0.0-alpha.2"></a>

# 1.0.0-alpha.2 (2018-03-02)

### Bug Fixes

* **packages:** Allow scoped publishing ([58beeb6](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/58beeb6))

### Features

* **packages:** Update all package.json repo and bug links ([5eb2c11](https://github.com/pattern-lab/patternlab-node/tree/master/packages/uikit-workshop/commit/5eb2c11))
