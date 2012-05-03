// REFERENCE: http://userscripts.org/scripts/show/71052
function add_language_selection_menu() {
	"use strict";

	// we require jQuery to be already loaded in the page
	if (typeof jQuery == 'undefined') { return; }

	// languages CSS classes
	var languages = ["default", "lang-html", "lang-c", "lang-java", "lang-cs",
		"lang-sh", "lang-pl", "lang-py", "lang-rb", "lang-js", "lang-matlab"];

	// return closure
	var makeClickHandler = function (pre, lang) {
		// create closure
		return function (e) {
			// set new prettify class
			pre.removeClass();
			pre.addClass("prettyprint " + lang);

			// change language indicated
			pre.prev().children("a").text(lang);

			// hide languge menu
			pre.prev().find(".language-menu").slideToggle();

			// re-apply syntax highlighting
			prettyPrint();

			// stop default link-clicking behaviour
			e.preventDefault();
		};
	};

	// go through each <pre> block, and add language selection menu
	$("pre.prettyprint").each(function () {
		// <pre> block
		var codePRE = $(this);

		// current language used
		var currLang = $.trim(this.className.replace('prettyprint', ''));
		if (!currLang) { currLang = "default"; }

		// create collapsable menu DIV
		var menu = $("<div>").addClass("language-menu").css({
			"position": "absolute",
			"background-color": "#ccc",
			"padding": "10px",
			"left": "670px",
			"top": "-10px",
			"z-index": "777",
			"width": "100px",
			"font-size": "small",
			"text-align": "left"
		}).hide();

		// populate it with entries for every language
		for (var i = 0; i < languages.length; i++) {
			// create link, hook up the click event, and add it to menu
			$("<a>", {
				text: languages[i],
				css: {'cursor': 'pointer'},
				click: makeClickHandler(codePRE, languages[i])
			}).appendTo(menu);
			$("<br>").appendTo(menu);
		}

		// DIV with link to toggle menu
		var d = $("<div>").addClass("language").css({
			"text-align": "right",
			"position": "relative"
		});
		$("<a>", {
			text: currLang,
			css: {'color': '#aaa', 'font-size': 'small', 'cursor': 'pointer'},
			click: function (e) {
				// toggle menu
				$(this).parent().find(".language-menu").slideToggle();

				// stop default link-clicking behaviour
				e.preventDefault();
			}
		}).appendTo(d);
		menu.appendTo(d);	// add menu to DIV

		// add DIV to DOM
		d.insertBefore(codePRE);
	});
}

/*
<div.language>
	<a></a>
	<div.language-menu>
		<a></a>
		<a></a>
		<br/>
	</div>
<div>
<pre.prettyprint>
	<code></code>
</pre>
*/

/*
// add to onReady queue of SE scripts
StackExchange.ready(function () {
	create_language_menus();
});
*/
