# PatternLab Node CLI

> Command-line interface (CLI) for the patternlab-node core.

[![Build Status](https://travis-ci.org/pattern-lab/patternlab-node-cli.svg?branch=master)](https://travis-ci.org/pattern-lab/patternlab-node-cli)


## Installation
`npm install pattern-lab/patternlab-node-cli`

## Getting Started
1. In order to use PatternLab you need to initialize a PatternLab project with `patternlab init`. The CLI will ask you some setup question and scaffold your project based on it.
2. Build your patterns use `patternlab build`. The PatternLab CLI will assume that the `patternlab-config.json` is in the project root. Othewise specify a custom path to config with `patternlab build --config path/to/config`
3. To view your patterns in the browser preview `patternlab serve` or again specify a custom config location `patternlab serve --config path/to/config`
4. To export your patterns in the browser preview `patternlab export` or again specify a custom config location `patternlab export --config path/to/config`

## API & Usage
```
Usage: patternlab <cmd> [options]
	Commands:
		build|compile [options]   Build the PatternLab. Optionally (re-)build only the patterns
		export                    Export a PatternLab patterns into a compressed format
		init [options]            Initialize a PatternLab project from scratch or import an edition and/or starterkit
		serve|browse              Starts a server to inspect files in browser
	
	Options:
		-h, --help                output usage information
		-V, --version             output the version number
		-c, --config <path>       Specify config file. Default looks up the project dir
```
## Examples
```
    $ patternlab init # Initialize a PatternLab project.
    $ patternlab build # Builds PatternLab from the current dir
    $ patternlab build --config <path/to/patternlab-config> # Builds PatternLab from different project directory
```
## License
MIT © [Raphael Okon](https://github.com/raphaelokon)
