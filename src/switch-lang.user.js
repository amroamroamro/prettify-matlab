// ==UserScript==
// @name           Stack Overflow: switch language of syntax highlighting
// @description    Enable switching the language of syntax highlighting on Stack Overflow
// @namespace      https://github.com/amroamroamro
// @author         Amro <amroamroamro@gmail.com>
// @homepage       https://github.com/amroamroamro/prettify-matlab
// @license        MIT
// @version        1.3
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
        'div.pp-lang-button {',
        '  position: relative;',
        '  text-align: right;',
        '  opacity: 0.7;',
        '}',
        'a.pp-lang-link {',
        '  color: #fff;',
        '  background: #88bbd4;',
        '  padding: 1px 3px 3px 3px;',
        '  font-size: small;',
        '  font-weight: bold;',
        '  cursor: pointer;',
        '  text-decoration: none;',
        '  -webkit-border-radius: 4px;',
        '  -moz-border-radius: 4px;',
        '  border-radius: 4px;',
        '}',
        'a.pp-lang-link:hover {',
        '  background: #59b;',
        '}',
        'a.pp-lang-link span {',
        '  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6%2BR8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNpi%2FP%2F%2FPwMSkARiMSAWAmIuIP4GxO%2BA%2BBUQP4cpYoRqYgdiZajCV1CF36B8IahBIP5dIP4J06QF4gDxPSBGsRpmOBArQQ2%2FxgR1EhceDQxQ8XtQdZJMUKtf4dGArBGkTowF6ua7UIk0PJpmQf2qzIQUSjAJXBoYYIHDhBRKDDg0IvMhFgBDTx%2BI5UChiIbTsIiB1OmDghwUetJAfJZAYICC3RiIn5IVTxSlCJLSHkCAAQBHxG1XMPgc8AAAAABJRU5ErkJggg%3D%3D");',
        '  background-position: 100% 50%;',
        '  background-repeat: no-repeat;',
        '  padding: 0px 16px 3px 0px;',
        '}',
        'a.pp-lang-link.pp-link-active {',
        '  color: #59b;',
        '  background-color: #ddeef6;',
        '}',
        'a.pp-lang-link.pp-link-active span {',
        '  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6%2BR8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMJJREFUeNqcktsKwjAQRJMUUTFaH7wgCH6R%2F%2F8Dvig%2BGKiXIrbOhgnEkCi4cCibznTTSbT6rDmogQVD0IIGOHAJIs3nAKwpdBS27C0%2FJP0RPIN5S5NW%2BdJ8LzpVcUtTcAC9KtcNLEVjONplDPuk76mrDffcFAypUXTWRCmVJsS9D8dEKeUMqdEPkFR24ArO6nctwMSEn%2FsSdxy7D00if4gbjBlrybBigqeKi3cw4znIWgdeYMRz3NAgN6LT%2F9y9twADALObLPXqUJ2JAAAAAElFTkSuQmCC");',
        '  background-position: 100% 50%;',
        '  background-repeat: no-repeat;',
        '}',
        'div.pp-lang-menu {',
        '  position: absolute;',
        '  top: 22px;',
        '  right: 0px;',
        '  display: none;',
        '  width: 120px;',
        '  padding: 7px 10px;',
        '  text-align: left;',
        '  background: #ddeef6;',
        '  line-height: 1.2em;',
        '  z-index: 5000;',
        '  -moz-border-radius-topleft: 5px;',
        '  -moz-border-radius-bottomleft: 5px;',
        '  -moz-border-radius-bottomright: 5px;',
        '  -webkit-border-top-left-radius: 5px;',
        '  -webkit-border-bottom-left-radius: 5px;',
        '  -webkit-border-bottom-right-radius: 5px;',
        '}',
        'div.pp-lang-menu a {',
        '  display: block;',
        '  color: #59b;',
        '  font-weight: bold;',
        '  text-decoration: none;',
        '  cursor: pointer;',
        '  font-size: small;',
        '}',
        'div.pp-lang-menu a:active, .pp-lang-menu a:hover {',
        '  color: #555;',
        '}'
    ].join('\n'));

    // insert JS code
    GM_addScript_inline(function () {
        // add to onReady queue of SE (a stub for jQuery.ready)
        StackExchange.ready(function () {
            // check prettify JS library is available, otherwise lazy load it
            StackExchange.using('prettify', function () {
                // add language selection menus
                addLanguageSelectionMenu();
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

        // REFERENCE: http://userscripts-mirror.org/scripts/show/71052
        // REFERENCE: http://davidwalsh.name/twitter-dropdown-jquery
        /*
        <div class="pp-lang-button">
            <a class="pp-lang-link"><span>Language XXX</span></a>
            <div class="pp-lang-menu">
                <a>Language 1</a>
                <a>Language 2</a>
            </div>
        </div>
        <pre class="prettyprint lang-xxx">
            <code></code>
        </pre>
        */
        function addLanguageSelectionMenu() {
            // languages CSS classes
            var languages = ['default', 'lang-html', 'lang-c', 'lang-java',
                'lang-cs', 'lang-sh', 'lang-pl', 'lang-py', 'lang-rb',
                'lang-js', 'lang-matlab'];

            // go through each <pre> block, prepend language selection menu
            $('pre.prettyprint').each(function () {
                // <pre> block
                var pre = $(this);

                // current language used
                var currLang = $.trim(this.className.replace(/prettyprint(ed)?/g, ''));
                if (!currLang) {
                    currLang = 'default';
                }

                // create language selector button,
                // add it to DOM just before the <pre> block,
                // and add transparency animation on hover
                var button = $('<div/>')
                    .addClass('pp-lang-button')
                    .attr('title', 'choose language')
                    .insertBefore(pre)
                    .hover(
                        function () {
                            $(this).animate({opacity: 1.0}, 'fast');
                        },
                        function () {
                            $(this).animate({opacity: 0.7});
                        }
                    );

                // create toggle link, add it to button, and set click event
                var link = $('<a/>')
                    .addClass('pp-lang-link')
                    .append($('<span/>').text(currLang))
                    .appendTo(button)
                    .click(function (ev) {
                        // set button as active/non-active, and show/hide menu
                        $(this).toggleClass('pp-link-active')
                            .next('.pp-lang-menu').slideToggle();
                        // stop default link-clicking behaviour
                        ev.preventDefault();
                    });

                // create dropmenu and add to button
                var menu = $('<div/>')
                    .addClass('pp-lang-menu')
                    .appendTo(button);

                // populate menu with languages
                $.map(languages, function (lang) {
                    // create link, add it to menu, and set click event
                    $('<a/>')
                        .text(lang)
                        .attr('title', 'set language to: ' + lang)
                        .appendTo(menu)
                        .click(function (ev) {
                            // reset content to plain text
                            unprettify(pre.children('code'));

                            // apply prettyprint class, and set new language
                            pre.removeClass().addClass('prettyprint ' + lang);

                            // change language indicated in selector
                            link.children('span').text(lang);

                            // hide languge menu
                            //menu.slideToggle();

                            // reapply highlighting (calls PR.prettyPrint)
                            StackExchange.prettify.applyCodeStyling();

                            // stop default link-clicking behaviour
                            ev.preventDefault();
                        });
                });
            });
        }
    });
})();
