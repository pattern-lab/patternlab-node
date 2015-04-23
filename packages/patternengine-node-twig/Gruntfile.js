module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			options: { force: true },
			files: ['./public/patterns']
		},
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
			pattern_exporter: {
				src: './builder/pattern_exporter.js',
				dest: './builder/pattern_exporter.js'
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
			}
		},
		jshint: {
			options: {
				"curly": true,
				"eqnull": true,
				"eqeqeq": true,
				"undef": true,
				"forin": true,
				//"unused": true,
				"node": true
			},
			patternlab: ['Gruntfile.js', './builder/lib/patternlab.js']
		},
		watch: {
			// scss: { //scss can be watched if you like
			//	options: {
			//		livereload: true
			//	},
			// 	files: ['source/css/**/*.scss', 'public/styleguide/css/*.scss'],
			// 	tasks: ['default']
			// },
			all: {
				options: {
					livereload: true
				},
				files: [
				'source/_patterns/**/*.mustache',
				'source/_patterns/**/*.json',
				'source/_data/*.json'
				],
				tasks: ['default']
			}
		},
		sass: {
			build: {
				options: {
					style: 'expanded',
					precision: 8
				},
				files: {
					'./source/css/style.css': './source/css/style.scss',
					'./public/styleguide/css/static.css': './public/styleguide/css/static.scss',
					'./public/styleguide/css/styleguide.css': './public/styleguide/css/styleguide.scss',
					'./public/styleguide/css/styleguide-specific.css': './public/styleguide/css/styleguide-specific.scss'
				}
			}
		},
		nodeunit: {
			all: ['test/*_tests.js']
		},
		connect: {
			app:{
				options: {
					port: 9001,
					base: './public',
					hostname: 'localhost',
					open: true,
					livereload: 35729
				}
			}
		}
	});

	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//load the patternlab task
	grunt.task.loadTasks('./builder/');

	//if you choose to use scss, or any preprocessor, you can add it here
	grunt.registerTask('default', ['clean', 'concat', 'patternlab', /*'sass',*/ 'copy']);

	//travis CI task
	grunt.registerTask('travis', ['clean', 'concat', 'patternlab', /*'sass',*/ 'copy', 'nodeunit']);

	grunt.registerTask('serve', ['clean', 'concat', 'patternlab', /*'sass',*/ 'copy', 'connect', 'watch']);

};