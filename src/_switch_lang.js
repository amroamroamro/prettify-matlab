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
