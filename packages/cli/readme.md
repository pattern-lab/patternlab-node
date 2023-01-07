# Pattern Lab Node CLI

> Command-line interface (CLI) for the patternlab-node core.

[![Continuous Integration](https://github.com/pattern-lab/patternlab-node/actions/workflows/continuous-integration.yml/badge.svg?branch=dev)](https://github.com/pattern-lab/patternlab-node/actions/workflows/continuous-integration.yml)
[![CodeQL](https://github.com/pattern-lab/patternlab-node/actions/workflows/codeql-analysis.yml/badge.svg?branch=dev)](https://github.com/pattern-lab/patternlab-node/actions/workflows/codeql-analysis.yml)


## Installation
*Note: Global installs are currently not supported and will be fixed when the Pattern Lab core hits v3.0.0*

#### Via NPM
`npm install @pattern-lab/cli --save-dev`

#### Via Yarn
`yarn add @pattern-lab/cli --dev`

## Configuring Your Project to Use the CLI

If the CLI is installed globally, you may call commands directly, such as `patternlab --version`.

If the CLI is not installed globally, you need to tell `npm` where to find the executable when invoking commands.

Open `package.json` and add the following to your `scripts` object:

```diff
"scripts": {
+ "patternlab": "patternlab"
},
```
This tells `npm` to look in the local `node_modules/.bin` directory for the `patternlab` CLI.

Subcommands and options can then be forwarded to the CLI like this:

```bash
npm run patternlab -- serve
```

Installing [`edition-node`](https://github.com/pattern-lab/patternlab-node/tree/master/packages/edition-node) will add the following CLI commands for convenience:

```diff
  "scripts": {
+    "pl:build": "patternlab build --config ./patternlab-config.json",
+    "pl:help": "patternlab --help",
+    "pl:install": "patternlab install --config ./patternlab-config.json",
+    "pl:serve": "patternlab serve --config ./patternlab-config.json",
+    "pl:version": "patternlab --version"
  },
```

Then you can invoke any of these like this:

```
npm run pl:serve
```

## API & Usage
### General usage
```
Usage: patternlab <cmd> [options]
	Commands:
		build|compile [options]   Build Pattern Lab. Optionally (re-)build only the patterns
		export                    Export a Pattern Lab patterns into a compressed format
		init [options]            Initialize a Pattern Lab project from scratch or import an edition and/or starterkit
	    install|add [options]     Installs Pattern Lab related modules like starterkits or plugins
		serve|browse [options]    Starts a server to inspect files in browser

	Options:
		-h, --help           output usage information
		-V, --version        output the version number
		-c, --config <path>  Specify config file. Default looks up the project dir
		-v, --verbose        Show verbose logging
		--silent             Turn off console logs
```

### Build/Compile Pattern Lab
```
Usage: build|compile [options]

Build Pattern Lab. Optionally (re-)build only the patterns

	Options:
		-h, --help           output usage information
		-p, --patterns-only  Whether to only build patterns
```

### Initialize Pattern Lab
```
Usage: init [options]

Initialize a Pattern Lab project from scratch or import an edition and/or starterkit
Passing no options starts the init in interactive mode

	Options:
		-h, --help                output usage information
		-p, --project-dir <path>  Specify a project directory. Default: ./
		-e, --edition <name>      Specify an edition to install. Default: @pattern-lab/edition-node
		-k, --starterkit <name>   Specify a starterkit to install. Default: @pattern-lab/starterkit-handlebars-demo
```

### Serve Pattern Lab
```
Usage: serve|browse [options]

Starts a server to inspect files in browser


	Options:
		-h, --help   output usage information
		-w, --watch  Start watching for changes
```

### Export Pattern Lab
```
Usage: export [options]

Export a Pattern Lab patterns into a compressed format

	Options:
		-h, --help  output usage information
```

### Install Pattern Lab starterkits or plugins
```
Usage: install|add [options]

Installs Pattern Lab related modules like starterkits or plugins

	Options:
		-h, --help             output usage information
		--starterkits <names>  Specify one or more starterkits to install
		--plugins <names>      Specify one or more plugins to install

```

## Examples
```
    $ patternlab init # Initialize a Pattern Lab project.
    $ patternlab build # Builds Pattern Lab from the current dir
    $ patternlab build --config <path/to/patternlab-config> # Builds Pattern Lab from different project directory
```
## License
MIT © [Patternlab contributors](https://github.com/pattern-lab/patternlab-node/blob/master/CODEOWNERS)
