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
	PR_FUNCTION = "fun",
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

	// commonly used builtin MATLAB functions
	// Refer to: http://www.mathworks.com/help/techdoc/ref/f16-6011.html
	[PR_FUNCTION, /^\b(?:abs|accumarray|acos|acot|acsc|actxcontrol|actxserver|addlistener|addpath|alim|all|alpha|and|angle|annotation|any|area|arrayfun|asec|asin|assert|assignin|atan|atan2|autumn|axes|axis|bar|bar3|besselj|beta|bin2dec|bitand|bitget|bitor|bitset|blkdiag|bone|box|brighten|bsxfun|calllib|cart2pol|cast|cat|caxis|cd|ceil|cell2mat|cellfun|cellstr|chol|cla|clabel|class|clc|clear|clearvars|clf|clock|close|colon|colorbar|colormap|colperm|comet|complex|computer|cond|conj|contour|contour3|contourc|contourf|contourslice|conv|conv2|convhull|cool|copper|copyfile|copyobj|corrcoef|cos|cot|cov|cross|csc|csvread|csvwrite|ctranspose|cumprod|cumsum|cumtrapz|daspect|date|datenum|datestr|datetick|datevec|deal|dec2bin|deconv|del2|delaunay|delaunayn|delete|det|diag|diary|diff|dir|disp|display|dlmread|dlmwrite|doc|dos|dot|drawnow|echo|edit|eig|eigs|ellipsoid|eq|erf|erfc|error|errorbar|errordlg|eval|evalc|evalin|exist|exit|exp|expm|expm1|eye|ezcontour|ezcontourf|ezmesh|ezplot|ezplot3|ezpolar|ezsurf|ezsurfc|factor|factorial|fclose|feature|feof|ferror|feval|fft|fft2|fftshift|fgetl|fgets|fieldnames|figure|fileparts|fileread|filesep|fill|fill3|filter|filter2|find|findall|findobj|findstr|fix|flag|flipdim|fliplr|flipud|floor|fminbnd|fminsearch|fopen|format|fplot|fprintf|fread|frewind|fscanf|fseek|ftell|full|fullfile|fwrite|fzero|gamma|gammaln|gca|gcbo|gcd|gcf|ge|genpath|get|getenv|getfield|getframe|ginput|gplot|gradient|gray|grid|griddata|gt|gtext|guidata|guihandles|hankel|help|helpdlg|hess|hex2num|hgclose|hgfeval|hgload|hgsave|hist|histc|hold|home|hot|hsv|hsv2rgb|hypot|ichol|ifft|ifft2|ifftshift|imag|image|imagesc|imfinfo|import|importdata|imread|imwrite|ind2rgb|ind2sub|inmem|input|inputdlg|inputname|inputParser|int2str|integral|interp|interp1|interp2|interp3|interpn|intersect|intmax|intmin|inv|isa|iscellstr|ischar|iscolumn|isdir|isempty|isequal|isfinite|isfloat|ishandle|ishghandle|ishold|isinf|isinteger|isjava|iskeyword|islogical|ismac|ismatrix|ismember|isnan|isnumeric|ispc|isprime|isreal|isrow|issorted|issparse|isstr|isstrprop|isstruct|isunix|isvarname|isvector)\b/, null],
	[PR_FUNCTION, /^\b(?:javaaddpath|javaArray|javaclasspath|javacomponent|javaMethod|javaMethodEDT|javaObject|javaObjectEDT|javarmpath|jet|keyboard|kron|lastwarn|lcm|ldivide|ldl|le|legend|length|libfunctions|libfunctionsview|libisloaded|libpointer|libstruct|lighting|line|lines|linkaxes|linkprop|linsolve|linspace|load|loadlibrary|log|log10|log2|loglog|logm|logspace|lookfor|lower|ls|lscov|lsqr|lt|lu|magic|mat2cell|mat2str|matlabpath|matlabroot|max|mean|median|membrane|memory|mesh|meshc|meshgrid|meshz|metaclass|methods|methodsview|mex|mexext|mfilename|min|minus|mkdir|mldivide|mod|mode|more|movefile|movegui|movie|mpower|mrdivide|msgbox|mtimes|namelengthmax|nargchk|narginchk|nargoutchk|native2unicode|nchoosek|ndgrid|ndims|ne|NET|newplot|nextpow2|nnz|nonzeros|norm|not|now|null|num2cell|num2hex|num2str|numel|ones|open|or|orderfields|pack|pan|patch|path|pathsep|pause|pchip|pcode|pcolor|peaks|perl|perms|permute|pie|pink|pinv|plot|plot3|plotmatrix|plotyy|plus|pol2cart|polar|polyfit|polyval|pow2|power|ppval|prefdir|primes|print|prod|profile|publish|pwd|qhull|qr|quad|questdlg|quit|quiver|quiver3|qz|rand|randi|randn|randperm|RandStream|rank|rat|rcond|real|realmax|realmin|rectangle|refresh|regexp|regexpi|regexprep|rehash|rem|repmat|reshape|rgb2hsv|rgb2ind|rgbplot|rmdir|rmpath|rng|roots|rose|rot90|rotate|rotate3d|round|rref|run|save|saveas|savepath|scatter|scatter3|schur|sec|semilogx|semilogy|set|setdiff|setenv|setfield|setxor|shading|shiftdim|sign|sin|size|slice|sort|sortrows|spalloc|sparsfun|spdiags|speye|spfun|sphere|spline|spones|sprand|sprandn|sprank|spring|sprintf|spy|sqrt|sqrtm|squeeze|sscanf|stairs|std|stem|stem3|str2double|str2mat|str2num|strcat|strcmp|strcmpi|strfind|strjust|strmatch|strncmp|strncmpi|strread|strrep|strtok|strtrim|struct2cell|structfun|strvcat|sub2ind|subplot|subsasgn|subspace|subsref|sum|summer|surf|surface|surfc|svd|svds|system|tan|tempdir|tempname|text|textread|textscan|tic|timer|times|timeseries|title|toc|toeplitz|toolboxdir|trace|transpose|trapz|tril|TriScatteredInterp|triu|type|typecast|uicontextmenu|uicontrol|uigetdir|uigetfile|uimenu|uitoggletool|uitoolbar|unicode2native|union|unique|unix|unloadlibrary|unwrap|upper|urlread|urlwrite|validateattributes|vander|var|ver|verLessThan|version|vertcat|view|voronoi|voronoin|waitbar|waitfor|warndlg|warning|web|which|who|whos|winopen|winter|xlabel|xlim|xlsread|xlswrite|xor|ylabel|ylim|zeros|zlabel|zlim|zoom)\b/, null],

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
