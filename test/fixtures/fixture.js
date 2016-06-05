/* jshint esversion: 6 */
/* jscs:disable disallowMultipleSpaces */
/* eslint-env es6 */
/* eslint-disable no-multi-spaces */

function trimStart(str) {
    // trim trailing spaces multiline
    return str.replace(/^\s+/gm, '');
}

module.exports = [{
    name: 'test1',
    source: trimStart(`
        % example
        function out = fcn(in)
          out = sin(in);
        end
    `),
    tokens: [
        {klass: 'com',  text: '% example'},
        {klass: 'pln',  text: ''},
        {klass: 'kwd',  text: 'function'},
        {klass: 'pln',  text: ''},
        {klass: 'idnt', text: 'out'},
        {klass: 'pln',  text: ''},
        {klass: 'pun',  text: '='},
        {klass: 'pln',  text: ''},
        {klass: 'idnt', text: 'fcn'},
        {klass: 'prn',  text: '('},
        {klass: 'idnt', text: 'in'},
        {klass: 'prn',  text: ')'},
        {klass: 'pln',  text: ''},
        {klass: 'idnt', text: 'out'},
        {klass: 'pln',  text: ''},
        {klass: 'pun',  text: '='},
        {klass: 'pln',  text: ''},
        {klass: 'fun',  text: 'sin'},
        {klass: 'prn',  text: '('},
        {klass: 'idnt', text: 'in'},
        {klass: 'prn',  text: ')'},
        {klass: 'pun',  text: ';'},
        {klass: 'pln',  text: ''},
        {klass: 'kwd',  text: 'end'}
    ]
},
{
    name: 'test2',
    source: trimStart(`
        x = single(linspace(-6,6).');
        plot(x,sin(x), 'LineWidth',2);
    `),
    tokens: [
        {klass: 'idnt', text: 'x'},
        {klass: 'pln',  text: ''},
        {klass: 'pun',  text: '='},
        {klass: 'pln',  text: ''},
        {klass: 'typ',  text: 'single'},
        {klass: 'prn',  text: '('},
        {klass: 'fun',  text: 'linspace'},
        {klass: 'prn',  text: '('},
        {klass: 'lit',  text: '-6'},
        {klass: 'pun',  text: ','},
        {klass: 'lit',  text: '6'},
        {klass: 'prn',  text: ')'},
        {klass: 'pun',  text: '.'},
        {klass: 'tps',  text: "'"},
        {klass: 'prn',  text: ')'},
        {klass: 'pun',  text: ';'},
        {klass: 'pln',  text: ''},
        {klass: 'fun',  text: 'plot'},
        {klass: 'prn',  text: '('},
        {klass: 'idnt', text: 'x'},
        {klass: 'pun',  text: ','},
        {klass: 'fun',  text: 'sin'},
        {klass: 'prn',  text: '('},
        {klass: 'idnt', text: 'x'},
        {klass: 'prn',  text: ')'},
        {klass: 'pun',  text: ','},
        {klass: 'pln',  text: ''},
        {klass: 'str',  text: "'LineWidth'"},
        {klass: 'pun',  text: ','},
        {klass: 'lit',  text: '2'},
        {klass: 'prn',  text: ')'},
        {klass: 'pun',  text: ';'}
    ]
},
{
    name: 'test3',
    source: trimStart(`
        classdef MyClass
            properties
                x
            end
        end
    `),
    tokens: [
        {klass: 'kwd',  text: 'classdef'},
        {klass: 'pln',  text: ''},
        {klass: 'idnt', text: 'MyClass'},
        {klass: 'pln',  text: ''},
        {klass: 'fun',  text: 'properties'},
        {klass: 'pln',  text: ''},
        {klass: 'idnt', text: 'x'},
        {klass: 'pln',  text: ''},
        {klass: 'kwd',  text: 'end'},
        {klass: 'pln',  text: ''},
        {klass: 'kwd',  text: 'end'}
    ]
}];
