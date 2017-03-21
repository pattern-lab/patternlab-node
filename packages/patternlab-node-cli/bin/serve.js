'use strict';
const bs = require('browser-sync').create('PatternLab');
const buildPatterns = require('./build');
const patternlab = require('patternlab-node');
const htmlInjector = require('bs-html-injector');
const path = require('path');
const _ = require('lodash');
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
		
		// The browser-sync config
		const bsConfig = {
			server: publicDir,
			snippetOptions: {
				blacklist: ['/index.html', '/', '/?*'] // Ignore all HTML files within the templates folder
			},
			notify: {
				styles: [
					'display: none',
					'padding: 15px',
					'font-family: sans-serif',
					'position: fixed',
					'font-size: 1em',
					'z-index: 9999',
					'bottom: 0px',
					'right: 0px',
					'border-top-left-radius: 5px',
					'background-color: #1B2032',
					'opacity: 0.4',
					'margin: 0',
					'color: white',
					'text-align: center'
				]
			}
		};
		
		/**
		 * @func copyAndReloadCSS
		 */
		const copyAndReloadCSS = () => wrapAsync(function *() {
			yield copyWithPattern(path.resolve(src.css), '**/*.css', path.resolve(config.paths.public.css));
			bs.reload('*.css');
		});
		
		/**
		 * @func copyAndReloadStyleguide
		 */
		const copyAndReloadStyleguide = () => wrapAsync(function *() {
			yield copyWithPattern(path.resolve(src.styleguide), '**/!(*.css)', path.resolve(config.paths.public.styleguide));
			yield copyWithPattern(path.resolve(src.styleguide), '**/*.css', path.resolve(config.paths.public.styleguide));
			bs.reload('*.css');
		});
		
		/**
		 * @func reload
		 * @desc Calls browser-sync's reload method to tell browsers to refresh their page
		 */
		const buildAndReload = function () {
			buildPatterns(config);
			bs.reload();
		};
		
		// Register plugins
		bs.use(htmlInjector, {
			files: [publicDir + '/index.html', publicDir + '../styleguide/styleguide.html']
		});
		
		if (watch) {
			/**
			 * 1. Watch source css, then copy css and callreloadCSS
			 * 2. Watch source styleguide, then copy styleguide and css and call reloadCSS
			 * 3. Watch pattern-specific and engine-specific extensions, run build and reload
			 */
			bs.watch(sourceCSS).on('change', copyAndReloadCSS); // 1
			bs.watch(sourceStyleguide).on('change', copyAndReloadStyleguide); // 2
			const patternWatches = [
				path.join(path.resolve(src.patterns), '**/*.json'),
				path.join(path.resolve(src.patterns), '**/*.md'),
				path.join(path.resolve(src.data), '*.json'),
				path.join(path.resolve(src.fonts), '*'),
				path.join(path.resolve(src.images), '*'),
				path.join(path.resolve(src.meta), '*'),
				path.join(path.resolve(src.annotations), '*')
			].concat(patterns); // 3
			
			bs.watch(patternWatches).on('change', buildAndReload);
		}
		
		// Init browser-sync
		bs.init(bsConfig);
	} catch (err) {
		error(err);
	}
}

module.exports = serve;
