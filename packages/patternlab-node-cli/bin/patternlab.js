#!/usr/bin/env node
'use strict';
const cli = require('commander');
const build = require('./cli-actions/build');
const help = require('./cli-actions/help');
const init = require('./cli-actions/init');
const exportPatterns = require('./cli-actions/export');
const serve = require('./cli-actions/serve');
const error = require('./utils').error;
const log = require('./utils').log;
const pkg = require('../package.json');

// Register error logging
log.on('patternlab.error', err => console.log(err)); // eslint-disable-line

// Conditionally register verbose logging
const verboseLogs = verbose => log.on('patternlab.debug', msg => console.log(msg)); // eslint-disable-line

// Conditionally unregister all logging
const silenceLogs = () => {
	log.removeAllListeners('patternlab.debug');
	log.removeAllListeners('patternlab.error');
};

/**
 * Hook up cli version, usage and options
 */
cli
	.version(pkg.version, '-V, --version')
	.usage('<cmd> [options]')
	.arguments('<cmd> [options]')
	.option('-c, --config <path>', 'Specify config file. Default looks up the project dir', val => val.trim(), './patternlab-config.json')
	.option('-v, --verbose', 'Show verbose console logs', verboseLogs)
	.option('--silent', 'Turn off console logs', silenceLogs);

/**
 * build
 * @desc Setup patternlab's `build` cmd
 */
cli
	.command('build')
	.alias('compile')
	.description('Build the PatternLab. Optionally (re-)build only the patterns')
	.option('-p, --patterns-only', 'Whether to only build patterns')
	.action(build);

/**
 * export
 * @desc Export a PatternLab patterns into a compressed format
 */
cli
	.command('export')
	.description('Export a PatternLab patterns into a compressed format')
	.action(exportPatterns);

/**
 * init
 * @desc Initialize a PatternLab project from scratch or import an edition and/or starterkit
 */
cli
	.command('init')
	.description('Initialize a PatternLab project from scratch or import an edition and/or starterkit')
	.option('-p, --project-dir <path>', 'Specify a project directory')
	.option('-e, --edition <name>', 'Specify an edition to install')
	.option('-k, --starterkit <name>', 'Specify a starterkit to install')
	.action(init);

/**
 * serve
 * @desc Starts a server to inspect files in browser
 */
cli
	.command('serve')
	.alias('browse')
	.description('Starts a server to inspect files in browser')
	.action(serve);

// Show additional help
cli.on('--help', help);

/**
 * Catch all unsupported commands and delegate to the cli's help
 * Parse at the end because Node emit is immediate
 */
cli
	.on('*', () => {
		error('Invalid command provided. See the help for available commands/options.');
		cli.help();
	})
	.parse(process.argv);

