// ==UserScript==
// @name           MathWorks Answers: MATLAB syntax highlighter
// @description    Enable MATLAB syntax highlighting on MATLAB Answers
// @namespace      {{{ pkg.author.url }}}
// @author         {{{ pkg.author.name }}} ({{{ pkg.author.email }}})
// @homepage       {{{ pkg.homepage }}}
// @license        {{{ pkg.license }}}
// @version        2.0
// @icon           http://www.mathworks.com/favicon.ico
// @include        http://www.mathworks.com/matlabcentral/answers/*
// @run-at         document-end
// @grant          none
// ==/UserScript==

(function () {
    // helper functions to inject <script> and <style> elements into page DOM
    // (as a way to executd in page scope, escaping the Greasemonkey sandbox)
    // REFERENCE : https://wiki.greasespot.net/Content_Script_Injection
    function GM_addScript_inline(jsFunc) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.textContent = '(' + jsFunc.toString() + ')();';
        document.body.appendChild(script);
        //document.body.removeChild(script);
    }
    function GM_addStyle_inline(cssTxt) {
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = cssTxt.toString();
        document.getElementsByTagName('head')[0].appendChild(style);
    }
    function GM_addStyle_external(cssURL) {
        var style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('type', 'text/css');
        style.setAttribute('href', cssURL);
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    // activate only on an actual question page
    // (ignore question lists, and such)
    if (!/^\/matlabcentral\/answers\/\d+/.test(window.location.pathname)) {
        return;
    }

    // insert CSS styles
    GM_addStyle_external('http://cdn.rawgit.com/google/code-prettify/master/loader/prettify.css');
    GM_addStyle_inline([
        {{# indentLines2 }}{{# quoteLines }}{{> src/matlab.css }}{{/ quoteLines }}{{/ indentLines2 }}
    ].join('\n'));
    GM_addStyle_inline([
        'pre.prettyprint {',
        '  white-space: pre;',
        '  overflow: auto;',
        '  padding: 9.5px;',
        '  border: 1px solid #CCC;',
        '  background-color: #F5F5F5;',
        '}'
    ].join('\n'));

    // insert JS code
    GM_addScript_inline(function () {
        // use jQuery Deferred to load prettify, then execute our code
        $.ajax({
            cache: true,
            async: true,
            dataType: 'script',
            url: 'http://cdn.rawgit.com/google/code-prettify/master/loader/prettify.js'
        }).done(function () {
            // register the new language handlers
            registerMATLABLanguageHandlers();

            // on DOMContentLoaded
            $(document).ready(function () {
                // merge consecutive PRE blocks into one
                $('pre').filter(function () {
                    // find first PRE from each group of PRE elements
                    // (check if it's followed by PRE, but not preceded by one)
                    return ($(this).next().is('pre')) &&
                        !($(this).prev().is('pre'));
                }).each(function () {
                    // get all following PRE elements
                    var el = $(this).nextUntil(function () {
                        // until something not PRE
                        return !($(this).is('pre'));
                    });

                    // get their html content, merge as one,
                    // and append content to first PRE
                    $(this).append('\n' + el.map(function () {
                        return $(this).html();
                    }).get().join('\n'));

                    // remove those PRE elements
                    el.remove();
                });

                // for each <pre.language-matlab> block,
                // apply prettyprint class, and set language to MATLAB
                $('pre.language-matlab').addClass('prettyprint lang-matlab');

                // apply highlighting
                PR.prettyPrint();
            });
        });

        function registerMATLABLanguageHandlers() {
            {{# indentLines3 }}{{> src/_main.js }}{{/ indentLines3 }}
        }
    });
})();
