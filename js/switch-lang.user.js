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
        'div.pp-lang-button { position:relative; text-align: right; opacity: 0.7; }',
        'a.pp-lang-link { color: #fff; background: #88bbd4; padding: 1px 3px 3px 3px; font-size: small; font-weight: bold; cursor: pointer; text-decoration: none; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; }',
        'a.pp-lang-link:hover { background: #59b; }',
        'a.pp-lang-link span { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6%2BR8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNpi%2FP%2F%2FPwMSkARiMSAWAmIuIP4GxO%2BA%2BBUQP4cpYoRqYgdiZajCV1CF36B8IahBIP5dIP4J06QF4gDxPSBGsRpmOBArQQ2%2FxgR1EhceDQxQ8XtQdZJMUKtf4dGArBGkTowF6ua7UIk0PJpmQf2qzIQUSjAJXBoYYIHDhBRKDDg0IvMhFgBDTx%2BI5UChiIbTsIiB1OmDghwUetJAfJZAYICC3RiIn5IVTxSlCJLSHkCAAQBHxG1XMPgc8AAAAABJRU5ErkJggg%3D%3D"); background-repeat: no-repeat; background-position: 100% 50%; padding: 0px 16px 3px 0px;}',
        'a.pp-lang-link.pp-link-active { color:#59b; background-color:#ddeef6; }',
        'a.pp-lang-link.pp-link-active span { background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6%2BR8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMJJREFUeNqcktsKwjAQRJMUUTFaH7wgCH6R%2F%2F8Dvig%2BGKiXIrbOhgnEkCi4cCibznTTSbT6rDmogQVD0IIGOHAJIs3nAKwpdBS27C0%2FJP0RPIN5S5NW%2BdJ8LzpVcUtTcAC9KtcNLEVjONplDPuk76mrDffcFAypUXTWRCmVJsS9D8dEKeUMqdEPkFR24ArO6nctwMSEn%2FsSdxy7D00if4gbjBlrybBigqeKi3cw4znIWgdeYMRz3NAgN6LT%2F9y9twADALObLPXqUJ2JAAAAAElFTkSuQmCC") 100% 50% no-repeat; }',
        'div.pp-lang-menu { position:absolute; top:22px; right:0px; display:none; width:120px; padding:7px 10px; text-align: left; background:#ddeef6; line-height:1.2em; z-index:5000; -moz-border-radius-topleft: 5px; -moz-border-radius-bottomleft: 5px; -moz-border-radius-bottomright: 5px; -webkit-border-top-left-radius: 5px; -webkit-border-bottom-left-radius: 5px; -webkit-border-bottom-right-radius: 5px; }',
        'div.pp-lang-menu a { display:block; color:#59b; font-weight:bold; text-decoration:none; }',
        'div.pp-lang-menu a:active, .pp-lang-menu a:hover { color:#555; }',
    ].join(''));

    // insert JS code
    GM_addScript_inline(function () {
        // add to onReady queue of SE (a stub for jQuery.ready)
        StackExchange.ready(function () {
            add_language_selection_menu();
        });

        // REFERENCE: http://userscripts-mirror.org/scripts/show/71052
        // REFERENCE: http://davidwalsh.name/twitter-dropdown-jquery
        function add_language_selection_menu() {
            "use strict";

            // we require jQuery to be already loaded in the page
            if (typeof jQuery == 'undefined') { return; }

            // languages CSS classes
            var languages = ['default', 'lang-html', 'lang-c', 'lang-java', 'lang-cs',
                'lang-sh', 'lang-pl', 'lang-py', 'lang-rb', 'lang-js', 'lang-matlab'];

            // return closure
            var makeClickHandler = function (pre, lang) {
                // create closure
                return function (e) {
                    // remove existing formatting inside <code> tag, by setting content to plain text again
                    unprettify(pre.children('code'));

                    // set new prettify class
                    pre.removeClass();
                    pre.addClass('prettyprint ' + lang);

                    // change language indicated
                    $(this).parent().prev('.pp-lang-link').children('span').text(lang);

                    // hide languge menu
                    //$(this).parent().slideToggle();

                    // re-apply syntax highlighting
                    prettyPrint();

                    // stop default link-clicking behaviour
                    e.preventDefault();
                };
            };

            // go through each <pre> block, and add language selection menu
            $('pre.prettyprint').each(function () {
                // <pre> block
                var code = $(this);

                // current language used
                var currLang = $.trim(this.className.replace(/prettyprint(ed)?/g, ''));
                if (!currLang) { currLang = 'default'; }

                // create <div> of language selector button
                var button = $('<div class="pp-lang-button" title="choose language"></div>');

                // create and add toggle link
                var link = $('<a class="pp-lang-link"><span>' + currLang + '</span></a>').appendTo(button);

                // create dropmenu and add to button
                var menu = $('<div class="pp-lang-menu"></div>').appendTo(button);

                // transparency animation on hover
                button.hover(
                    function () { $(this).animate({opacity: 1.0}, 'fast'); },
                    function () { $(this).animate({opacity: 0.7}); }
                );

                // button is click event
                link.click(function (e) {
                    // set button as active/non-active
                    $(this).toggleClass('pp-link-active');

                    // show/hide menu
                    $(this).next('.pp-lang-menu').slideToggle();

                    // stop default link-clicking behaviour
                    e.preventDefault();
                });

                // populate it with entries for every language
                for (var i = 0; i < languages.length; i++) {
                    // create link, hook up the click event, and add it to menu
                    $('<a title="set language to: ' + languages[i] + '">' + languages[i] + '</a>')
                        .css({'cursor': 'pointer', 'font-size': 'small'})
                        .click( makeClickHandler(code, languages[i]) ).appendTo(menu);
                }

                // add button to DOM just before the <pre> block
                button.insertBefore(code);
            });
        }

        function unprettify(codeNode) {
            // Note: el.innerHTML, el.textContent vs. $(el).html(), $(el).text()
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

        /*
        <div class="pp-lang-button">
            <a class="pp-lang-link"><span>Language</span></a>
            <div class="pp-lang-menu">
                <a></a>
                <a></a>
            </div>
        </div>
        <pre class="prettyprint">
            <code></code>
        </pre>
        */
    });
})();
