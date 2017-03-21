'use strict';
const inquirer = require('inquirer');
/** starterkitSetup {Array} - Inquirer question logic for regarding starterkits */
const starterkitSetup = [{
	type: 'list',
	name: 'starterkit',
	message: 'Which starterkit do you want to use?',
	choices: [
		{
			name: 'starterkit-mustache-demo',
			value: 'starterkit-mustache-demo'
		},
		{
			name: 'starterkit-mustache-bootstrap',
			value: 'starterkit-mustache-bootstrap'
		},
		{
			name: 'starterkit-mustache-foundation',
			value: 'starterkit-mustache-foundation'
		},
		{
			name: 'starterkit-twig-base',
			value: 'starterkit-twig-base'
		},
		{
			name: 'starterkit-twig-demo',
			value: 'starterkit-twig-demo'
		},
		{
			name: 'starterkit-mustache-materialdesign',
			value: 'starterkit-mustache-materialdesign'
		},
		{
			name: 'starterkit-twig-drupal-demo',
			value: 'starterkit-twig-drupal-demo'
		},
		{
			name: 'starterkit-twig-drupal-minimal',
			value: 'starterkit-twig-drupal-minimal'
		},
		{
			name: 'starterkit-mustache-webdesignday',
			value: 'starterkit-mustache-webdesignday'
		},
		{
			name: 'starterkit-mustache-base',
			value: 'starterkit-mustache-base'
		},
		new inquirer.Separator(),
		{
			name: 'None',
			value: false
		}],
	default: {
		name: 'starterkit-mustache-base',
		value: 'starterkit-mustache-base'}
}];
module.exports = starterkitSetup;
