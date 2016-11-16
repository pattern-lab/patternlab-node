#!/usr/bin/env node
'use strict';
const cli = require('commander');
const build = require('./build');
const checkArgs = require('./check_args');
const copyFiles = require('./copy_source_files');
const exportPatterns = require('./export');
const init = require('./init');
const resolveConfig = require('./resolve_config');
const serve = require('./serve');
const log = require('./utils').log;
const error = require('./utils').error;
const wrapAsync = require('./utils').wrapAsync;
const pkg = require('../package.json');

// Register error logging
log.on('error', msg => console.log(msg)); // eslint-disable-line

const registerDebugLogger = () => {
	log.on('debug', msg => console.log(msg)); // eslint-disable-line
};

/**
 * Hook up cli version, usage and options
 */
cli
	.version(pkg.version, '-V, --version')
	.usage('<cmd> [options]')
	.arguments('<cmd> [options]')
	.action(function (cmd) {
		checkArgs(cmd);
	})
	.option('-c, --config <path>', 'Specify config file. Default looks up the project dir', val => val.trim(), './patternlab-config.json')
	.option('-v, --verbose', 'Show verbose logging');

/**
 * build
 * @desc Setup patternlab's `build` cmd
 */
cli
	.command('build')
	.alias('compile')
	.description('Build the PatternLab. Optionally (re-)build only the patterns')
	.option('-p, --patterns-only', 'Whether to only build patterns')
	.action(options => wrapAsync(function*() {
		try {
			if (options.parent.verbose) registerDebugLogger();
			const config = yield resolveConfig(options.parent.config);
			yield copyFiles(config.paths);
			build(config, options);
		} catch (err) {
			error(err);
			process.exit(1);
		}
	}));

/**
 * export
 * @desc Export a PatternLab patterns into a compressed format
 */
cli
	.command('export')
	.description('Export a PatternLab patterns into a compressed format')
	.action(options => wrapAsync(function*() {
		if (options.parent.verbose) registerDebugLogger();
		const config = yield resolveConfig(options.parent.config);
		exportPatterns(config);
	}));

/**
 * init
 * @desc Initialize a PatternLab project from scratch or import an edition and/or starterkit
 */
cli
	.command('init')
	.description('Initialize a PatternLab project from scratch or import an edition and/or starterkit')
	.option('-f, --force', 'Overwrite existing files and folders')  // TODO: Make a global --clean flag to avoid repetition
	.action(options => wrapAsync(function*() {
		if (options.parent.verbose) registerDebugLogger();
		yield init(options);
	}));

/**
 * serve
 * @desc Starts a server to inspect files in browser
 */
cli
	.command('serve')
	.alias('browse')
	.description('Starts a server to inspect files in browser')
	.action(options => wrapAsync(function*() {
		if (options.parent.verbose) registerDebugLogger();
		const config = yield resolveConfig(options.parent.config);
		serve(config);
	}));

// Show additional help
cli.on('--help', () => {
	/* eslint-disable */
	console.log('  Examples:');
	console.log('');
	console.log('    $ patternlab init # Initialize a PatternLab project.');
	console.log('    $ patternlab <cmd> # Builds the PatternLab from the current dir');
	console.log('    $ patternlab <cmd> --config <path/to/patternlab-config> # PatternLab from a config in a specified directory');
	console.log('');
	/* eslint-enable */
});

// Parse at the end because Node emit is immediate
cli.parse(process.argv);

