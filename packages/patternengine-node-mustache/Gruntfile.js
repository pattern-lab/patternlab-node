module.exports = function(grunt) {

	var path = require('path');

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				stripBanners: true,
				banner: '/* \n * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy") %> \n * \n * <%= pkg.author %>, and the web community.\n * Licensed under the <%= pkg.license %> license. \n * \n * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. \n *\n */\n\n',
			},
			patternlab: {
				src: './builder/patternlab.js',
				dest: './builder/patternlab.js'
			},
			object_factory: {
				src: './builder/object_factory.js',
				dest: './builder/object_factory.js'
			},
			lineage: {
				src: './builder/lineage_hunter.js',
				dest: './builder/lineage_hunter.js'
			},
			media_hunter: {
				src: './builder/media_hunter.js',
				dest: './builder/media_hunter.js'
			},
			patternlab_grunt: {
				src: './builder/patternlab_grunt.js',
				dest: './builder/patternlab_grunt.js'
			},
			patternlab_gulp: {
				src: './builder/patternlab_gulp.js',
				dest: './builder/patternlab_gulp.js'
			},
			parameter_hunter: {
				src: './builder/parameter_hunter.js',
				dest: './builder/parameter_hunter.js'
			},
			pattern_exporter: {
				src: './builder/pattern_exporter.js',
				dest: './builder/pattern_exporter.js'
			},
			pattern_assembler: {
				src: './builder/pattern_assembler.js',
				dest: './builder/pattern_assembler.js'
			},
			pseudopattern_hunter: {
				src: './builder/pseudopattern_hunter.js',
				dest: './builder/pseudopattern_hunter.js'
			},
			list_item_hunter: {
				src: './builder/list_item_hunter.js',
				dest: './builder/list_item_hunter.js'
			},
			style_modifier_hunter: {
				src: './builder/style_modifier_hunter.js',
				dest: './builder/style_modifier_hunter.js'
			}
		},
		copy: {
			main: {
				files: [
					{ expand: true, cwd: path.resolve(paths().source.js), src: '*.js', dest: path.resolve(paths().public.js) },
					{ expand: true, cwd: path.resolve(paths().source.css), src: '*.css', dest: path.resolve(paths().public.css) },
					{ expand: true, cwd: path.resolve(paths().source.images), src: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.jpeg'], dest: path.resolve(paths().public.images) },
					{ expand: true, cwd: path.resolve(paths().source.fonts), src: '*', dest: path.resolve(paths().public.fonts) },
					{ expand: true, cwd: path.resolve(paths().source.data), src: 'annotations.js', dest: path.resolve(paths().public.data) }
				]
			},
			styleguide: {
				files: [
					{ expand: true, cwd: path.resolve(paths().source.styleguide), src: ['*.*', '**/*.*'], dest: path.resolve(paths().public.styleguide) }
				]
			}
		},
		watch: {
			all: {
				files: [
					path.resolve(paths().source.css + '**/*.css'),
					path.resolve(paths().source.styleguide + 'css/*.css'),
					path.resolve(paths().source.patterns + '**/*.mustache'),
					path.resolve(paths().source.patterns + '**/*.json'),
					path.resolve(paths().source.fonts + '/*'),
					path.resolve(paths().source.images + '/*'),
					path.resolve(paths().source.data + '*.json')
				],
				tasks: ['default', 'bsReload:css']
			}
		},
		nodeunit: {
			all: ['test/*_tests.js']
		},
		browserSync: {
			dev: {
				options: {
					server:  path.resolve(paths().public.root),
					watchTask: true,
					watchOptions: {
						ignoreInitial: true,
						ignored: '*.html'
					},
                    snippetOptions: {
                        // Ignore all HTML files within the templates folder
                        blacklist: ['/index.html', '/']
                    },
					plugins: [
						{
							module: 'bs-html-injector',
							options: {
								files: [path.resolve(paths().public.root + '/index.html'), path.resolve(paths().public.styleguide + '/styleguide.html')]
							}
						}
					],
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
				}
			}
		},
		bsReload: {
			css: path.resolve(paths().public.root + '**/*.css')
		}
	});

	function paths () {
	  return require('./config.json').paths;
	}

	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//load the patternlab task
	grunt.task.loadTasks('./builder/');

	grunt.registerTask('default', ['patternlab', 'copy:main', 'copy:styleguide']);

	//travis CI task
	grunt.registerTask('travis', ['nodeunit', 'patternlab']);

	grunt.registerTask('serve', ['patternlab', 'copy:main', 'copy:styleguide', 'browserSync', 'watch:all']);

	grunt.registerTask('build', ['nodeunit', 'concat']);

};
