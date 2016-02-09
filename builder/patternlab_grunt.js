/*
 * patternlab-node - v1.1.0 - 2016
 *
 * Brian Muenzenmeyer, and the web community.
 * Licensed under the MIT license.
 *
 * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice.
 *
 */

// IMPORTANT: Remember that `./` matches the root of the grunt file that requires this one!
// However, this does not apply to the `require('...')`
module.exports = function(grunt, config) {
	var patternlab_engine = require('./patternlab.js'),
		path = require('path');

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
					{ expand: true, cwd: path.resolve(config.paths.source.js), src: '*.js', dest: path.resolve(config.paths.public.js) },
					{ expand: true, cwd: path.resolve(config.paths.source.css), src: '*.css', dest: path.resolve(config.paths.public.css) },
					{ expand: true, cwd: path.resolve(config.paths.source.images), src: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.jpeg'], dest: path.resolve(config.paths.public.images) },
					{ expand: true, cwd: path.resolve(config.paths.source.fonts), src: '*', dest: path.resolve(config.paths.public.fonts) },
					{ expand: true, cwd: path.resolve(config.paths.source.data), src: 'annotations.js', dest: path.resolve(config.paths.public.data) }
				]
			},
			styleguide: {
				files: [
					{ expand: true, cwd: path.resolve(config.paths.source.styleguide), src: ['*.*', '**/*.*'], dest: path.resolve(config.paths.public.styleguide) }
				]
			}
		},
		watch: {
			all: {
				files: [
					path.resolve(config.paths.source.css + '**/*.css'),
					path.resolve(config.paths.source.styleguide + 'css/*.css'),
					path.resolve(config.paths.source.patterns + '**/*.mustache'),
					path.resolve(config.paths.source.patterns + '**/*.json'),
					path.resolve(config.paths.source.fonts + '/*'),
					path.resolve(config.paths.source.images + '/*'),
					path.resolve(config.paths.source.data + '*.json')
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
					server:  path.resolve(config.paths.public.root),
					watchTask: true,
					watchOptions: {
						ignoreInitial: true,
						ignored: '*.html'
					},
					plugins: [
						{
							module: 'bs-html-injector',
							options: {
								files: [path.resolve(config.paths.public.root + '/index.html'), path.resolve(config.paths.public.styleguide + '/styleguide.html')]
							}
						}
					]
				}
			}
		},
		bsReload: {
			css: path.resolve(config.paths.public.root + '**/*.css')
		}
	});

	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.registerTask('patternlab', 'create design systems with atomic design', function(arg) {

		var patternlab = patternlab_engine();

		if(arguments.length === 0){
			patternlab.build(true);
		}

		if(arg && arg === 'v'){
			patternlab.version();
		}

		if(arg && arg === "only_patterns"){
			patternlab.build_patterns_only(true);
		}

		if(arg && arg === "help"){
			patternlab.help();
		}

		if(arg && (arg !== "v" && arg !=="only_patterns" && arg !=="help")){
			patternlab.help();
		}

	});

	grunt.registerTask('default', ['patternlab', 'copy:main', 'copy:styleguide']);

	//travis CI task
	grunt.registerTask('travis', ['nodeunit', 'patternlab']);

	grunt.registerTask('serve', ['patternlab', 'copy:main', 'copy:styleguide', 'browserSync', 'watch:all']);

	grunt.registerTask('build', ['nodeunit', 'concat']);

};
