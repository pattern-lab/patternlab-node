# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.13.2](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.13.1...v5.13.2) (2020-11-12)

**Note:** Version bump only for package @pattern-lab/cli






## [5.13.1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.13.0...v5.13.1) (2020-09-06)

**Note:** Version bump only for package @pattern-lab/cli






# [5.13.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.12.0...v5.13.0) (2020-08-26)

**Note:** Version bump only for package @pattern-lab/cli






# [5.12.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.11.1...v5.12.0) (2020-08-09)

**Note:** Version bump only for package @pattern-lab/cli





## [5.11.1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.10.2...v5.11.1) (2020-06-28)

**Note:** Version bump only for package @pattern-lab/cli





# [5.11.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.10.2...v5.11.0) (2020-06-28)

**Note:** Version bump only for package @pattern-lab/cli





## [5.10.1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.10.0...v5.10.1) (2020-05-09)

**Note:** Version bump only for package @pattern-lab/cli





# [5.10.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.9.3...v5.10.0) (2020-05-09)

**Note:** Version bump only for package @pattern-lab/cli





## [5.9.3](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.9.2...v5.9.3) (2020-05-01)


### Bug Fixes

* **cli:** fix test script glob ([ff18eb5](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/ff18eb51ce24fc5423b009168e85ede366069139))






## [5.9.1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.9.0...v5.9.1) (2020-04-24)


### Bug Fixes

* **cli:** ensure specified directory exists prior to scaffold ([cc3b696](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/cc3b69624d486c94ee3b1f4b1bbb0334a514fa59))





# [5.9.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.8.0...v5.9.0) (2020-04-24)


### Bug Fixes

* **cli:** set current working directory before scaffolded npm init ([6d2186d](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/6d2186d8e8a74634198a4474ca8ae83221dd70a9))





# [5.7.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.6.0...v5.7.0) (2020-02-17)


### Features

* **cli:** make options more user friendly ([ad845b3](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/ad845b394ef81f90895ebb5bc6f12cc608e5e3d4))






# [5.4.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.3.3...v5.4.0) (2019-11-26)

**Note:** Version bump only for package @pattern-lab/cli





# [5.3.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.2.0...v5.3.0) (2019-11-13)

**Note:** Version bump only for package @pattern-lab/cli





# [5.1.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v5.0.2...v5.1.0) (2019-10-29)

**Note:** Version bump only for package @pattern-lab/cli





# [5.0.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/v3.0.0-beta.3...v5.0.0) (2019-10-25)


### Bug Fixes

