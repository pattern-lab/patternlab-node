'use strict';
const bs = require('browser-sync').create('PatternLab');
const htmlInjector = require('bs-html-injector');
const path = require('path');
const _ = require('lodash');
const isValidConfig = require('./is_valid_config');
const error = require('./utils').error;

/**
 * @func serve
 * @desc Start a browser-sync server in the PatternLab public dir.
 * @param {object} config - The passed PatternLab config.
 */
function serve(config) {
	if (!isValidConfig) throw new TypeError('patternlab→serve: Expects config not to be empty and of type object.');

	if (!_.has(config, 'paths.public.root') || _.isEmpty(config.paths.public.root)) {
		throw new TypeError('patternlab→serve: config.paths.public.root is empty or does not exist. Please check your PatternLab config.');
	}
	if (!_.has(config, 'paths.source.root') || _.isEmpty(config.paths.source.root)) {
		throw new TypeError('patternlab→serve: config.paths.source.root is empty or does not exist. Please check your PatternLab config.');
	}
	
	try {
		const publicDir = path.resolve(config.paths.public.root);
		
		// The browser-sync
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
		
		// Register plugins
		bs.use(htmlInjector, {
			files: [publicDir + '/index.html', publicDir + '../styleguide/styleguide.html']
		});
		
		// Init browser-sync
		bs.init(bsConfig);
	} catch (err) {
		error(err);
	}
}

module.exports = serve;
