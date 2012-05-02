// ==UserScript==
// @name           StackOverflow: MATLAB highlighter
// @namespace      StackExchange_GoogleCodePrettify_MATLAB
// @description    Adds simple MATLAB syntax highlighting on StackOverflow
// @author         Amro <amroamroamro@gmail.com>
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
		'@media screen {',
		'	/* plain text: #000; */',
		'	.lang-matlab .pln { color: #000000; }',
		'	/* comments: #808080; */',
		'	.lang-matlab .com { color: #228B22; }',
		'	/* literals: #066; #000; */',
		'	.lang-matlab .lit { color: #800000; }',
		'	/* system commands */',
		'	.lang-matlab .syscmd { color: #B28C00; }',
		'	/* line continuation */',
		'	.lang-matlab .linecont { color: #0000FF; }',
		'	/* code output */',
		'	.lang-matlab .codeoutput { color: #666666; font-style: italic; }',
		'}'
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
			/*
				PR_PLAIN: plain text
				PR_STRING: string literals
				PR_KEYWORD: keywords
				PR_COMMENT: comments
				PR_TYPE: types
				PR_LITERAL: literal values (1, null, true, ..)
				PR_PUNCTUATION: punctuation string
				PR_SOURCE: embedded source
				PR_DECLARATION: markup declaration such as a DOCTYPE
				PR_TAG: sgml tag
				PR_ATTRIB_NAME: sgml attribute name
				PR_ATTRIB_VALUE: sgml attribute value
			*/
			var PR_SYSCMD = "syscmd",
				PR_LINE_CONTINUATION = "linecont",
				PR_CODE_OUTPUT = "codeoutput";
			
			// patterns that always start with a known character. Must have a shortcut string.
			var shortcutStylePatterns = [
				// whitespaces: space, tab, carriage return, line feed, line tab, form-feed, non-break space
				[PR.PR_PLAIN, /^[ \t\r\n\v\f\xA0]+/, null, " \t\r\n\u000b\u000c\u00a0"],
			
				// single-line comments
				[PR.PR_COMMENT, /^%[^\r\n]*/, null, "%"],
			
				// system commands
				[PR_SYSCMD, /^![^\r\n]*/, null, "!"]
			];
			
			// patterns that will be tried in order if the shortcut ones fail. May have shortcuts.
			var fallthroughStylePatterns = [
				// line continuation
				[PR_LINE_CONTINUATION, /^\.\.\.\s*[\r\n]/, null],
			
				// command outputs (both loose/compact format)
				/*
				>> EXP
				VAR = 
				     VAL
				*/
				[PR_CODE_OUTPUT, /^>>\s+[^\r\n]*[\r\n]{1,2}[^=]*=[^\r\n]*[\r\n]{1,2}[^\r\n]*/, null],
			
				// floating point numbers: 1, 1.0, 1i, -1.1E-1
				[PR.PR_LITERAL, /^[+\-]?\.?\d+(?:\.\d*)?(?:[Ee][+\-]?\d+)?[ij]?/, null]
			];
			
			PR.registerLangHandler(
				PR.createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns),
				["matlab"]
			);
		}
	});
})();