* updates to fix eslint / prettier issues; update packages/core to reuse root .eslintrc.js file ([5b7a057](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/5b7a057d46ccd16b5832af1441030c7b76f237a8))
* **cli:** add custom install logic to edition-node ([f04fd26](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/f04fd266429cd806987dab747e6d69bff9b926a4))
* **cli:** allow any package to be installed as a starterkit ([d2aa1be](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/d2aa1be810a0a7473dcc52391a2263dacfdda0b8)), closes [#1067](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/issues/1067)
* **cli:** merge config arrays via overwrite instead of concatenate ([42e5f7b](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/42e5f7b42a26b4fc1f262c68ee4b474b546f2eac))
* **cli:** proper path resolution to helpers ([a18fe5e](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/a18fe5ef4d1c074a5eba8bfa255ebbee2261bf74))
* **cli:** re-order and clarify engines ([e39e301](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/e39e301a33306c6615fabf64262f1893ca682b97))
* **plugin:** correct spelling error and function locations ([d4abd88](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/d4abd88cb017550002407241b5045a2ad1adb1dc))


### Features

* **starterkits:** add starterkit-handlebars-demo ([384d2cf](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/384d2cfa3440c1e6f456d39f56ca6381f82f7689))


### BREAKING CHANGES

* **cli:** previously, we concatenated arrays, which is unlikely to be intended






## [1.0.3](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@1.0.2...@pattern-lab/cli@1.0.3) (2019-10-14)

**Note:** Version bump only for package @pattern-lab/cli






# [1.0.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.1.0...@pattern-lab/cli@1.0.0) (2019-08-23)


### Bug Fixes

* **cli:** merge config arrays via overwrite instead of concatenate ([42e5f7b](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/42e5f7b))
* **cli:** proper path resolution to helpers ([a18fe5e](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/a18fe5e))


### BREAKING CHANGES

* **cli:** previously, we concatenated arrays, which is unlikely to be intended





# [0.1.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.3...@pattern-lab/cli@0.1.0) (2019-08-23)


### Bug Fixes

* updates to fix eslint / prettier issues; update packages/core to reuse root .eslintrc.js file ([5b7a057](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/5b7a057))
* **cli:** add custom install logic to edition-node ([f04fd26](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/f04fd26))
* **cli:** re-order and clarify engines ([e39e301](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/e39e301))


### Features

* **starterkits:** add starterkit-handlebars-demo ([384d2cf](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/384d2cf))






## [0.0.3](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.3-alpha.0...@pattern-lab/cli@0.0.3) (2019-05-16)

**Note:** Version bump only for package @pattern-lab/cli





## [0.0.1-beta.2](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-beta.0...@pattern-lab/cli@0.0.1-beta.2) (2019-02-09)


### Bug Fixes

* **cli:** do not call build before serve ([663d8e1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/663d8e1)), closes [#917](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/issues/917)
* **cli:** pass watch options cleanly to core ([8bf186b](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/8bf186b))
* **cli:** remove copy-source-files ([64311a1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/64311a1)), closes [#833](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/issues/833)
* **nvmrc:** bump Node version ([36a917f](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/36a917f))
* manually bump package.json versions of packages published in September but with mismatched package.json versions ([98dfadf](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/98dfadf))


### Features

* **README:** simplify README and add CLI configuration instructions ([ceec673](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/ceec673))





<a name="0.0.1-beta.0"></a>
## [0.0.1-beta.0](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.23...@pattern-lab/cli@0.0.1-beta.0) (2018-09-07)


### Bug Fixes

* **cli:** set initialized to false during plugin installation ([88cce3f](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/88cce3f))
* **cli:** support scoped plugins ([4ae13ce](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/4ae13ce))
* **package:** update tap dependency ([2b70ff4](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/2b70ff4))





<a name="0.0.1-alpha.23"></a>

## [0.0.1-alpha.23](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.22...@pattern-lab/cli@0.0.1-alpha.23) (2018-07-09)

### Bug Fixes

* **install:** copy dependencies ([1acef87](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/1acef87))

<a name="0.0.1-alpha.22"></a>

## [0.0.1-alpha.22](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.21...@pattern-lab/cli@0.0.1-alpha.22) (2018-07-06)

**Note:** Version bump only for package @pattern-lab/cli

<a name="0.0.1-alpha.21"></a>

## [0.0.1-alpha.21](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.20...@pattern-lab/cli@0.0.1-alpha.21) (2018-07-06)

### Bug Fixes

* **install:** add break statements to install edition command ([3b1813c](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/3b1813c))
* **install:** use process to find package.json ([200c7cb](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/200c7cb))

### Features

* **package:** add npmrc file ([55f5bc2](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/55f5bc2))
* **package:** pin all dependencies ([415698e](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/415698e))
* **package:** remove package-lock.json files ([5ab3995](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/5ab3995))

<a name="0.0.1-alpha.20"></a>

## [0.0.1-alpha.20](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.19...@pattern-lab/cli@0.0.1-alpha.20) (2018-07-05)

### Bug Fixes

* **cli:** change whitespace to spaces per standard ([4556fc7](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/4556fc7))
* **tests:** change test command name similar to live-server until this passes CI ([5c39be1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/5c39be1))

### Features

* **serve:** change calling method ([3b86a0d](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/3b86a0d))
* **tests:** use lerna run test at the monorepo level ([38a01b1](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/38a01b1))

<a name="0.0.1-alpha.19"></a>

## [0.0.1-alpha.19](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.18...@pattern-lab/cli@0.0.1-alpha.19) (2018-05-19)

### Bug Fixes

* **cli:** change line-endings of cli entrypoint ([3fc86c2](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/3fc86c2))
* **wording:** reconcile Pattern Lab vs PatternLab ([f3d1e0d](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/f3d1e0d))

<a name="0.0.1-alpha.18"></a>

## [0.0.1-alpha.18](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.17...@pattern-lab/cli@0.0.1-alpha.18) (2018-05-04)

### Bug Fixes

* **version:** use static core method getVersion ([f9dcd4d](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/f9dcd4d))

<a name="0.0.1-alpha.17"></a>

## [0.0.1-alpha.17](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.16...@pattern-lab/cli@0.0.1-alpha.17) (2018-05-04)

### Bug Fixes

* **package:** update publish config and installation target ([27d2c8f](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/27d2c8f))

<a name="0.0.1-alpha.16"></a>

## [0.0.1-alpha.16](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.15...@pattern-lab/cli@0.0.1-alpha.16) (2018-05-04)

### Features

* **API:** standardize v() and version() into a single call ([6309e69](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/6309e69))

### BREAKING CHANGES

* **API:** change `version()` to return a string representation of the version, removing `v()`

<a name="0.0.1-alpha.15"></a>

## [0.0.1-alpha.15](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.14...@pattern-lab/cli@0.0.1-alpha.15) (2018-03-21)

### Features

* **package:** standardize and hoist common devDependencies ([7f4ce6f](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/7f4ce6f))

<a name="0.0.1-alpha.14"></a>

## [0.0.1-alpha.14](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/compare/@pattern-lab/cli@0.0.1-alpha.13...@pattern-lab/cli@0.0.1-alpha.14) (2018-03-05)

### Bug Fixes

* **config:** Add npm registry to lerna config ([1473cd5](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/1473cd5))

<a name="0.0.1-alpha.13"></a>

## 0.0.1-alpha.13 (2018-03-02)

### Features

* **cli:** Rename package ([9ea40d4](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli/commit/9ea40d4))
