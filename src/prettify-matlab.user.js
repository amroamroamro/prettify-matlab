// ==UserScript==
// @name           Stack Overflow: MATLAB syntax highlighter
// @description    Enable MATLAB syntax highlighting on Stack Overflow
// @namespace      {{{ pkg.author.url }}}
// @author         {{{ pkg.author.name }}} ({{{ pkg.author.email }}})
// @homepage       {{{ pkg.homepage }}}
// @license        {{{ pkg.license }}}
// @version        2.0
// @icon           http://cdn.sstatic.net/Sites/stackoverflow/img/favicon.ico
// @include        http://stackoverflow.com/questions/*
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

    // activate only on an actual question page
    // (ignore question lists, tag pages, and such)
    if (!/^\/questions\/(\d+|ask)/.test(window.location.pathname)) {
        return;
    }

    // insert CSS styles
    GM_addStyle_inline([
        {{# indentLines2 }}{{# quoteLines }}{{> src/matlab.css }}{{/ quoteLines }}{{/ indentLines2 }}
    ].join('\n'));

    // insert JS code
    GM_addScript_inline(function () {
        // add to onReady queue of SE (a stub for $.ready)
        StackExchange.ready(function () {
            // check if question tags contain MATLAB
            var isMATLAB = $('a.post-tag').is(function () {
                return /matlab/i.test($(this).text());
            });
            if (!isMATLAB || !StackExchange.options.styleCode) {
                return;
            }

            // check prettify JS library is available, otherwise lazy load it
            StackExchange.using('prettify', function () {
                // register the new language handlers
                registerMATLABLanguageHandlers();

                // override the lang for the whole page
                $('#prettify-lang').text('lang-matlab');

                // for each <pre.prettyprint> block,
                // reset content to plain text,
                // then apply prettyprint class, and set language to MATLAB
                $('pre.prettyprint').each(function () {
                    unprettify($(this).children('code'));
                }).removeClass().addClass('prettyprint lang-matlab');

                // reapply highlighting (calls PR.prettyPrint)
                StackExchange.prettify.applyCodeStyling();
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
