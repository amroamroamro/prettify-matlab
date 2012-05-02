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

	// block comments
	//TODO: chokes on nested block comments
	//TODO: false positives when the lines with %{ and %} contain non-spaces
	[PR.PR_COMMENT, /^%\{[^%]*%+(?:[^\}%][^%]*%+)*\}/, null],
	//[PR.PR_COMMENT, /^%(?:[^\{].*|\{(?:%|%*[^\}%])*(?:\}+%?)?)/, null],

	// single-line comments
	[PR.PR_COMMENT, /^%[^\r\n]*/, null, "%"],

	// system commands
	[PR_SYSCMD, /^![^\r\n]*/, null, "!"]

	// opening/closing paranthesis, braces, or brackets
	//['opn', /^[\(\{\[]+/, null, '([{'],
	//['clo', /^[\)\}\]]+/, null, ')]}'],
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

	// do not misdetect the transpose operator ' as the start of a string
	//[PR.PR_PLAIN, /^(?<![0-9a-zA-Z_\)\]\}\.])'/, null],	// JS does not support negative lookbehind
	[PR.PR_PLAIN, /^(?:[0-9a-zA-Z_\)\]\}\.])'/, null],		// therfore do this before detecting valid strings

	// single-quoted strings: allow for escaping with '', no multilines
	//[PR.PR_STRING, /(?:(?<=(?:\(|\[|\{|\s|=|;|,|:))|^)'(?:[^']|'')*'(?=(?:\)|\]|\}|\s|=|;|,|:|~|<|>|&|-|\+|\*|\.|\^|\|))/, null, "'"],	// try to avoid confusion with transpose by checking before/after context (using negative lookbehind, and positive lookahead)
	[PR.PR_STRING, /^'(?:[^']|'')*'/, null, "'"],

	// list of keywords (`iskeyword`)
	[PR.PR_KEYWORD, /^\b(?:break|case|catch|classdef|continue|else|elseif|end|for|function|global|if|otherwise|parfor|persistent|return|spmd|switch|try|while)\b/, null],

	// some specials variables/constants
	[PR.PR_KEYWORD, /^\b(?:true|false|inf|Inf|nan|NaN|eps|pi|ans|nargin|nargout|varargin|varargout)\b/, null],

	// some data types
	[PR.PR_TYPE, /^\b(?:cell|struct|char|double|single|logical|u?int(?:8|16|32|64)|sparse)\b/, null],

	// valid variable names (start with letter, and contains letters, digits, and underscores).
	// HACK: if it is followed by transpose, match except last character which will be matched
	// on the next iteration (along with the ') as PR_PLAIN by the "dont misdetect" pattern
	[PR.PR_PLAIN, /^[a-zA-Z][a-zA-Z0-9_]*(?!')/, null],

	// floating point numbers: 1, 1.0, 1i, -1.1E-1
	[PR.PR_LITERAL, /^[+\-]?\.?\d+(?:\.\d*)?(?:[Ee][+\-]?\d+)?[ij]?/, null]

	// operators
	//[PR.PR_PUNCTUATION, /^[\{\}\(\)\[\]<>=~@&;,:!\-\+\*\^\.\|\\\/]+/]
];

PR.registerLangHandler(
	PR.createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns),
	["matlab"]
);
