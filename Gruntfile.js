/**
 * prettify-matlab
 * https://github.com/amroamroamro/prettify-matlab
 *
 * Copyright (c) 2016 Amro
 * Licensed under the MIT license.
 */

var _ = require('lodash');

// wrapper function exported from Gruntfile
module.exports = function (grunt) {
    'use strict';

    // context used when rendering mustache templates
    var context = {
        pkg: grunt.file.readJSON('package.json'),
        // core/toolbox functions
        lite: false,
        toolboxes: [
            {name: 'core'},
            {name: 'stats'},
            {name: 'image'},
            {name: 'optim'}
        ],
        re: function () {
            return grunt.file.read('src/functions/' + this.name + '.txt')
                .trim().split('\n').join('|');
        },
        // section to quote lines of included partials
        quoteLines: function () {
            return function (text, render) {
                return render(text).trim().split('\n')
                    .map(function (line) {
                        return "'" + line + "'";
                    }).join(',\n') + '\n';
            };
        },
        //HACK: section to indent lines of included partials
        indentLines1: function () {
            return makeIndentFunc(1);  // indent 1 tab
        },
        indentLines2: function () {
            return makeIndentFunc(2);  // indent 2 tabs
        },
        indentLines3: function () {
            return makeIndentFunc(3);  // indent 3 tabs
        }
    };

    function makeIndentFunc(num) {
        return function (text, render) {
            return render(text).split('\n').map(function (line) {
                return (line ? _.repeat(' ', 4 * num) : '') + line;
            }).join('\n');
        };
    }

    // grunt configuration
    grunt.initConfig({
        // user-defined data available for templates
        pkg: context.pkg,
        banner:
            '/*! Copyright (c) <%= grunt.template.today("yyyy") %>' +
            ' by <%= pkg.author.name %>. <%= pkg.license %> license. */\n',

        // task: grunt-mustache-render
        mustache: {
            options: {
                escape: false, // no HTML escape
                extension: ''  // default is .mustache
            },
            ext: {
                files: [{
                    data: _.merge({}, context, {lite: true}),
                    template: 'src/lang-matlab.js',
                    dest: 'dist/js/lite/lang-matlab.js'
                },
                {
                    data: _.merge({}, context, {lite: false}),
                    template: 'src/lang-matlab.js',
                    dest: 'dist/js/full/lang-matlab.js'
                },
                {
                    data: context,
                    template: 'src/matlab.css',
                    dest: 'dist/css/matlab.css'
                },
                {
                    data: context,
                    template: 'src/matlab-plain.css',
                    dest: 'dist/css/matlab-plain.css'
                }]
            },
            userjs: {
                files: _.map([
                    'switch-lang',
                    'prettify-matlab',
                    'prettify-mathworks-answers',
                    'prettify-mathworks-fileexchange',
                    'prettify-mathworks-examples'
                ], function (name) {
                    return {
                        data: context,
                        template: 'src/' + name + '.user.js',
                        dest: 'dist/userscripts/' + name + '.user.js'
                    };
                })
            }
        },

        // task: grunt-contrib-copy
        copy: {
            userjs: {
                src: 'dist/userscripts/prettify-matlab.user.js',
                dest: '<%= copy.userjs.src %>',
                options: {
                    //HACK: replace matlab with matlab2 for Stack Overflow,
                    // because we cannot override an existing language handler
                    process: function (content) {
                        return content
                            .replace(/lang-matlab/g, 'lang-matlab2')
                            .replace(/'matlab/g, "'matlab2");
                    }
                }
            }
        },

        // task: grunt-contrib-jshint
        jshint: {
            options: {
                //NOTE: inline options here are ignored if file is specified
                jshintrc: '.jshintrc'
            },
            proj: {
                src: 'Gruntfile.js'
            },
            ext: {
                src: [
                    'dist/js/{full,lite}/*.js',
                    '!dist/js/{full,lite}/*.min.js'
                ]
            },
            userjs: {
                src: 'dist/userscripts/*.user.js'
            },
            unittest: {
                src: ['test/*.js', 'test/fixtures/*.js']
            }
        },

        // task: grunt-jscs
        jscs: {
            options: {
                //NOE: inline options here are merged with file options
                config: '.jscsrc'
            },
            proj: {
                src: '<%= jshint.proj.src %>'
            },
            ext: {
                src: '<%= jshint.ext.src %>'
            },
            userjs: {
                src: '<%= jshint.userjs.src %>'
            },
            unittest: {
                src: '<%= jshint.unittest.src %>'
            }
        },

        // task: grunt-eslint
        eslint: {
            options: {
                //NOE: inline options here are merged with file options
                configFile: '.eslintrc.json'
            },
            proj: {
                src: '<%= jshint.proj.src %>'
            },
            ext: {
                src: '<%= jshint.ext.src %>'
            },
            userjs: {
                src: '<%= jshint.userjs.src %>'
            },
            unittest: {
                src: '<%= jshint.unittest.src %>'
            }
        },

        // task: grunt-contrib-csslint
        csslint: {
            options: {
                //csslintrc: '.csslintrc'
            },
            ext: {
                src: ['dist/css/*.css', '!dist/css/*.min.css']
            }
        },

        // task: grunt-contrib-uglify
        uglify: {
            ext: {
                options: {
                    report: 'gzip',
                    ASCIIOnly: true,
                    //maxLineLen: 1000,
                    banner: '<%= banner %>'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/js/',
                    src: ['{full,lite}/*.js', '!{full,lite}/*.min.js'],
                    dest: 'dist/js/',
                    ext: '.min.js'
                }]
            }
        },

        // grunt-contrib-cssmin
        cssmin: {
            ext: {
                options: {
                    report: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/css/',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/css/',
                    ext: '.min.css'
                }]
            }
        },

        // task: grunt-contrib-clean
        clean: {
            ext: {
                src: [
                    'dist/js/{full,lite}/*.js',
                    'dist/css/*.css'
                ]
            },
            userjs: {
                src: 'dist/userscripts/*.user.js'
            }
        },

        // task: grunt-simple-mocha
        simplemocha: {
            options: {
                ui: 'bdd',
                reporter: 'spec',
                bail: false
            },
            unittest: {
                src: 'test/*.js'
            }
        },

        // task: grunt-contrib-watch
        watch: {
            options: {
                spawn: true,
                interrupt: true
            },
            proj: {
                options: {
                    reload: true
                },
                files: ['Gruntfile.js', 'package.json'],
                tasks: ['build']
            },
            lint_jshint: {
                files: '.jshintrc',
                tasks: ['jshint']
            },
            lint_jscs: {
                files: '.jscsrc',
                tasks: ['jscs']
            },
            lint_eslint: {
                files: '.eslintrc.json',
                tasks: ['eslint']
            },
            ext: {
                files: [
                    'src/functions/*.txt',
                    'src/_main.js',
                    'src/*.css',
                    'src/lang-matlab.js'
                ],
                tasks: ['ext', 'simplemocha']
            },
            userjs: {
                files: [
                    'src/functions/*.txt',
                    'src/_main.js',
                    'src/*.css',
                    'src/*.user.js'
                ],
                tasks: ['userjs']
            },
            unittest: {
                files: ['test/*.js', 'test/fixtures/*.js'],
                tasks: ['test']
            }
        }
    });

    // load grunt plugins for extra tasks
    grunt.loadNpmTasks('grunt-mustache-render');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('mustache_render', 'mustache');

    // register tasks
    grunt.registerTask('lint', 'Lint all source files.', [
        'jshint',
        'jscs',
        'eslint',
        'csslint'
    ]);
    grunt.registerTask('proj', 'Lint project files.', [
        'jshint:proj',
        'jscs:proj',
        'eslint:proj'
    ]);
    grunt.registerTask('ext', 'Build code-prettify extension.', [
        'mustache:ext',
        'jshint:ext',
        'jscs:ext',
        'eslint:ext',
        'csslint:ext',
        'uglify:ext',
        'cssmin:ext'
    ]);
    grunt.registerTask('userjs', 'Build userscripts.', [
        'mustache:userjs',
        'copy:userjs',
        'jshint:userjs',
        'jscs:userjs',
        'eslint:userjs'
    ]);
    grunt.registerTask('build', 'Build all targets.', [
        'proj',
        'ext',
        'userjs'
    ]);
    grunt.registerTask('test', 'Run unit tests.', [
        'jshint:unittest',
        'jscs:unittest',
        'eslint:unittest',
        'simplemocha:unittest'
    ]);
    grunt.registerTask('default', ['build', 'test']);
};
