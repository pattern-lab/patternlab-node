#!/usr/bin/env node
/* eslint-disable no-unused-vars */
'use strict';
const { Command } = require('commander');
const cli = new Command();
const path = require('path');
const build = require('./cli-actions/build');
const disable = require('./cli-actions/disable');
const enable = require('./cli-actions/enable');
const help = require('./cli-actions/help');
const version = require('./cli-actions/version');
const init = require('./cli-actions/init');
const install = require('./cli-actions/install');
const exportPatterns = require('./cli-actions/export');
const serve = require('./cli-actions/serve');
const { error, log } = require('./utils');
const pkg = require('../package.json');

// Register info and error logging
log.on('patternlab.error', (err) => console.log(err)); // eslint-disable-line
log.on('patternlab.info', (msg) => console.log(msg)); // eslint-disable-line

// Conditionally register verbose logging
const verboseLogs = () => log.on('patternlab.debug', (msg) => console.log(msg)); // eslint-disable-line

// Conditionally unregister all logging
const silenceLogs = () => {
  log.removeAllListeners('patternlab.debug');
  log.removeAllListeners('patternlab.info');
  log.removeAllListeners('patternlab.error');
};

// Split strings into an array
const list = (val) => val.split(',');

/**
 * Hook up cli version, usage and options
 */
cli
  .version(version(pkg), '-V, --version')
  .usage('<cmd> [options]')
  .arguments('<cmd> [options]');

/**
 * build
 * @desc Setup Pattern Lab's `build` cmd
 */
cli
  .command('build')
  .alias('compile')
  .description('Build Pattern Lab. Optionally (re-)build only the patterns')
  .option('-p, --patterns-only', 'Whether to only build patterns')
  .option('--watch', 'Start watching for changes')
  .action(build);

/**
 * export
 * @desc Export a Pattern Lab patterns into a compressed format
 */
cli
  .command('export')
  .description('Export Pattern Lab patterns into a compressed format')
  .action(exportPatterns);

/**
 * init
 * @desc Initialize a Pattern Lab project from scratch or import an edition and/or starterkit
 */
cli
  .command('init')
  .description(
    'Initialize a Pattern Lab project from scratch or import an edition and/or starterkit'
  )
  .option('-p, --project-dir <path>', 'Specify a project directory')
  .option('-e, --edition <name>', 'Specify an edition to install')
  .option('-k, --starterkit <name>', 'Specify a starterkit to install')
  .action(init);

/**
 * install
 * @desc Installs Pattern Lab related modules like starterkits or plugins
 */
cli
  .command('install')
  .alias('add')
  .description(
    'Installs Pattern Lab related modules like starterkits or plugins'
  )
  .option(
    '--starterkits <names>',
    'Specify one or more starterkit to install',
    list
  )
  .option('--plugins <names>', 'Specify one or more plugins to install', list)
  .action(install);

/**
 * enable
 * @desc Enable Pattern Lab plugins. Unavailable plugins are just skipped
 */
cli
  .command('enable')
  .alias('on')
  .description('Enable Pattern Lab plugins')
  .option('--plugins <names>', 'Specify one or more plugins to enable', list)
  .action(enable);

/**
 * disable
 * @desc Enable Pattern Lab plugins. Unavailable plugins are just skipped
 */
cli
  .command('disable')
  .alias('off')
  .description('Disable Pattern Lab plugins')
  .option('--plugins <names>', 'Specify one or more plugins to disable', list)
  .action(disable);

/**
 * serve
 * @desc Starts a server to inspect files in browser
 */
cli
  .command('serve')
  .alias('browse')
  .description('Starts a server to inspect files in browser')
  .option('--no-watch', 'Start watching for changes')
  .action(serve);

// Common options can be added manually after setting up program and subcommands.
// If the options are unsorted in the help, these will appear last.
cli.commands.forEach((command) => {
  command
    .option(
      '-c, --config <path>',
      'Specify config file. Default looks up the project dir',
      (val) => val.trim(),
      path.resolve(process.cwd(), 'patternlab-config.json')
    )
    .option('-v, --verbose', 'Show verbose console logs', verboseLogs)
    .option('--silent', 'Turn off console logs', silenceLogs);
});

// Show additional help
cli.on('--help', help);

/**
 * Catch all unsupported commands and delegate to the cli's help
 * Parse at the end because Node emit is immediate
 */
cli
  .on('*', () => {
    error(
      'Invalid command provided. See the help for available commands/options.'
    );
    cli.help();
  })
  .parse(process.argv);
