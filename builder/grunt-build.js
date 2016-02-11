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
    var path = require('path');

    // Load CORE tasks
    require('./grunt-core')(grunt, config);

    // Load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Project configuration.
    grunt.config.merge({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                stripBanners: true,
                banner: '/* \n * <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy") %> \n * \n * <%= pkg.author %>, and the web community.\n * Licensed under the <%= pkg.license %> license. \n * \n * Many thanks to Brad Frost and Dave Olsen for inspiration, encouragement, and advice. \n *\n */\n\n',
            },
            pl_patternlab: {
                src: './builder/patternlab.js',
                dest: './builder/patternlab.js'
            },
            pl_object_factory: {
                src: './builder/object_factory.js',
                dest: './builder/object_factory.js'
            },
            pl_lineage: {
                src: './builder/lineage_hunter.js',
                dest: './builder/lineage_hunter.js'
            },
            pl_media_hunter: {
                src: './builder/media_hunter.js',
                dest: './builder/media_hunter.js'
            },
            pl_patternlab_grunt: {
                src: './builder/patternlab_grunt.js',
                dest: './builder/patternlab_grunt.js'
            },
            pl_patternlab_gulp: {
                src: './builder/patternlab_gulp.js',
                dest: './builder/patternlab_gulp.js'
            },
            pl_parameter_hunter: {
                src: './builder/parameter_hunter.js',
                dest: './builder/parameter_hunter.js'
            },
            pl_pattern_exporter: {
                src: './builder/pattern_exporter.js',
                dest: './builder/pattern_exporter.js'
            },
            pl_pattern_assembler: {
                src: './builder/pattern_assembler.js',
                dest: './builder/pattern_assembler.js'
            },
            pl_pseudopattern_hunter: {
                src: './builder/pseudopattern_hunter.js',
                dest: './builder/pseudopattern_hunter.js'
            },
            pl_list_item_hunter: {
                src: './builder/list_item_hunter.js',
                dest: './builder/list_item_hunter.js'
            },
            pl_style_modifier_hunter: {
                src: './builder/style_modifier_hunter.js',
                dest: './builder/style_modifier_hunter.js'
            }
        },
        copy: {
            pl_main: {
                files: [
                    {
                        expand: true,
                        cwd: path.resolve(config.paths.source.js),
                        src: '*.js',
                        dest: path.resolve(config.paths.public.js)
                    },
                    {
                        expand: true,
                        cwd: path.resolve(config.paths.source.css),
                        src: '*.css',
                        dest: path.resolve(config.paths.public.css)
                    },
                    {
                        expand: true,
                        cwd: path.resolve(config.paths.source.images),
                        src: ['**/*.png', '**/*.jpg', '**/*.gif', '**/*.jpeg'],
                        dest: path.resolve(config.paths.public.images)
                    },
                    {
                        expand: true,
                        cwd: path.resolve(config.paths.source.fonts),
                        src: '*',
                        dest: path.resolve(config.paths.public.fonts)
                    },
                    {
                        expand: true,
                        cwd: path.resolve(config.paths.source.data),
                        src: 'annotations.js',
                        dest: path.resolve(config.paths.public.data)
                    }
                ]
            },
            pl_styleguide: {
                files: [
                    {
                        expand: true,
                        cwd: path.resolve(config.paths.source.styleguide),
                        src: ['*.*', '**/*.*'],
                        dest: path.resolve(config.paths.public.styleguide)
                    }
                ]
            }
        },
        watch: {
            pl_all: {
                files: [
                    path.resolve(config.paths.source.css + '**/*.css'),
                    path.resolve(config.paths.source.styleguide + 'css/*.css'),
                    path.resolve(config.paths.source.patterns + '**/*.mustache'),
                    path.resolve(config.paths.source.patterns + '**/*.json'),
                    path.resolve(config.paths.source.fonts + '/*'),
                    path.resolve(config.paths.source.images + '/*'),
                    path.resolve(config.paths.source.data + '*.json')
                ],
                tasks: ['default', 'bsReload:pl_css']
            }
        },
        browserSync: {
            pl_dev: {
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
            pl_css: path.resolve(config.paths.public.root + '**/*.css')
        }
    });

    grunt.registerTask('pl:serve', ['patternlab', 'copy:pl_main', 'copy:pl_styleguide', 'browserSync', 'watch:pl_all']);

    grunt.registerTask('pl:build', ['concat']);
};