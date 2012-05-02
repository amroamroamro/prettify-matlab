// Copyright (c) 2012 by Amro <amroamroamro@gmail.com>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
	
		// list of keywords (`iskeyword`)
		[PR.PR_KEYWORD, /^\b(?:break|case|catch|classdef|continue|else|elseif|end|for|function|global|if|otherwise|parfor|persistent|return|spmd|switch|try|while)\b/, null],
	
		// some specials variables/constants
		[PR.PR_KEYWORD, /^\b(?:true|false|inf|Inf|nan|NaN|eps|pi|ans|nargin|nargout|varargin|varargout)\b/, null],
	
		// some data types
		[PR.PR_TYPE, /^\b(?:cell|struct|char|double|single|logical|u?int(?:8|16|32|64)|sparse)\b/, null],
	
		// floating point numbers: 1, 1.0, 1i, -1.1E-1
		[PR.PR_LITERAL, /^[+\-]?\.?\d+(?:\.\d*)?(?:[Ee][+\-]?\d+)?[ij]?/, null]
	];
	
	PR.registerLangHandler(
		PR.createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns),
		["matlab"]
	);
})(window.PR);
