'use strict';
const chokidar = require('chokidar');
const liveServer = require('@pattern-lab/live-server');
const patternlab = require('patternlab-node');
const path = require('path');
const _ = require('lodash');

const buildPatterns = require('./build');
const isValidConfig = require('./validate-config');
const copyWithPattern = require('./utils').copyWithPattern;
const wrapAsync = require('./utils').wrapAsync;
const error = require('./utils').error;

/**
 * @func serve
 * @desc Start a browser-sync server in the PatternLab public dir
 * @param {object} config - The passed PatternLab config
 * @param {boolean} watch - Whether to set up watches
 */
function serve(config, watch) {
	if (!isValidConfig) throw new TypeError('serve: Expects config not to be empty and of type object.');

	if (!_.has(config, 'paths.public.root') || _.isEmpty(config.paths.public.root)) {
		throw new TypeError('serve: config.paths.public.root is empty or does not exist. Please check your PatternLab config.');
	}
	if (!_.has(config, 'paths.source.root') || _.isEmpty(config.paths.source.root)) {
		throw new TypeError('serve: config.paths.source.root is empty or does not exist. Please check your PatternLab config.');
	}

	try {
		const pl = patternlab();
		const src = config.paths.source;
		const publicDir = path.resolve(config.paths.public.root);
		const sourceCSS = path.join(path.resolve(src.css), '/**/*.css');
		const sourceStyleguide = path.join(path.resolve(src.styleguide), '/**/*.*');
		const patterns = pl.getSupportedTemplateExtensions().map(dotExtension => path.join(path.resolve(src.patterns), `/**/*${dotExtension}`));
		
		// The liveserver config
		const liveServerConf = {
			root: publicDir,
			open: true,
			ignore: path.join(publicDir),
			file: 'index.html'
		};

		/**
		 * @func copyAndReloadCSS
		 */
		const copyAndReloadCSS = () => wrapAsync(function *() {
			yield copyWithPattern(path.resolve(src.css), '**/*.css', path.resolve(config.paths.public.css));
			liveServer.refreshCSS();
		});

		/**
		 * @func copyAndReloadStyleguide
		 */
		const copyAndReloadStyleguide = () => wrapAsync(function *() {
			yield copyWithPattern(path.resolve(src.styleguide), '**/!(*.css)', path.resolve(config.paths.public.styleguide));
			yield copyWithPattern(path.resolve(src.styleguide), '**/*.css', path.resolve(config.paths.public.styleguide));
			liveServer.refreshCSS();
		});

		/**
		 * @func reload
		 * @desc Calls browser-sync's reload method to tell browsers to refresh their page
		 */
		const buildAndReload = function () {
			buildPatterns(config);
			liveServer.reload();
		};
		
		if (watch) {
			/**
			 * 1. Watch source css, then copy css and callreloadCSS
			 * 2. Watch source styleguide, then copy styleguide and css and call reloadCSS
			 * 3. Watch pattern-specific and engine-specific extensions, run build and reload
			 */
			chokidar.watch(sourceCSS).on('change', copyAndReloadCSS); // 1
			chokidar.watch(sourceStyleguide).on('change', copyAndReloadStyleguide); // 2
			const patternWatches = [
				path.join(path.resolve(src.patterns), '**/*.json'),
				path.join(path.resolve(src.patterns), '**/*.md'),
				path.join(path.resolve(src.data), '*.json'),
				path.join(path.resolve(src.fonts), '*'),
				path.join(path.resolve(src.images), '*'),
				path.join(path.resolve(src.meta), '*'),
				path.join(path.resolve(src.annotations), '*')
			].concat(patterns); // 3
			
			chokidar.watch(patternWatches).on('change', buildAndReload);
		}
		// Init browser-sync
		liveServer.start(liveServerConf);
	} catch (err) {
		error(err);
	}
}

module.exports = serve;
