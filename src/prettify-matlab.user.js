// ==UserScript==
// @name           StackOverflow: MATLAB highlighter
// @namespace      StackExchange_GoogleCodePrettify_MATLAB
// @description    Adds simple MATLAB syntax highlighting on StackOverflow
// @author         Amro <amroamroamro@gmail.com>
// @version        1.0
// @license        MIT License
// @icon           http://cdn.sstatic.net/stackoverflow/img/favicon.ico
// @include        http://stackoverflow.com/questions/*
// @run-at         document-end
// ==/UserScript==

(function () {
	// create and inject a <script> element into page's DOM, with func source inlined.
	// It will be executed in the page scope, not the Greasemonkey sandbox
	// REFERENCE : http://wiki.greasespot.net/Content_Script_Injection
	function script_inject(func) {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.textContent = '(' + func.toString() + ')();';
		document.body.appendChild(script);		// Insert script into page, so it will run
		//document.body.removeChild(script);	// immediately remove it to clean up
	}

	// GM_addStyle
	function style_inject(css) {
		var style = document.createElement('style');
		style.setAttribute('type', 'text/css');
		style.textContent = css.toString();
		document.getElementsByTagName('head')[0].appendChild(style);
	}

	// insert our custom CSS styles
	style_inject([
		//=INSERT_FILE_AS_STRINGS= ../css/lang-matlab.css
	].join(""));

	script_inject(function () {
		// add to onReady queue of SE scripts
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
			StackExchange.using("prettify", function () {
				// register the new language handlers
				RegisterMATLABLanguageHandlers();

				// look for prettyprint <pre> blocks with embedded HTML5 <code> elements, and explicitly specify the language as MATLAB
				document.getElementById('prettify-lang').textContent = 'lang-matlab';	// lang for the whole page
				var blocks = document.getElementsByTagName('pre');
				for (var i = 0; i < blocks.length; ++i) {
					if (blocks[i].className.indexOf('prettyprint') != -1 && blocks[i].children.length && blocks[i].children[0].tagName === 'CODE') {
						blocks[i].className = 'prettyprint lang-matlab';
					}
				}

				// apply highlighting (calls prettyPrint() function)
				StackExchange.prettify.applyCodeStyling();
			});
		});

		function RegisterMATLABLanguageHandlers() {
			//=INSERT_FILE= ./_main.js
		}
	});
})();
