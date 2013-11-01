module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['./public/patterns'],
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
			// scss: { //scss can be watched if you like
			// 	files: ['source/css/**/*.scss', 'public/styleguide/css/*.scss'],
			// 	tasks: ['default']
			// },
			mustache: {
				files: ['source/_patterns/**/*.mustache'],
				tasks: ['default']
			},
			data: {
				files: ['source/_patterns/**/*.json'],
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
					'./public/styleguide/css/styleguide.css': './public/styleguide/css/styleguide.scss'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	//load the patternlab task
	grunt.task.loadTasks('./builder/');

	//if you choose to use scss, or any preprocessor, you can add it here
	grunt.registerTask('default', ['clean', 'patternlab', /*'sass',*/ 'copy']);
};