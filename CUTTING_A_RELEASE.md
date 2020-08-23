# How To Cut a Pattern Lab Release

We use a handful of tools to help automate and simplify the process of cutting a new Pattern Lab release. Namely: [Lerna](https://github.com/lerna/lerna) and [Auto](https://intuit.github.io/auto/)

## Release Prep

1. Make sure any/all the code ready to get released is merged down to the `dev` branch and all CI checks, etc are passing as expected

2. Git checkout the `dev` branch locally and make sure:
- You've run `yarn` to install the latest dependencies
- You don't have any local changes pending

```
git checkout dev
git pull
yarn
git status # confirm no pending changes
```

3. Before running the publish command, I also like to run the `build` command to be extra sure everything compiles fine locally (ex. Node.js version matches with the version of Sass that's installed, gotchas like that)

```
yarn build
```

4. You'll also want to make sure you have a `.env` file in your PL Node repo root (and create one if you don't)

You can grab the NPM + Github tokens needed here by heading to https://github.com/settings/tokens/new (grant repo access)  and https://www.npmjs.com/settings/NPM_USER/tokens 

```
## .env
export GH_TOKEN=PASTE_GITHUB_TOKEN_HERE
export NPM_TOKEN=PASTE_NPM_TOKEN_HERE
```

I personally like to use zsh's `env` plugin (already installed with Oh My ZSH) which has instructions for enabling here https://github.com/johnhamelink/env-zsh

> Pro tip: you can quickly check to see if your env variable tokens are available for these CLI commands by running `npx auto release --dry-run` which will throw an error if the tokens above can't be found!

5. Finally you'll also want to confirm that you're logged into your NPM account with access to publish to the Pattern Lab NPM org by running `npm login` and following the prompts.

## Cutting The Release

6. Run the `publish` command

Ok - with all that prep out of the way, the actual release process is pretty quick and should be super straightforward.

Simply run the `yarn run publish` command and include the type of SEMVER release you want to cut. 

So for example:

```
yarn run publish minor 

## alternatively you can include the exact version you want to publish
yarn run publish v5.14.0
```

Lerna should prompt you with a confirmation that the version about to get released matches up with what you expect ^

7. Manually (re)run the `auto release` command?

Ok, if everything built and published successfully, this final step may or may not be required... 

Normally the `auto release` command should run automatically after Lerna finishes publishing to NPM. This command will create the Github release associated with the latest Git tag, add any relevant release notes, and comment on related PRs, however the last couple of releases required this last step to get re-run manually.

Note that you'll need to replace the `from` and `use-version` version numbers to match the last previous Git tag and this next release getting cut.

```
npx auto release --from v5.11.1 --use-version v5.12.0
```

8. Confirm the [Github release](https://github.com/pattern-lab/patternlab-node/releases) was added and manually tweak any release notes as needed.
