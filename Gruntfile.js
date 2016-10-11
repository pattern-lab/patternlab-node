module.exports = function (grunt) {

  /******************************
   * Project configuration.
   * Should only be needed if you are developing against core, running tests, linting and want to run tests or increment package numbers
   *****************************/
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner: '/* \n * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy") %> \n * \n * <%= pkg.author.name %>, <%= pkg.contributors[0].name %>, and the web community.\n * Licensed under the <%= pkg.license %> license. \n * \n * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. \n *\n */\n\n',
      },
      patternlab: {
        src: './core/lib/patternlab.js',
        dest: './core/lib/patternlab.js'
      }
    },
    tape: {
      options: {
        pretty: false,
        output: 'console'
      },
      files: ['test/*_tests.js']
    },
    eslint: {
      options: {
        configFile: './.eslintrc'
      },
      target: ['./core/lib/*']
    }
  });

  // load all grunt tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-tape');

  //travis CI task
  grunt.registerTask('travis', ['tape', 'eslint']);

  //to be run prior to releasing a version
  grunt.registerTask('build', ['tape', 'eslint', 'concat']);

};
