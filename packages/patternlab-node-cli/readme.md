# PatternLab Node CLI

> Command-line interface (CLI) for the patternlab-node core.

## Installation
Coming soon …

## Usage
```bash
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
```bash
    $ patternlab init # Initialize a PatternLab project.
    $ patternlab <cmd> # Builds the PatternLab from the current dir
    $ patternlab <cmd> --config <path/to/patternlab-config> # PatternLab from a config in a specified directory
```
## License
MIT © [Raphael Okon](https://github.com/raphaelokon)
