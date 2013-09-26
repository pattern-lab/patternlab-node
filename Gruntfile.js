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
					'./source/css/style.css': './source/css/style.scss'
				}
			}
		},
		copy: {
			main: {
				files: [
					{ expand: true, cwd: './source/js/', src: '*', dest: './public/js/'}
					,{ expand: true, cwd: './source/css/', src: 'style.css', dest: './public/css/' }
					,{ expand: true, cwd: './source/images/', src: '*', dest: './public/images/' }
					,{ expand: true, cwd: './source/images/sample/', src: '*', dest: './public/images/sample/'}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');

	grunt.task.loadTasks('./builder/lib/');

	grunt.registerTask('default', ['patternlab', 'sass', 'copy']);
};