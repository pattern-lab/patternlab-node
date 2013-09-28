module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			build: {
				options: {
					style: 'expanded',
					precision: 8
				},
				files: {
					'./source/css/style.css': './source/css/style.scss',
					'./public/styleguide/css/static.css': './source/styleguide/scss/static.scss',
					'./public/styleguide/css/styleguide.css': './source/styleguide/scss/styleguide.scss'
				}
			}
		},
		copy: {
			main: {
				files: [
					{ expand: true, cwd: './source/js/', src: '*', dest: './public/js/'},
					{ expand: true, cwd: './source/css/', src: 'style.css', dest: './public/css/' },
					{ expand: true, cwd: './source/images/', src: '*', dest: './public/images/' },
					{ expand: true, cwd: './source/images/sample/', src: '*', dest: './public/images/sample/'},
					{ expand: true, cwd: './source/fonts/', src: '*', dest: './public/fonts/'}
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
			scss: {
				files: ['source/css/**/*.scss', 'public/styleguide/css/*.scss'],
				tasks: ['default']
			},
			mustache: {
				files: ['source/_patterns/**/*.mustache'],
				tasks: ['default']
			},
			data: {
				files: ['source/_patterns/**/*.json'],
				tasks: ['default']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//load the patternlab task
	grunt.task.loadTasks('./builder/');

	grunt.registerTask('default', ['patternlab', 'sass', 'copy']);
};