'use strict';
const ask = require('../ask');
const scaffold = require('../scaffold');
const installEdition = require('../install-edition');
const installStarterkit = require('../install-starterkit');
const defaultPatternlabConfig = require('../default-config');
const replaceConfigPaths = require('../replace-config');
const path = require('path');
const wrapAsync = require('../utils').wrapAsync;
const writeJsonAsync = require('../utils').writeJsonAsync;

const init = options => wrapAsync(function*() {
	const sourceDir = 'source';
	const publicDir = 'public';
	const exportDir = 'pattern_exports';
	const answers = options.projectDir ? options : yield ask(options);
	const projectDir = answers.projectDir || './';
	const edition = answers.edition;
	const starterkit = answers.starterkit;
	
	/**
	 * Process the init routines
	 * 1 Replace config paths
	 * 2. Scaffold the folder structure
	 * 3. If `edition` is present:
	 *    3.1 Install edition
	 *    3.2 Reassign adjustedconfig
	 * 3. If `starterkit` is present
	 *    3.1 Install it
	 *    3.2 Copy over the mandatory starterkit files to sourceDir
	 * 4. Check for starterkit and install it
	 * 5. Save patternlab-config.json in projectDir
	 */
	let patternlabConfig = replaceConfigPaths(defaultPatternlabConfig, projectDir, sourceDir, publicDir, exportDir); // 1
	
	yield scaffold(projectDir, sourceDir, publicDir, exportDir); // 2
	
	if (edition) {
		const newConf = yield installEdition(edition, patternlabConfig); // 3.1
		patternlabConfig = Object.assign(patternlabConfig, newConf); // 3.2
	}
	if (starterkit) yield installStarterkit(starterkit, patternlabConfig); // 4
	yield writeJsonAsync(path.resolve(projectDir, 'patternlab-config.json'), patternlabConfig); // 4.2
	
	// Finally :>
	if (!edition && !starterkit) {
		console.log(`patternlab→init: You haven't picked an edition nor a starterkit. PatternLab won't work without those. Please add them manually.`); // eslint-disable-line
	} else {
		console.log(`patternlab→init: Additional packages installed - ${edition ? 'edition: ' + edition : ''} ${starterkit ? ', starterkit: ' + starterkit.name : ''}`); // eslint-disable-line
	}
	console.log(`patternlab→init: Yay ☺. PatternLab Node was successfully initialised in ${projectDir}`); // eslint-disable-line
	return true;
});

module.exports = init;
