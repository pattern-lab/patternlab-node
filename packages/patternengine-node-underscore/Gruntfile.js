module.exports = function(grunt) {

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
			}
		},
		copy: {
			main: {
				files: [
				{ expand: true, cwd: './source/js/', src: '*', dest: './public/js/'},
				{ expand: true, cwd: './source/css/', src: '*.css', dest: './public/css/' },
				{ expand: true, cwd: './source/images/', src: ['*.png', '*.jpg', '*.gif', '*.jpeg'], dest: './public/images/' },
				{ expand: true, cwd: './source/images/sample/', src: ['*.png', '*.jpg', '*.gif', '*.jpeg'], dest: './public/images/sample/'},
				{ expand: true, cwd: './source/fonts/', src: '*', dest: './public/fonts/'},
				{ expand: true, cwd: './source/_data/', src: 'annotations.js', dest: './public/data/' }
				]
			},
			css: {
				files: [
				{ expand: true, cwd: './source/css/', src: '*.css', dest: './public/css/' }
				]
			}
		},
		watch: {
			all: {
				files: [
					'source/css/**/*.css',
					'public/styleguide/css/*.css',
					'source/_patterns/**/*.mustache',
					'source/_patterns/**/*.json',
					'source/_data/*.json'
				],
				tasks: ['default']
			},
			// scss: {
			// 	files: ['source/css/**/*.scss', 'public/styleguide/css/*.scss'],
			// 	tasks: ['sass', 'copy:css','bsReload:css']
			// },
			patterns: {
				files: [
					'source/_patterns/**/*.mustache',
					'source/_patterns/**/*.json',
					'source/_data/*.json'
				],
				tasks: ['default']
			}
		},
		// sass: {
		// 	build: {
		// 		options: {
		// 			style: 'expanded',
		// 			precision: 8
		// 		},
		// 		files: {
		// 			'./source/css/style.css': './source/css/style.scss',
		// 			'./public/styleguide/css/static.css': './public/styleguide/css/static.scss',
		// 			'./public/styleguide/css/styleguide.css': './public/styleguide/css/styleguide.scss',
		// 			'./public/styleguide/css/styleguide-specific.css': './public/styleguide/css/styleguide-specific.scss'
		// 		}
		// 	}
		// },
		nodeunit: {
			all: ['test/*_tests.js']
		},
		browserSync: {
			dev: {
				options: {
					server:  './public',
					watchTask: true,
					plugins: [
						{
							module: 'bs-html-injector',
							options: {
								files: './public/index.html'
							}
						}
					]
				}
			}
		},
		bsReload: {
			css: './public/**/*.css'
		}
	});

	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//load the patternlab task
	grunt.task.loadTasks('./builder/');

	//if you choose to use scss, or any preprocessor, you can add it here
	grunt.registerTask('default', ['patternlab', /*'sass',*/ 'copy:main']);

	//travis CI task
	grunt.registerTask('travis', ['nodeunit', 'patternlab']);

	//TODO: this line is more efficient, but you cannot run concurrent watch tasks without another dependency.
	//grunt.registerTask('serve', ['patternlab', /*'sass',*/ 'copy:main', 'browserSync', 'watch:patterns', 'watch:scss']);
	grunt.registerTask('serve', ['patternlab', /*'sass',*/ 'copy:main', 'browserSync', 'watch:all']);

	grunt.registerTask('build', ['nodeunit', 'concat']);

};
