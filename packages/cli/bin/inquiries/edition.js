'use strict';
const inquirer = require('inquirer');

/** editionSetup {Array} - Inquirer question logic for first question regarding editions */
const editionSetup = [
	{
		type: 'input',
		name: 'project_root',
		message: 'Please specify a directory for your PatternLab project.',
		default: () => './'
	},
	{
		type: 'list',
		name: 'edition',
		message: 'Which edition do you want to use (defaults to edition-node)?',
		choices: [{
			name: 'edition-node',
			value: 'edition-node'
		}, {
			name: 'edition-node-grunt',
			value: 'edition-node-grunt'
		}, {
			name: 'edition-node-gulp',
			value: 'edition-node-gulp'
		},
			new inquirer.Separator(),
			{
				name: 'None',
				value: false
			}
		],
		default: function () {
			return {
				name: 'edition-node',
				value: 'edition-node'
			}
		}
	}];

module.exports = editionSetup;
