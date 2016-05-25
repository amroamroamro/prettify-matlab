// ==UserScript==
// @name           Stack Overflow: MATLAB syntax highlighter
// @namespace      https://github.com/amroamroamro
// @description    Enable MATLAB syntax highlighting on Stack Overflow
// @author         Amro <amroamroamro@gmail.com>
// @homepage       https://github.com/amroamroamro/prettify-matlab
// @version        1.3
// @license        MIT License
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
    if ( !/^\/questions\/(\d+|ask)/.test(window.location.pathname) ) {
        return;
    }

    // insert CSS styles
    GM_addStyle_inline([
        //=INSERT_FILE_QUOTED= ../css/lang-matlab.css
    ].join(''));

    // insert JS code
    GM_addScript_inline(function () {
        // add to onReady queue of SE (a stub for $.ready)
        StackExchange.ready(function () {
            // check if question tags contain MATLAB
            var isMATLAB = false;
            var tags = document.getElementsByClassName('post-tag');
            for (var i = 0; i < tags.length; ++i) {
                if (tags[i].textContent === 'matlab') {
                    isMATLAB = true;
                    break;
                }
            }
            if (!isMATLAB || !StackExchange.options.styleCode) {
                return;
            }

            // check prettify JS library is available, otherwise lazy load it
            StackExchange.using('prettify', function () {
                // register the new language handlers
                RegisterMATLABLanguageHandlers();

                // explicitly specify the lang for the whole page
                var prLang = document.getElementById('prettify-lang');
                prLang.textContent = 'lang-matlab';
                // for each prettyprint <pre> blocks
                var blocks = document.getElementsByTagName('pre');
                for (var i = 0; i < blocks.length; ++i) {
                    // look for embedded HTML5 <code> element
                    if (blocks[i].className.indexOf('prettyprint') != -1 &&
                            blocks[i].children.length &&
                            blocks[i].children[0].tagName === 'CODE') {
                        // remove existing formatting inside <code> tag by
                        // resetting content to plain text. This is necessary
                        // on Stack Overflow to avoid "double-styling"
                        unprettify(blocks[i].children[0]);

                        // set the language to MATLAB
                        blocks[i].className = 'prettyprint lang-matlab';
                    }
                }

                // reapply highlighting (calls window.prettyPrint() function)
                StackExchange.prettify.applyCodeStyling();
            });
        });

        function unprettify(codeNode) {
            // <code> tag
            var code = $(codeNode);
            // html encoded
            var encodedStr = code.html()
                .replace(/<br[^>]*>/g, "\n")
                .replace(/&nbsp;/g, ' ');
            // decode html entities
            var decodedStr = $('<div/>').html(encodedStr).text();
            // text() replaces special characters like `<` with `&lt;`
            code.text(decodedStr);
        }

        function RegisterMATLABLanguageHandlers() {
            //=RENDER_FILE= ./_main.js
        }
    });
})();
