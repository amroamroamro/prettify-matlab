// ==UserScript==
// @name           MathWorks Examples: MATLAB syntax highlighter
// @description    Enable MATLAB syntax highlighting on MATLAB Examples
// @namespace      {{{ pkg.author.url }}}
// @author         {{{ pkg.author.name }}} ({{{ pkg.author.email }}})
// @homepage       {{{ pkg.homepage }}}
// @license        {{{ pkg.license }}}
// @version        2.0
// @icon           http://www.mathworks.com/favicon.ico
// @include        http://www.mathworks.com/examples/*
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

    // insert CSS styles
    GM_addStyle_external('http://cdn.rawgit.com/google/code-prettify/master/loader/prettify.css');
    GM_addStyle_inline([
        {{# indentLines2 }}{{# quoteLines }}{{> src/matlab.css }}{{/ quoteLines }}{{/ indentLines2 }}
    ].join('\n'));
    GM_addStyle_inline([
        'pre.prettyprint {',
        '  white-space: pre;',
        '  overflow: auto;',
        '  padding: 10px;',
        '  border: 1px solid #D3D3D3;',
        '  background-color: #F7F7F7;',
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
                // for each <pre.codeinput> block,
                // reset content to plain text,
                // then apply prettyprint class, and set language to MATLAB
                $('pre.codeinput').each(function () {
                    unprettify($(this));
                }).addClass('prettyprint lang-matlab');

                // apply highlighting
                PR.prettyPrint();
            });
        });

        function unprettify(code) {
            // html encoded
            var encodedStr = code.html()
                .replace(/<br[^>]*>/g, '\n')
                .replace(/&nbsp;/g, ' ');
            // decode html entities
            var decodedStr = $('<div/>').html(encodedStr).text();
            // text() replaces special characters like `<` with `&lt;`
            code.text(decodedStr);
        }

        function registerMATLABLanguageHandlers() {
            {{# indentLines3 }}{{> src/_main.js }}{{/ indentLines3 }}
        }
    });
})();
