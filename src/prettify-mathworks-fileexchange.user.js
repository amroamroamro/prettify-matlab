// ==UserScript==
// @name           MathWorks File Exchange: MATLAB syntax highlighter
// @description    Enable MATLAB syntax highlighting on File Exchange
// @namespace      https://github.com/amroamroamro
// @author         Amro <amroamroamro@gmail.com>
// @homepage       https://github.com/amroamroamro/prettify-matlab
// @license        MIT
// @version        2.0
// @icon           http://www.mathworks.com/favicon.ico
// @include        http://www.mathworks.com/matlabcentral/fileexchange/*
// @include        http://www.mathworks.com/matlabcentral/mlc-downloads/*/index.html
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
    function GM_addScript_external(jsURL) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', jsURL);
        document.getElementsByTagName('head')[0].appendChild(script);
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

    // userscript runs in one of two places:
    if (/^\/matlabcentral\/fileexchange\/\d+/.test(window.location.pathname)) {
        // 1) in parent page => relax iframe sandbox restrictions to allow JS
        var ifrm = document.getElementById('content_iframe');
        if (ifrm && ifrm.getAttribute('sandbox')) {
            //ifrm.sandbox += ' allow-scripts';
            ifrm.removeAttribute('sandbox');  // remove sandbox altogether
        }
        return;
    } else if (!/^\/matlabcentral\/mlc-downloads\//.test(window.location.pathname)) {
        // 2) in iframe page => apply syntax highlighting
        // activate only on source code page (ignore download and such)
        return;
    }

    // load prettify library
    GM_addStyle_external('http://cdn.rawgit.com/google/code-prettify/master/loader/prettify.css');
    GM_addScript_external('http://cdn.rawgit.com/google/code-prettify/master/loader/prettify.js');

    // insert CSS styles
    GM_addStyle_inline([
        //=INSERT_FILE_QUOTED= ./matlab.css
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
        // wait for prettify to load
        waitForPR();

        function waitForPR() {
            if (typeof PR === 'undefined') {
                window.setTimeout(waitForPR, 200);
            } else {
                // register the new language handlers
                registerMATLABLanguageHandlers();

                // for each <pre.matlab-code> block,
                // apply prettyprint class, and set language to MATLAB
                var blocks = document.getElementsByTagName('pre');
                for (var i = 0; i < blocks.length; ++i) {
                    if (blocks[i].className.indexOf('matlab-code') !== -1) {
                        blocks[i].className = 'prettyprint lang-matlab';
                    }
                }

                // apply highlighting
                PR.prettyPrint();
            }
        }

        function registerMATLABLanguageHandlers() {
            //=RENDER_FILE= ./_main.js
        }
    });
})();
