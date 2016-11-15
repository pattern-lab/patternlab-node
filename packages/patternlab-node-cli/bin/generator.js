'use strict';

const path = require('path');
const _ = require('lodash');
const wrapAsync = require('./utils').wrapAsync;
const mkdirsAsync = require('./utils').mkdirsAsync;
const defaultPatternlabConfig = {
	'paths': {
		'source': {
			'root': './source/',
			'patterns': './source/_patterns/',
			'data': './source/_data/',
			'meta': './source/_meta/',
			'annotations': './source/_annotations/',
			'styleguide': 'node_modules/styleguidekit-assets-default/dist/',
			'patternlabFiles': 'node_modules/styleguidekit-mustache-default/views/',
			'js': './source/js',
			'images': './source/images',
			'fonts': './source/fonts',
			'css': './source/css/'
		},
		'public': {
			'root': './public/',
			'patterns': './public/patterns/',
			'data': './public/styleguide/data/',
			'annotations': './public/annotations/',
			'styleguide': './public/styleguide/',
			'js': './public/js',
			'images': './public/images',
			'fonts': './public/fonts',
			'css': './public/css'
		}
	},
	'styleGuideExcludes': [
		'templates',
		'pages'
	],
	'defaultPattern': 'all',
	'cleanPublic': false,
	'patternExtension': 'mustache',
	'ignored-extensions': ['scss', 'DS_Store', 'less'],
	'ignored-directories': ['scss'],
	'debug': false,
	'ishControlsHide': {
		's': false,
		'm': false,
		'l': false,
		'full': false,
		'random': false,
		'disco': false,
		'hay': true,
		'mqs': false,
		'find': false,
		'views-all': false,
		'views-annotations': false,
		'views-code': false,
		'views-new': false,
		'tools-all': false,
		'tools-docs': false
	},
	'ishMinimum': '240',
	'ishMaximum': '2600',
	'patternStateCascade': ['inprogress', 'inreview', 'complete'],
	'patternStates': {
		'molecules-single-comment': 'complete',
		'organisms-sticky-comment': 'inreview',
		'templates-article': 'complete'
	},
	'patternExportPatternPartials': [],
	'patternExportDirectory': './pattern_exports/',
	'baseurl': '',
	'cacheBust': true,
	'starterkitSubDir': 'dist',
	'outputFileSuffixes': {
		'rendered': '',
		'rawTemplate': '',
		'markupOnly': '.markup-only'
	}
};

/**
 * @func replaceConfigPaths
 * @desc Immutable replace source and public paths in the passed config.
 * @param {object} config - The passed PatternLab config.
 * @param {string} projectDir - The project directory path, defaults to ./
 * @param {string} sourceDir - The source root directory path.
 * @param {string} publicDir - The public root directory path.
 * @param {string} exportDir - The export root directory path.
 * @return {object|Error} - Returns a modified config. Original stays unaltered.
 */
function replaceConfigPaths(config, projectDir, sourceDir, publicDir, exportDir) {
	const conf = _.assign({}, config);
	_.map(conf.paths.source, (value, key) => { conf.paths.source[key] = value.replace(/^\.\/source/g, path.join(projectDir, sourceDir)) });
	_.map(conf.paths.public, (value, key) => { conf.paths.public[key] = value.replace(/^\.\/public/g, path.join(projectDir, publicDir)) });
	conf.styleguide = 'node_modules/styleguidekit-assets-default/dist/';
	conf.patternlabFiles =  'node_modules/styleguidekit-mustache-default/views/';
	conf.patternExportDirectory = path.join(projectDir, exportDir);
	return conf;
}

/**
 * @func scaffold
 * @desc Generate file and folder structure for a PatternLab project
 * @param {string} projectDir - The project root directory path.
 * @param {string} sourceDir - The source root directory path.
 * @param {string} publicDir - The public root directory path.
 * @param {string} exportDir - The export root directory path.
 * @return {void}
 */
const scaffold = (projectDir, sourceDir, publicDir, exportDir) => wrapAsync(function* () {
	/**
	 * Create mandatory files structure
	 * 1. Create project source directory
	 * 2. Create project public directory
	 * 3. Create project export directory
	 */
	yield Promise.all([
		mkdirsAsync(path.resolve(projectDir, path.normalize(sourceDir))), // 1
		mkdirsAsync(path.resolve(projectDir, path.normalize(publicDir))), // 2
		mkdirsAsync(path.resolve(projectDir, path.normalize(exportDir))), // 3
	]);
});

module.exports = {
	defaultPatternlabConfig,
	replaceConfigPaths,
	scaffold
};
