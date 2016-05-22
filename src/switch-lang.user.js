// ==UserScript==
// @name           Stack Overflow: switch language of syntax highlighting
// @namespace      https://github.com/amroamroamro
// @description    Enable switching the language of syntax highlighting on Stack Overflow
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
        //=INSERT_FILE_QUOTED= ../css/switch_lang.css
    ].join(''));

    // insert JS code
    GM_addScript_inline(function () {
        // add to onReady queue of SE (a stub for jQuery.ready)
        StackExchange.ready(function () {
            add_language_selection_menu();
        });

        //=INSERT_FILE= ./_switch_lang.js
    });
})();
