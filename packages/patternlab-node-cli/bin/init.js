'use strict';

const inquirer = require('inquirer');
const path = require('path');
const sanitiseFilename = require('sanitize-filename');
const exists = require('path-exists');
const scaffold = require('./generator').scaffold;
const replaceConfigPaths = require('./generator').replaceConfigPaths;
const defaultPatternlabConfig = require('./generator').defaultPatternlabConfig;
const debug = require('./utils').debug;
const error = require('./utils').error;
const wrapsAsync = require('./utils').wrapAsync;
const copyAsync = require('./utils').copyAsync;
const writeJsonAsync = require('./utils').writeJsonAsync;
const checkAndInstallPackage = require('./utils').checkAndInstallPackage;

const ask = inquirer.prompt;

/**
 * @func init
 * @desc Initiates a PatternLab project by getting user input through inquiry. Scaffolds the project and download mandatory files
 * @param {object} options - Options passed in from CLI
 * @param {boolean} options.force - Flag whether to force install in existing project directory. May overwrite stuff.
 */
const init = options => wrapsAsync(function*() {
	const forceFlag = options.force;
	
	/**
	 * Enum holding installation modes.
	 * @type {{NONE: Symbol}}
	 */
	const Install = {
		NONE: Symbol('CUSTOM')
	};
	
	/**
	 * @func checkOverwrites
	 * @desc Checks whether a path exists and if it should be replaced.
	 * @param {string} input - User input from inquirer.
	 * @param {boolean} forceFlag - User input from inquirer.
	 * @return {boolean} - Returns true if all went good.
	 */
	function checkOverwrites(input, forceFlag) {
		// Checks if project root exists to avoid overwriting.
		const inputPath = path.resolve(input);
		if (exists.sync(inputPath) && !forceFlag) {
			// TODO: We might wanna add some more checks here. Currently CLI only displays a warning.
			debug(`\n patternlab→init: The directory (${inputPath}) already exists and is not empty. Proceed on your own risk.`);
		}
		return true;
	}
	
	/** editionSetup {Array} - Inquirer question logic for first question regarding editions */
	const editionSetup = [
		{
			type: 'input',
			name: 'project_root',
			message: 'Please specify a directory for your PatternLab project.',
			default: () => './',
			validate: input => checkOverwrites(input, forceFlag)
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
					value: Install.NONE
				}
			],
			default: function () {
				return {
					name: 'edition-node',
					value: 'edition-node'
				}
			}
		}];
	
	/** starterkitSetup {Array} - Inquirer question logic for regarding starterkits */
	const starterkitSetup = [{
		type: 'list',
		name: 'starterkit',
		message: 'Which starterkit do you want to use?',
		choices: [
			{
				name: 'None',
				value: Install.NONE
			},
			new inquirer.Separator(),
			{
				name: 'starterkit-mustache-bootstrap',
				value: {
					'name': 'starterkit-mustache-bootstrap',
					'url': 'https://github.com/pattern-lab/starterkit-mustache-bootstrap'
				}
			}, {
				name: 'starterkit-mustache-demo',
				value: {
					'name': 'starterkit-mustache-demo',
					'url': 'https://github.com/pattern-lab/starterkit-mustache-demo'
				}
			}, {
				name: 'starterkit-mustache-foundation',
				value: {
					'name': 'starterkit-mustache-foundation',
					'url': 'https://github.com/pattern-lab/starterkit-mustache-foundation'
				}
			}, {
				name: 'starterkit-twig-base',
				value: {
					'name': 'starterkit-twig-base',
					'url': 'https://github.com/pattern-lab/starterkit-twig-base'
				}
			}, {
				name: 'starterkit-twig-demo',
				value: {
					'name': 'starterkit-twig-demo',
					'url': 'https://github.com/pattern-lab/starterkit-twig-demo'
				}
			}, {
				name: 'starterkit-mustache-materialdesign',
				value: {
					'name': 'starterkit-mustache-materialdesign',
					'url': 'https://github.com/pattern-lab/starterkit-mustache-materialdesign'
				}
			}, {
				name: 'starterkit-twig-drupal-demo',
				value: {
					'name': 'starterkit-twig-drupal-demo',
					'url': 'https://github.com/pattern-lab/starterkit-twig-drupal-demo'
				}
			}, {
				name: 'starterkit-twig-drupal-minimal',
				value: {
					'name': 'starterkit-twig-drupal-minimal',
					'url': 'https://github.com/pattern-lab/starterkit-twig-drupal-minimal'
				}
			}, {
				name: 'starterkit-mustache-webdesignday',
				value: {
					'name': 'starterkit-mustache-webdesignday',
					'url': 'https://github.com/pattern-lab/starterkit-mustache-webdesignday'
				}
			}, {
				name: 'starterkit-mustache-base',
				value: {
					'name': 'starterkit-mustache-base',
					'url': 'https://github.com/pattern-lab/starterkit-mustache-base'
				}
			}],
		default: {
			name: 'starterkit-mustache-base',
			value: {
				'name': 'starterkit-mustache-base',
				'url': 'https://github.com/pattern-lab/starterkit-mustache-base'
			}
		}
	}];
	
	/** customStructureConfirm {Array} - Inquirer question logic IF user wants to specify custom source, public and exports folders */
	const customStructureConfirm = [
		{
			type: 'confirm',
			name: 'confirm',
			default: false,
			message: 'Would you like to specify a name for source, public and exports directories?'
		}
	];
	
	/** customFolderSetup {Array} - Inquirer question logic for custom edition structure */
	const customFolderSetup = [
		{
			type: 'input',
			name: 'source_root',
			message: 'What\'s the name of your patternlab\'s source directory?',
			default: function () {
				return 'source';
			},
			filter: sanitiseFilename
		},
		{
			type: 'input',
			name: 'public_root',
			message: 'What\'s the name of your patternlab\'s public directory?',
			default: function () {
				return 'public';
			},
			filter: sanitiseFilename
		},
		{
			type: 'input',
			name: 'export_root',
			message: 'What\'s the name of your patternlab\'s export directory?',
			default: function () {
				return 'pattern_exports';
			},
			filter: sanitiseFilename
		}
	];
	
	/** confirmSetup {Array} - Inquirer question to confirm selection */
	const confirmSetup = [{
		type: 'confirm',
		name: 'confirm',
		message: 'Are you happy with your choices? (Hit enter for YES)?',
		default: true
	}];
	
	try {
		const folderStructureAnswers = {
			'source_root': 'source',
			'public_root': 'public',
			'export_root': 'pattern_exports'
		};
		
		/**
		 * @property {string} project_root="./" - Path to the project root directory
		 * @property {string|Symbol} edition - The name of the edition npm package or a Symbol for no install
		 */
		const editionAnswers = yield ask(editionSetup);
		
		/**
		 * @property {object|Symbol} starterkit - The name of a starterkit npm package or a Symbol for no install
		 */
		const starterkitAnswers = yield ask(starterkitSetup);
		
		/**
		 * @property {string} source_root="source"
		 * @property {string} public_root="public"
		 * @property {string} export_root="patterns_exports"
		 */
		const wantsCustomStructure = yield ask(customStructureConfirm);
		
		if (wantsCustomStructure.confirm) {
			/**
			 * @property {string} source_root="source"
			 * @property {string} public_root="public"
			 * @property {string} export_root="patterns_exports"
			 */
			const newfolderStructureAnswers = yield ask(customFolderSetup);
			Object.assign(folderStructureAnswers, newfolderStructureAnswers);
		}
		
		/**
		 * @property {boolean} confirm - A bool hold the confirmation status
		 */
		const confirmation = yield ask(confirmSetup);
		
		// IF we have no confirmation we start all over again.
		if (!confirmation.confirm) return init(options);
		
		// Destructure the answers
		const projectDir = editionAnswers.project_root;
		const sourceDir = folderStructureAnswers.source_root;
		const publicDir = folderStructureAnswers.public_root;
		const exportDir = folderStructureAnswers.export_root;
		const edition = editionAnswers.edition !== Install.NONE ? editionAnswers.edition : '';
		const starterkit = starterkitAnswers.starterkit !== Install.NONE ? starterkitAnswers.starterkit : '';
		
		/**
		 * Process the init routines
		 * 1. Scaffold the folder structure
		 * 2. If `edition is present:
		 *    2.1 Install it
		 *    2.2 Copy over the mandatory edition files to sourceDir
		 *    2.3 Check whether we need to deal with peerDeps
		 *    2.4 Adjust patternlab-config.json paths
		 * 3. If `starterkit` is present
		 *    3.1 Install it
		 *    3.2 Copy over the mandatory starterkit files to sourceDir
		 * 4. Adjust config
		 *    4.1 Replace config paths
		 *    4.2 Save patternlab-config.json in projectDir
		 */
		
		yield scaffold(projectDir, sourceDir, publicDir, exportDir); // 1
		if (edition) {
			yield checkAndInstallPackage(edition); // 2.1
			yield copyAsync(path.resolve('./node_modules', edition, 'source', '_meta'), path.resolve(projectDir, sourceDir, '_meta')); // 2.2
			const editionPath = exists.sync(path.resolve('node_modules', edition, 'node_modules')) ? path.join('node_modules', edition, 'node_modules') : 'node_modules'; // 2.3
			defaultPatternlabConfig.paths.source.styleguide = defaultPatternlabConfig.paths.source.styleguide.replace(/node_modules/, editionPath); // 2.4
			defaultPatternlabConfig.paths.source.patternlabFiles = defaultPatternlabConfig.paths.source.patternlabFiles.replace(/node_modules/, editionPath); // 2.4
		}
		if (starterkit) {
			yield checkAndInstallPackage(starterkit.name, starterkit.url); // 3.1
			yield copyAsync(path.resolve('./node_modules', starterkit.name, 'dist'), path.resolve(projectDir, sourceDir)); // 3.2
		}
		
		const patternlabConfig = replaceConfigPaths(defaultPatternlabConfig, projectDir, sourceDir, publicDir, exportDir); // 4.1
		yield writeJsonAsync(path.resolve(projectDir, 'patternlab-config.json'), patternlabConfig); // 4.2
		
		// Finally :>
		if (!edition && !starterkit) {
			debug(`patternlab→init: You haven't picked an edition nor a starterkit. PatternLab won't work without those. Please add them manually.`)
		} else {
			debug(`patternlab→init: Additional packages installed - ${edition ? 'edition: ' + edition : ''} ${starterkit ? ', starterkit: ' + starterkit.name : ''}`);
		}
		debug(`patternlab→init: Yay ☺. PatternLab Node was successfully initialised in ${projectDir}`);
		return true;
	} catch (err) {
		error(`patternlab→init: Failed to init project. ${err}`);
	}
});

module.exports = init;
