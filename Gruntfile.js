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
                tasks: ['all']
            },
            ext: {
                files: [
                    'src/functions/*.txt',
                    'src/_main.js',
                    'src/*.css',
                    'src/lang-matlab.js'
                ],
                tasks: ['ext']
            },
            userjs: {
                files: [
                    'src/functions/*.txt',
                    'src/_main.js',
                    'src/*.css',
                    'src/*.user.js'
                ],
                tasks: ['userjs']
            }
        }
    });

    // load grunt plugins for extra tasks
    grunt.loadNpmTasks('grunt-mustache-render');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.renameTask('mustache_render', 'mustache');

    // register tasks
    grunt.registerTask('ext', 'Build code-prettify extension.', [
        'mustache:ext'
    ]);
    grunt.registerTask('userjs', 'Build userscripts.', [
        'mustache:userjs'
    ]);
    grunt.registerTask('all', 'Build all targets.', [
        'ext',
        'userjs'
    ]);
    grunt.registerTask('test', []);  //TODO
    grunt.registerTask('default', ['all']);
};
