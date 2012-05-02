/**
 * @fileoverview
 * Registers a language handler for MATLAB.
 *
 * To use, include prettify.js and this file in your HTML page.
 * Then put your code inside an HTML tag like
 *     <pre class="prettyprint lang-matlab">
 *     </pre>
 */
(function (PR) {
	// patterns that always start with a known character. Must have a shortcut string.
	var shortcutStylePatterns = [
	];
	
	// patterns that will be tried in order if the shortcut ones fail. May have shortcuts.
	var fallthroughStylePatterns = [
	];
	
	PR.registerLangHandler(
		PR.createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns),
		["matlab"]
	);
})(window.PR);
