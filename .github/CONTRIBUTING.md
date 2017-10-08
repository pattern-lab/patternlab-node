Contributing to Pattern Lab Node
================================

If you'd like to contribute to Pattern Lab Node, please do so! There is always a lot of ground to cover and something for your wheelhouse.

No pull request is too small. Check out any [up for grabs issues](https://github.com/pattern-lab/patternlab-node/labels/up%20for%20grabs) as a good way to get your feet wet, or add some more unit tests.

## Developing Locally

The best way to make changes to the Pattern Lab Node core and test them is through your existing edition.

* Fork this repository on Github.
* Create a new branch in your fork and push your changes in that fork.
* `npm install`
* `npm link`
* `cd /path/to/your/edition`
* `npm link patternlab-node`


Guidelines
----------

* _ALWAYS_ submit pull requests against the [dev branch](https://github.com/pattern-lab/patternlab-node/tree/dev). If this does not occur, I will first, try to redirect you gently, second, port over your contribution manually if time allows, and/or third, close your pull request. If you have a major feature to stabilize over time, talk to @bmuenzenmeyer via an issue about making a dedicated `feature-branch`
* Please keep your pull requests concise and limited to **ONE** substantive change at a time. This makes reviewing and testing so much easier.
* Commits should reference the issue you are adressing. For any Pull Request that you send, use the template provided.
* If you can, add some unit tests using the existing patterns in the `./test` directory
* Large enhancements should begin with opening an issue. This will result in a more systematic way for us to review your contribution and determine if a [specifcation discussion](https://github.com/pattern-lab/the-spec/issues) needs to occur.
* Please mention the issue number in commits if you can, so anyone can see to which issue your changes belong to. For instance:
	-	`#123 Fix resolving patterns in pattern_hunter`
	-	`Feature #42: improve improbability drive`

Coding style
------------

Two files combine within the project to define and maintain our coding style.

-	The `.editorconfig` controls spaces / tabs within supported editors. Check out their [site](http://editorconfig.org/).
-	The `.eslintrc` defines our javascript standards. Some editors will evaluate this real-time - otherwise it's run using `grunt|gulp build`

Branching Scheme
----------------

![alt text](branching-scheme.png) While actively maintaining `2.X` on `master`, there is heavy development going on for Patternlab `3.X`. Currently Pattern Lab has the following branches:

-	**master** contains the latext stable, released `2.X` version</dd>
-	**dev**: for `2.X` development. Please target pull requests against this branch
-	**dev-3.0** Development branch for version `3.0`. Pattern Lab has undergone some major changes and the source trees have diverged a lot and we will try to forward-port any changes made in `2.X`
-	**feature-branches** for larger changes. Allows merging all changes into both `2.X` and `3.X` easily.
-	**long running branches** for changes that involve major changes to the code, architecture and take a lot of time (i.e. making Pattern Lab async)

Development mainly happens in the `dev` branch, but you can help us a lot if you also do a pull request against `dev-3.0`. When `dev` seems stable enough, we do releases of `2.X` by merging `dev` to `master` and creating a release tag.

Feature branches may target either `dev` and/or `dev-3.0` and should be updated regularly.

Long running branches should only target the latest version of Pattern Lab, currently `dev-3.0`, and may be lagging behind a lot.

If you have any questions or you would like to help, feel free to ask on [our Gitter.im](https://gitter.im/pattern-lab/node-team)
