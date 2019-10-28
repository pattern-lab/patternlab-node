# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.2](https://github.com/pattern-lab/patternlab-node/compare/v5.0.1...v5.0.2) (2019-10-28)


### Bug Fixes

* **uikit-workshop:** add template files to published bundle ([9005fce](https://github.com/pattern-lab/patternlab-node/commit/9005fcee9e129fb41d509f706195e1437bddc710))
* **uikit-workshop:** add webpack config to published bundle ([060a573](https://github.com/pattern-lab/patternlab-node/commit/060a573cbddce9ee3d270d39337d0c8cac8372fa))





## [5.0.1](https://github.com/pattern-lab/patternlab-node/compare/v5.0.0...v5.0.1) (2019-10-28)


### Bug Fixes

* add missing “dist” folder to array of files / folders published to NPM ([8829429](https://github.com/pattern-lab/patternlab-node/commit/88294296c438352570befd2eb6b9e1ca2ae3b750))





# [5.0.0](https://github.com/pattern-lab/patternlab-node/compare/v3.0.0-beta.3...v5.0.0) (2019-10-25)


### Bug Fixes

* **1049:** Treat folders like patterns only if they're subfolders of pattern groupings ([4eb79ab](https://github.com/pattern-lab/patternlab-node/commit/4eb79ab48b335a35b2e5ed3b7053974b8e8bb6b6))
* **cli:** add custom install logic to edition-node ([f04fd26](https://github.com/pattern-lab/patternlab-node/commit/f04fd266429cd806987dab747e6d69bff9b926a4))
* **cli:** allow any package to be installed as a starterkit ([d2aa1be](https://github.com/pattern-lab/patternlab-node/commit/d2aa1be810a0a7473dcc52391a2263dacfdda0b8)), closes [#1067](https://github.com/pattern-lab/patternlab-node/issues/1067)
* **cli:** merge config arrays via overwrite instead of concatenate ([42e5f7b](https://github.com/pattern-lab/patternlab-node/commit/42e5f7b42a26b4fc1f262c68ee4b474b546f2eac))
* **cli:** proper path resolution to helpers ([a18fe5e](https://github.com/pattern-lab/patternlab-node/commit/a18fe5ef4d1c074a5eba8bfa255ebbee2261bf74))
* **cli:** re-order and clarify engines ([e39e301](https://github.com/pattern-lab/patternlab-node/commit/e39e301a33306c6615fabf64262f1893ca682b97))
* **core:** allow plugin resolution to follow normal algorithm ([3f6b83b](https://github.com/pattern-lab/patternlab-node/commit/3f6b83be080c88aec1d8b73bececb76f0f57a79d))
* **core:** find plugins from config only and with simpler args ([fe7351c](https://github.com/pattern-lab/patternlab-node/commit/fe7351cba346425512cbb2ef3a1b7728ab06ae60))
* **deploy:** add setup command ([74dd314](https://github.com/pattern-lab/patternlab-node/commit/74dd3142bf48873a9f1ec4e8dccb8aa2fef9001d))
* **engine_twig_php:** Pseudo patterns Twig PHP ([226aa8b](https://github.com/pattern-lab/patternlab-node/commit/226aa8bbaaf5e418530ccf54a28f6c5657ee6dea)), closes [#1045](https://github.com/pattern-lab/patternlab-node/issues/1045)
* **engine_twig_php:** Twig incremental rebuilds ([1ade945](https://github.com/pattern-lab/patternlab-node/commit/1ade9451840b2645706a0b01129e2b697dc22d4b)), closes [#1015](https://github.com/pattern-lab/patternlab-node/issues/1015)
* **engine_twig_php:** Twig incremental rebuilds ([5d33f24](https://github.com/pattern-lab/patternlab-node/commit/5d33f24f156ebe50900701513a855de7de608dcf)), closes [#1015](https://github.com/pattern-lab/patternlab-node/issues/1015)
* **lerna:** typo in config ([525a47b](https://github.com/pattern-lab/patternlab-node/commit/525a47b51fba91c1bf5b7439735f48eb7dfa073e))
* **lint:** Use const instead of var ([ad1e782](https://github.com/pattern-lab/patternlab-node/commit/ad1e782ef71295eb610f56d019eaa35499fb3f85))
* **plugin:** correct spelling error and function locations ([d4abd88](https://github.com/pattern-lab/patternlab-node/commit/d4abd88cb017550002407241b5045a2ad1adb1dc))
* **plugin-tab:** bump lodash from 4.17.5 to 4.17.15 in /packages/plugin-tab ([#1081](https://github.com/pattern-lab/patternlab-node/issues/1081)) ([3f89dda](https://github.com/pattern-lab/patternlab-node/commit/3f89dda1685874e251f9777f969c0943e0080881))
* **plugin-tab:** handle params correctly ([d248993](https://github.com/pattern-lab/patternlab-node/commit/d2489939bb0db1a1d67b0e7f47dfb1838b88b0a0))
* **starterkit:** add css output and build command ([ccb2d35](https://github.com/pattern-lab/patternlab-node/commit/ccb2d3569b741220324a3fa738ab3d4d2eb97ffe))
* add better pre-rendering support ([8ecd615](https://github.com/pattern-lab/patternlab-node/commit/8ecd6159a89232f42e0a9dc3c688b6e21de8fc30))
* add eslint fixes ([00d7bbe](https://github.com/pattern-lab/patternlab-node/commit/00d7bbe319ea77a6ee8cc9cd0348856feaaf13ad))
* add missing @babel/runtime package to address silent error getting thrown on Travis ([1918d04](https://github.com/pattern-lab/patternlab-node/commit/1918d042d7e90cc8aaa2fdfcd8649961c0a5dd50))
* add missing preact-render-to-string library ([881296a](https://github.com/pattern-lab/patternlab-node/commit/881296a2c256424beac28bd560c5b1a5e1fed005))
* add repo info to root package.json so Auto knows what repo to configure for ([85142e8](https://github.com/pattern-lab/patternlab-node/commit/85142e8e94549edd7980459e5975d0639c34864d))
* address unrelated eslint errors from PL core ([6ada00d](https://github.com/pattern-lab/patternlab-node/commit/6ada00d396eb436837f7453664bfa50522a2ec10))
* correct typo in build logging ([96d989f](https://github.com/pattern-lab/patternlab-node/commit/96d989f8869630ba9f59705bfca66755f20e35ab))
* fall back to seeing the current pattern's query string to `all` or the defaultPattern value if undefined when the iframe page initially loads ([a368459](https://github.com/pattern-lab/patternlab-node/commit/a3684590fca02cf96b99421b87a0ad0a711893ad))
* fix incorrect Webpack version in package.json ([9788e89](https://github.com/pattern-lab/patternlab-node/commit/9788e8977921e31fe43f2a1ec19d4684dd4709c5))
* fix issue with viewport height exceeding the space available ([95cd1cf](https://github.com/pattern-lab/patternlab-node/commit/95cd1cfa57f086ecb84ac2e996ecda81f0c6a1a6))
* fix Prism.js typo so languages not found / supported don't throw a JS error ([a8c19f9](https://github.com/pattern-lab/patternlab-node/commit/a8c19f9f9b11d4abbdcd9e573fb0cb418d665660))
* fix Twig Edition examples by adding missing Twig namespaces to config ([b4c20ef](https://github.com/pattern-lab/patternlab-node/commit/b4c20ef88ee0d3010760584c6f05ff7f92b711a6))
* minor CSS fixes + fresh prod build ([8ac2c1f](https://github.com/pattern-lab/patternlab-node/commit/8ac2c1fa1c7558ed2ac50755f599a438d682ee2a))
* re-enable displaying the top level `All` link if PL isn't configured to hide this specific link in the ishControlsHide config option. Addresses [#1048](https://github.com/pattern-lab/patternlab-node/issues/1048) ([6bb4e1a](https://github.com/pattern-lab/patternlab-node/commit/6bb4e1ac6f38b47f93030c8c5bca62d5db2132e4))
* re-enable using the defaultPattern config for the initial iframe page load if defined ([d645ea1](https://github.com/pattern-lab/patternlab-node/commit/d645ea15150061d7ad13741d2dc37b12b9786411))
* regenerate fresh UIKit build after fixing main JS issues ([9ea34d2](https://github.com/pattern-lab/patternlab-node/commit/9ea34d2efe43cafacb3729ac113121ba51126344))
* Rename Handlebars and Nunjucks extension setting to "extend" ([74e5af2](https://github.com/pattern-lab/patternlab-node/commit/74e5af28c4e714fdfc1db535b94c52f3dc14a3a4))
* squashing minor UI bugs ([a8a606c](https://github.com/pattern-lab/patternlab-node/commit/a8a606cfb224f7041f53ff5026a84e13fa17914c))
* temporarily disable Random and Disco viewport controls until the full JS logic for these is re-enabled ([14b9a19](https://github.com/pattern-lab/patternlab-node/commit/14b9a19e4dee9462f3784eae28066893cc893624))
* temporarily downgrade Preact version so tooltip used for displaying viewport sizes renders correctly ([52dcf85](https://github.com/pattern-lab/patternlab-node/commit/52dcf85e756ee171ca993288d98f5b5ef9a0a24b))
* update autoprefixer browserslist config to address warning messages ([5e52f2b](https://github.com/pattern-lab/patternlab-node/commit/5e52f2b0ed02e2002ca867368636c3c0dc79ff0a))
* update initial PL iframe path default ([a26fbb9](https://github.com/pattern-lab/patternlab-node/commit/a26fbb956e13901d1751c435b76de65637191ca4))
* update Javascript to address merge conflict issue with previous PR merge / recent release ([cf2ecc1](https://github.com/pattern-lab/patternlab-node/commit/cf2ecc154383c3e8abd56dc88484370bc58ac30b))
* update styles for pattern state dots ([7728acc](https://github.com/pattern-lab/patternlab-node/commit/7728accc9a6e5cd83be451f7d74e522dfe721cad))
* update the default pattern that displays in the Handlebars demo ([ff1d85f](https://github.com/pattern-lab/patternlab-node/commit/ff1d85f2852fc4f210841e8e0aaf14b55165ce58))
* **starterkit:** remove config file ([f90e38a](https://github.com/pattern-lab/patternlab-node/commit/f90e38aa873dcff0dd08fe4dabc3b71bf95080b6))
* **starterkit:** use handlebars meta files ([d8f5e12](https://github.com/pattern-lab/patternlab-node/commit/d8f5e12471bd783bd3755626701ecc17669fc761))
* updates to address eslint / prettier issues ([d945acc](https://github.com/pattern-lab/patternlab-node/commit/d945acc13b8e4e36f3815b017fbc12266c323d1f))
* updates to fix eslint / prettier issues; update packages/core to reuse root .eslintrc.js file ([5b7a057](https://github.com/pattern-lab/patternlab-node/commit/5b7a057d46ccd16b5832af1441030c7b76f237a8))
* use 100% of the screen available when JS is disabled / the first time the iframe loads up ([c0c5bff](https://github.com/pattern-lab/patternlab-node/commit/c0c5bff7a63b157d5b81dc2bcecee9e732ecfd4e))
* **uikit:** clear out "404" responses when loading tabs ([73874b1](https://github.com/pattern-lab/patternlab-node/commit/73874b1b0b66ca6425c2b74331d417efdb529e2e))
* **uikit-workshop:** fix merge problem ([d245b3b](https://github.com/pattern-lab/patternlab-node/commit/d245b3bca044c29f281052bf2feb95eeffafcf6b))


### Features

* **core:** invoke registered plugin hooks ([a54d775](https://github.com/pattern-lab/patternlab-node/commit/a54d7753b6939fe6a58da543f4fb34f64dd8901a))
* **edition-node:** switch to engine-handlebars ([b481e22](https://github.com/pattern-lab/patternlab-node/commit/b481e22dc1f41ddd4da709621640a15190fba257))
* **engine-handlebars:** Default location for helpers, like engine-nunjucks ([11c4180](https://github.com/pattern-lab/patternlab-node/commit/11c41805e0c3dbebb7109719c4f3c780d32feab5))
* **engine-handlebars:** Demonstration of custom Handlebars helper ([f330b5b](https://github.com/pattern-lab/patternlab-node/commit/f330b5bca72f2f34bfafe5c2c64e6b0b8823eb1c))
* **engine-handlebars:** Document the Helpers feature ([a01e040](https://github.com/pattern-lab/patternlab-node/commit/a01e040429a7f77dfeb28d67c690e835b97881de))
* **engine-handlebars:** Load Handlebars helpers specified in the config ([a12df36](https://github.com/pattern-lab/patternlab-node/commit/a12df36d2a644dfac8ded1dfd94b987e99c29d79))
* **engine-nunjucks:** Configurable extension locations; Use usePatternlabConfig() ([e54e3b3](https://github.com/pattern-lab/patternlab-node/commit/e54e3b3d48f934d3a4d44b9f4ff262f742a4aaf9))
* **engine-react:** set package to private ([3aea881](https://github.com/pattern-lab/patternlab-node/commit/3aea8815f19df5b527cdda0b75cf99a9a8c3bc1e))
* **plugin-tab:** pivot to using hook functions ([d4b2598](https://github.com/pattern-lab/patternlab-node/commit/d4b25984fc2a2646cc1876a5c635f57593c35f09))
* **plugin-tab, core:** initial plugin hook exploration ([2f3d39a](https://github.com/pattern-lab/patternlab-node/commit/2f3d39ac6b125ad4c6b872e27ee224ce2ea33a12))
* **starterkits:** add starterkit-handlebars-demo ([384d2cf](https://github.com/pattern-lab/patternlab-node/commit/384d2cfa3440c1e6f456d39f56ca6381f82f7689))
* **uikit-workshop:** add plugin-loader ([fc966d6](https://github.com/pattern-lab/patternlab-node/commit/fc966d6b151e24055bc2f4146d6a90b5fb392765))
* introduce netlify preview ([6c5d332](https://github.com/pattern-lab/patternlab-node/commit/6c5d332479fb6836bd8bd5530a074d13440f8ae4))
* remove pre-built uikit dist folder and switch to auto-building when bootstrapping OR when publishing to NPM ([b5dd553](https://github.com/pattern-lab/patternlab-node/commit/b5dd5538ee00ddf1da321851865fa1c223cedb43))
* switch to Yarn + Yarn workspaces ([f4c4ec3](https://github.com/pattern-lab/patternlab-node/commit/f4c4ec33cd30d372c87ffa904fbe7d5b819ee14e))
* update Node to v12 ([fcbb970](https://github.com/pattern-lab/patternlab-node/commit/fcbb970648cdd775c9a88078f14c1f24c5b62d73))


### Reverts

* don't flatten folders containing only one item inside ([77f1f46](https://github.com/pattern-lab/patternlab-node/commit/77f1f46595328bd96fba46347b532295c65802d1))


### BREAKING CHANGES

* **core:** plugins now use async functions instead of events
* **plugin-tab:** event based listeners replaced with functions
* **cli:** previously, we concatenated arrays, which is unlikely to be intended
* **edition-node:** use handlebars over mustache
