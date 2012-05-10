// ==UserScript==
// @name           StackOverflow: MATLAB highlighter
// @namespace      StackExchange_GoogleCodePrettify_MATLAB
// @description    Adds simple MATLAB syntax highlighting on StackOverflow
// @author         Amro <amroamroamro@gmail.com>
// @version        1.1
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

	// activate only on an actual question page (ignore question lists, tag pages, and such)
	if ( !/^\/questions\/(\d+|ask)/.test(window.location.pathname) ) {
		return;
	}
	
	// insert our custom CSS styles
	style_inject([
		'@media screen {',
		'	/* plain text: #000; */',
		'	.lang-matlab .pln { color: #000000; }',
		'	/* strings: #080; #800000; */',
		'	.lang-matlab .str { color: #A020F0; }',
		'	/* keywords: #00008B; */',
		'	.lang-matlab .kwd { color: #0000FF; }',
		'	/* comments: #808080; */',
		'	.lang-matlab .com { color: #228B22; }',
		'	/* types: #606; */',
		'	.lang-matlab .typ { color: #000000; font-weight: bold; }',
		'	/* literals: #066; #000; */',
		'	.lang-matlab .lit { color: #800000; }',
		'	/* punctuation: #660; */',
		'	.lang-matlab .pun { color: #000000; }',
		'	/* tag: #008; */',
		'	.lang-matlab .tag { color: #000000; }',
		'	/* identifiers */',
		'	.lang-matlab .ident { color: #000000; }',
		'	/* special variables/constants: darkblue */',
		'	.lang-matlab .const { color: #00008B; }',
		'	/* core functions: #2B91AF; #004444; #444400; #440044; */',
		'	.lang-matlab .fun { color: #2B91AF; }',
		'	/* toolbox functions: #2B91AF; #004444; #444400; #440044; */',
		'	.lang-matlab .fun_tbx { color: #2B91AF; }',
		'	/* system commands */',
		'	.lang-matlab .syscmd { color: #B28C00; }',
		'	/* code output */',
		'	.lang-matlab .codeoutput { color: #666666; }',
		'	/* error messages */',
		'	.lang-matlab .err { color: #E60000; }',
		'	/* warning messages */',
		'	.lang-matlab .wrn { color: #FF6400; }',
		'	/* transpose operator */',
		'	.lang-matlab .transpose { color: #000000; }',
		'	/* line continuation */',
		'	.lang-matlab .linecont { color: #0000FF; }',
		'	/* unterminated strings */',
		'	.lang-matlab .untermstring { color: #B20000; }',
		'}',
	].join(""));

	script_inject(function () {
		// add to onReady queue of SE (a stub for $.ready)
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

				// explicitly specify the lang for the whole page
				document.getElementById('prettify-lang').textContent = 'lang-matlab';
				// for each prettyprint <pre> blocks
				var blocks = document.getElementsByTagName('pre');
				for (var i = 0; i < blocks.length; ++i) {
					// look for embedded HTML5 <code> element
					if (blocks[i].className.indexOf('prettyprint') != -1 && blocks[i].children.length && blocks[i].children[0].tagName === 'CODE') {
						// remove existing formatting inside <code> tag, by setting content to plain text again
						// This was necessary on Stack Overflow to avoid "double-styling"!
						unprettify(blocks[i].children[0]);
						
						// set the language to MATLAB
						blocks[i].className = 'prettyprint lang-matlab';
					}
				}

				// reapply highlighting (calls window.prettyPrint() function)
				StackExchange.prettify.applyCodeStyling();
			});
		});

		function unprettify(codeNode) {
			var code = $(codeNode);		// <code> tag
			var encodedStr = code.html().replace(/<br[^>]*>/g, "\n").replace(/&nbsp;/g, " ");	// html encoded
			var decodedStr = $("<div/>").html(encodedStr).text();	// decode html entities
			code.text(decodedStr);		// text() replaces special characters like `<` with `&lt;`
		}
		
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
			var PR_IDENTIFIER = "ident",
				PR_CONSTANT = "const",
				PR_FUNCTION = "fun",
				PR_FUNCTION_TOOLBOX = "fun_tbx",
				PR_SYSCMD = "syscmd",
				PR_CODE_OUTPUT = "codeoutput",
				PR_ERROR = "err",
				PR_WARNING = "wrn",
				PR_TRANSPOSE = "transpose",
				PR_LINE_CONTINUATION = "linecont";
			
			// Refer to: http://www.mathworks.com/help/techdoc/ref/f16-6011.html
			var coreFunctions = 'abs|accumarray|acos|acosd|acosh|acot|acotd|acoth|acsc|acscd|acsch|actxcontrol|actxcontrollist|actxcontrolselect|actxGetRunningServer|actxserver|addlistener|addpath|addpref|addtodate|airy|align|alim|all|allchild|alpha|alphamap|amd|ancestor|and|angle|annotation|any|area|arrayfun|asec|asecd|asech|asin|asind|asinh|assert|assignin|atan|atan2|atand|atanh|audiodevinfo|audioplayer|audiorecorder|aufinfo|auread|autumn|auwrite|avifile|aviinfo|aviread|axes|axis|balance|bar|bar3|bar3h|barh|base2dec|beep|BeginInvoke|bench|besselh|besseli|besselj|besselk|bessely|beta|betainc|betaincinv|betaln|bicg|bicgstab|bicgstabl|bin2dec|bitand|bitcmp|bitget|bitmax|bitnot|bitor|bitset|bitshift|bitxor|blanks|blkdiag|bone|box|brighten|brush|bsxfun|builddocsearchdb|builtin|bvp4c|bvp5c|bvpget|bvpinit|bvpset|bvpxtend|calendar|calllib|callSoapService|camdolly|cameratoolbar|camlight|camlookat|camorbit|campan|campos|camproj|camroll|camtarget|camup|camva|camzoom|cart2pol|cart2sph|cast|cat|caxis|cd|cdf2rdf|cdfepoch|cdfinfo|cdflib(?:\.(?:close|closeVar|computeEpoch|computeEpoch16|create|createAttr|createVar|delete|deleteAttr|deleteAttrEntry|deleteAttrgEntry|deleteVar|deleteVarRecords|epoch16Breakdown|epochBreakdown|getAttrEntry|getAttrgEntry|getAttrMaxEntry|getAttrMaxgEntry|getAttrName|getAttrNum|getAttrScope|getCacheSize|getChecksum|getCompression|getCompressionCacheSize|getConstantNames|getConstantValue|getCopyright|getFileBackward|getFormat|getLibraryCopyright|getLibraryVersion|getMajority|getName|getNumAttrEntries|getNumAttrgEntries|getNumAttributes|getNumgAttributes|getReadOnlyMode|getStageCacheSize|getValidate|getVarAllocRecords|getVarBlockingFactor|getVarCacheSize|getVarCompression|getVarData|getVarMaxAllocRecNum|getVarMaxWrittenRecNum|getVarName|getVarNum|getVarNumRecsWritten|getVarPadValue|getVarRecordData|getVarReservePercent|getVarsMaxWrittenRecNum|getVarSparseRecords|getVersion|hyperGetVarData|hyperPutVarData|inquire|inquireAttr|inquireAttrEntry|inquireAttrgEntry|inquireVar|open|putAttrEntry|putAttrgEntry|putVarData|putVarRecordData|renameAttr|renameVar|setCacheSize|setChecksum|setCompression|setCompressionCacheSize|setFileBackward|setFormat|setMajority|setReadOnlyMode|setStageCacheSize|setValidate|setVarAllocBlockRecords|setVarBlockingFactor|setVarCacheSize|setVarCompression|setVarInitialRecs|setVarPadValue|SetVarReservePercent|setVarsCacheSize|setVarSparseRecords))?|cdfread|cdfwrite|ceil|cell2mat|cell2struct|celldisp|cellfun|cellplot|cellstr|cgs|checkcode|checkin|checkout|chol|cholinc|cholupdate|circshift|cla|clabel|class|clc|clear|clearvars|clf|clipboard|clock|close|closereq|cmopts|cmpermute|cmunique|colamd|colon|colorbar|colordef|colormap|colormapeditor|colperm|Combine|comet|comet3|commandhistory|commandwindow|compan|compass|complex|computer|cond|condeig|condest|coneplot|conj|containers\.Map|contour|contour3|contourc|contourf|contourslice|contrast|conv|conv2|convhull|convhulln|convn|cool|copper|copyfile|copyobj|corrcoef|cos|cosd|cosh|cot|cotd|coth|cov|cplxpair|cputime|createClassFromWsdl|createSoapMessage|cross|csc|cscd|csch|csvread|csvwrite|ctranspose|cumprod|cumsum|cumtrapz|curl|customverctrl|cylinder|daqread|daspect|datacursormode|datatipinfo|date|datenum|datestr|datetick|datevec|dbclear|dbcont|dbdown|dblquad|dbmex|dbquit|dbstack|dbstatus|dbstep|dbstop|dbtype|dbup|dde23|ddeget|ddesd|ddeset|deal|deblank|dec2base|dec2bin|dec2hex|decic|deconv|del2|delaunay|delaunay3|delaunayn|DelaunayTri|delete|demo|depdir|depfun|det|detrend|deval|diag|dialog|diary|diff|diffuse|dir|disp|display|dither|divergence|dlmread|dlmwrite|dmperm|doc|docsearch|dos|dot|dragrect|drawnow|dsearch|dsearchn|dynamicprops|echo|echodemo|edit|eig|eigs|ellipj|ellipke|ellipsoid|empty|enableNETfromNetworkDrive|enableservice|EndInvoke|enumeration|eomday|eq|erf|erfc|erfcinv|erfcx|erfinv|error|errorbar|errordlg|etime|etree|etreeplot|eval|evalc|evalin|event\.(?:EventData|listener|PropertyEvent|proplistener)|exifread|exist|exit|exp|expint|expm|expm1|export2wsdlg|eye|ezcontour|ezcontourf|ezmesh|ezmeshc|ezplot|ezplot3|ezpolar|ezsurf|ezsurfc|factor|factorial|fclose|feather|feature|feof|ferror|feval|fft|fft2|fftn|fftshift|fftw|fgetl|fgets|fieldnames|figure|figurepalette|fileattrib|filebrowser|filemarker|fileparts|fileread|filesep|fill|fill3|filter|filter2|find|findall|findfigs|findobj|findstr|finish|fitsdisp|fitsinfo|fitsread|fitswrite|fix|flag|flipdim|fliplr|flipud|floor|flow|fminbnd|fminsearch|fopen|format|fplot|fprintf|frame2im|fread|freqspace|frewind|fscanf|fseek|ftell|FTP|full|fullfile|func2str|functions|funm|fwrite|fzero|gallery|gamma|gammainc|gammaincinv|gammaln|gca|gcbf|gcbo|gcd|gcf|gco|ge|genpath|genvarname|get|getappdata|getenv|getfield|getframe|getpixelposition|getpref|ginput|gmres|gplot|grabcode|gradient|gray|graymon|grid|griddata|griddata3|griddatan|griddedInterpolant|gsvd|gt|gtext|guidata|guide|guihandles|gunzip|gzip|h5create|h5disp|h5info|h5read|h5readatt|h5write|h5writeatt|hadamard|handle|hankel|hdf|hdf5|hdf5info|hdf5read|hdf5write|hdfinfo|hdfread|hdftool|help|helpbrowser|helpdesk|helpdlg|helpwin|hess|hex2dec|hex2num|hgexport|hggroup|hgload|hgsave|hgsetget|hgtransform|hidden|hilb|hist|histc|hold|home|horzcat|hostid|hot|hsv|hsv2rgb|hypot|ichol|idivide|ifft|ifft2|ifftn|ifftshift|ilu|im2frame|im2java|imag|image|imagesc|imapprox|imfinfo|imformats|import|importdata|imread|imwrite|ind2rgb|ind2sub|inferiorto|info|inline|inmem|inpolygon|input|inputdlg|inputname|inputParser|inspect|instrcallback|instrfind|instrfindall|int2str|integral|integral2|integral3|interp1|interp1q|interp2|interp3|interpft|interpn|interpstreamspeed|intersect|intmax|intmin|inv|invhilb|ipermute|isa|isappdata|iscell|iscellstr|ischar|iscolumn|isdir|isempty|isequal|isequaln|isequalwithequalnans|isfield|isfinite|isfloat|isglobal|ishandle|ishghandle|ishold|isinf|isinteger|isjava|iskeyword|isletter|islogical|ismac|ismatrix|ismember|ismethod|isnan|isnumeric|isobject|isocaps|isocolors|isonormals|isosurface|ispc|ispref|isprime|isprop|isreal|isrow|isscalar|issorted|isspace|issparse|isstr|isstrprop|isstruct|isstudent|isunix|isvarname|isvector|javaaddpath|javaArray|javachk|javaclasspath|javacomponent|javaMethod|javaMethodEDT|javaObject|javaObjectEDT|javarmpath|jet|keyboard|kron|lasterr|lasterror|lastwarn|lcm|ldivide|ldl|le|legend|legendre|length|libfunctions|libfunctionsview|libisloaded|libpointer|libstruct|license|light|lightangle|lighting|lin2mu|line|lines|linkaxes|linkdata|linkprop|linsolve|linspace|listdlg|listfonts|load|loadlibrary|loadobj|log|log10|log1p|log2|loglog|logm|logspace|lookfor|lower|ls|lscov|lsqnonneg|lsqr|lt|lu|luinc|magic|makehgtform|mat2cell|mat2str|material|matfile|matlab\.io\.MatFile|matlab\.mixin\.(?:Copyable|Heterogeneous(?:\.getDefaultScalarElement)?)|matlabrc|matlabroot|max|maxNumCompThreads|mean|median|membrane|memmapfile|memory|menu|mesh|meshc|meshgrid|meshz|meta\.(?:class(?:\.fromName)?|DynamicProperty|EnumeratedValue|event|MetaData|method|package(?:\.(?:fromName|getAllPackages))?|property)|metaclass|methods|methodsview|mex(?:\.getCompilerConfigurations)?|MException|mexext|mfilename|min|minres|minus|mislocked|mkdir|mkpp|mldivide|mlint|mlintrpt|mlock|mmfileinfo|mmreader|mod|mode|more|move|movefile|movegui|movie|movie2avi|mpower|mrdivide|msgbox|mtimes|mu2lin|multibandread|multibandwrite|munlock|namelengthmax|nargchk|narginchk|nargoutchk|native2unicode|nccreate|ncdisp|nchoosek|ncinfo|ncread|ncreadatt|ncwrite|ncwriteatt|ncwriteschema|ndgrid|ndims|ne|NET(?:\.(?:addAssembly|Assembly|convertArray|createArray|createGeneric|disableAutoRelease|enableAutoRelease|GenericClass|invokeGenericMethod|NetException|setStaticProperty))?|netcdf\.(?:abort|close|copyAtt|create|defDim|defGrp|defVar|defVarChunking|defVarDeflate|defVarFill|defVarFletcher32|delAtt|endDef|getAtt|getChunkCache|getConstant|getConstantNames|getVar|inq|inqAtt|inqAttID|inqAttName|inqDim|inqDimID|inqDimIDs|inqFormat|inqGrpName|inqGrpNameFull|inqGrpParent|inqGrps|inqLibVers|inqNcid|inqUnlimDims|inqVar|inqVarChunking|inqVarDeflate|inqVarFill|inqVarFletcher32|inqVarID|inqVarIDs|open|putAtt|putVar|reDef|renameAtt|renameDim|renameVar|setChunkCache|setDefaultFormat|setFill|sync)|newplot|nextpow2|nnz|noanimate|nonzeros|norm|normest|not|notebook|now|nthroot|null|num2cell|num2hex|num2str|numel|nzmax|ode113|ode15i|ode15s|ode23|ode23s|ode23t|ode23tb|ode45|odeget|odeset|odextend|onCleanup|ones|open|openfig|opengl|openvar|optimget|optimset|or|ordeig|orderfields|ordqz|ordschur|orient|orth|pack|padecoef|pagesetupdlg|pan|pareto|parseSoapResponse|pascal|patch|path|path2rc|pathsep|pathtool|pause|pbaspect|pcg|pchip|pcode|pcolor|pdepe|pdeval|peaks|perl|perms|permute|pie|pink|pinv|planerot|playshow|plot|plot3|plotbrowser|plotedit|plotmatrix|plottools|plotyy|plus|pol2cart|polar|poly|polyarea|polyder|polyeig|polyfit|polyint|polyval|polyvalm|pow2|power|ppval|prefdir|preferences|primes|print|printdlg|printopt|printpreview|prod|profile|profsave|propedit|propertyeditor|psi|publish|PutCharArray|PutFullMatrix|PutWorkspaceData|pwd|qhull|qmr|qr|qrdelete|qrinsert|qrupdate|quad|quad2d|quadgk|quadl|quadv|questdlg|quit|quiver|quiver3|qz|rand|randi|randn|randperm|RandStream(?:\.(?:create|getDefaultStream|getGlobalStream|list|setDefaultStream|setGlobalStream))?|rank|rat|rats|rbbox|rcond|rdivide|readasync|real|reallog|realmax|realmin|realpow|realsqrt|record|rectangle|rectint|recycle|reducepatch|reducevolume|refresh|refreshdata|regexp|regexpi|regexprep|regexptranslate|rehash|rem|Remove|RemoveAll|repmat|reset|reshape|residue|restoredefaultpath|rethrow|rgb2hsv|rgb2ind|rgbplot|ribbon|rmappdata|rmdir|rmfield|rmpath|rmpref|rng|roots|rose|rosser|rot90|rotate|rotate3d|round|rref|rsf2csf|run|save|saveas|saveobj|savepath|scatter|scatter3|schur|sec|secd|sech|selectmoveresize|semilogx|semilogy|sendmail|serial|set|setappdata|setdiff|setenv|setfield|setpixelposition|setpref|setstr|setxor|shading|shg|shiftdim|showplottool|shrinkfaces|sign|sin|sind|sinh|size|slice|smooth3|snapnow|sort|sortrows|sound|soundsc|spalloc|spaugment|spconvert|spdiags|specular|speye|spfun|sph2cart|sphere|spinmap|spline|spones|spparms|sprand|sprandn|sprandsym|sprank|spring|sprintf|spy|sqrt|sqrtm|squeeze|ss2tf|sscanf|stairs|startup|std|stem|stem3|stopasync|str2double|str2func|str2mat|str2num|strcat|strcmp|strcmpi|stream2|stream3|streamline|streamparticles|streamribbon|streamslice|streamtube|strfind|strjust|strmatch|strncmp|strncmpi|strread|strrep|strtok|strtrim|struct2cell|structfun|strvcat|sub2ind|subplot|subsasgn|subsindex|subspace|subsref|substruct|subvolume|sum|summer|superclasses|superiorto|support|surf|surf2patch|surface|surfc|surfl|surfnorm|svd|svds|swapbytes|symamd|symbfact|symmlq|symrcm|symvar|system|tan|tand|tanh|tar|tempdir|tempname|tetramesh|texlabel|text|textread|textscan|textwrap|tfqmr|throw|tic|Tiff(?:\.(?:getTagNames|getVersion))?|timer|timerfind|timerfindall|times|timeseries|title|toc|todatenum|toeplitz|toolboxdir|trace|transpose|trapz|treelayout|treeplot|tril|trimesh|triplequad|triplot|TriRep|TriScatteredInterp|trisurf|triu|tscollection|tsearch|tsearchn|tstool|type|typecast|uibuttongroup|uicontextmenu|uicontrol|uigetdir|uigetfile|uigetpref|uiimport|uimenu|uiopen|uipanel|uipushtool|uiputfile|uiresume|uisave|uisetcolor|uisetfont|uisetpref|uistack|uitable|uitoggletool|uitoolbar|uiwait|uminus|undocheckout|unicode2native|union|unique|unix|unloadlibrary|unmesh|unmkpp|untar|unwrap|unzip|uplus|upper|urlread|urlwrite|usejava|userpath|validateattributes|validatestring|vander|var|vectorize|ver|verctrl|verLessThan|version|vertcat|VideoReader(?:\.isPlatformSupported)?|VideoWriter(?:\.getProfiles)?|view|viewmtx|visdiff|volumebounds|voronoi|voronoin|wait|waitbar|waitfor|waitforbuttonpress|warndlg|warning|waterfall|wavfinfo|wavplay|wavread|wavrecord|wavwrite|web|weekday|what|whatsnew|which|whitebg|who|whos|wilkinson|winopen|winqueryreg|winter|wk1finfo|wk1read|wk1write|workspace|xlabel|xlim|xlsfinfo|xlsread|xlswrite|xmlread|xmlwrite|xor|xslt|ylabel|ylim|zeros|zip|zlabel|zlim|zoom';
			var statsFunctions = 'addedvarplot|andrewsplot|anova1|anova2|anovan|ansaribradley|aoctool|barttest|bbdesign|betacdf|betafit|betainv|betalike|betapdf|betarnd|betastat|binocdf|binofit|binoinv|binopdf|binornd|binostat|biplot|bootci|bootstrp|boxplot|candexch|candgen|canoncorr|capability|capaplot|caseread|casewrite|categorical|ccdesign|cdfplot|chi2cdf|chi2gof|chi2inv|chi2pdf|chi2rnd|chi2stat|cholcov|ClassificationBaggedEnsemble|ClassificationDiscriminant(?:\.(?:fit|make|template))?|ClassificationEnsemble|ClassificationKNN(?:\.(?:fit|template))?|ClassificationPartitionedEnsemble|ClassificationPartitionedModel|ClassificationTree(?:\.(?:fit|template))?|classify|classregtree|cluster|clusterdata|cmdscale|combnk|CompactClassificationDiscriminant|CompactClassificationEnsemble|CompactClassificationTree|CompactRegressionEnsemble|CompactRegressionTree|CompactTreeBagger|confusionmat|controlchart|controlrules|cophenet|copulacdf|copulafit|copulaparam|copulapdf|copularnd|copulastat|cordexch|corr|corrcov|coxphfit|createns|crosstab|crossval|cvpartition|datasample|dataset|daugment|dcovary|dendrogram|dfittool|disttool|dummyvar|dwtest|ecdf|ecdfhist|evcdf|evfit|evinv|evlike|evpdf|evrnd|evstat|ExhaustiveSearcher|expcdf|expfit|expinv|explike|exppdf|exprnd|expstat|factoran|fcdf|ff2n|finv|fitdist|fitensemble|fpdf|fracfact|fracfactgen|friedman|frnd|fstat|fsurfht|fullfact|gagerr|gamcdf|gamfit|gaminv|gamlike|gampdf|gamrnd|gamstat|GeneralizedLinearModel(?:\.fit)?|geocdf|geoinv|geomean|geopdf|geornd|geostat|gevcdf|gevfit|gevinv|gevlike|gevpdf|gevrnd|gevstat|gline|glmfit|glmval|glyphplot|gmdistribution(?:\.fit)?|gname|gpcdf|gpfit|gpinv|gplike|gplotmatrix|gppdf|gprnd|gpstat|grp2idx|grpstats|gscatter|haltonset|harmmean|hist3|histfit|hmmdecode|hmmestimate|hmmgenerate|hmmtrain|hmmviterbi|hougen|hygecdf|hygeinv|hygepdf|hygernd|hygestat|icdf|inconsistent|interactionplot|invpred|iqr|iwishrnd|jackknife|jbtest|johnsrnd|KDTreeSearcher|kmeans|knnsearch|kruskalwallis|ksdensity|kstest|kstest2|kurtosis|lasso|lassoglm|lassoPlot|leverage|lhsdesign|lhsnorm|lillietest|LinearModel(?:\.fit)?|linhyptest|linkage|logncdf|lognfit|logninv|lognlike|lognpdf|lognrnd|lognstat|lsline|mad|mahal|maineffectsplot|manova1|manovacluster|mdscale|mhsample|mle|mlecov|mnpdf|mnrfit|mnrnd|mnrval|moment|multcompare|multivarichart|mvncdf|mvnpdf|mvnrnd|mvregress|mvregresslike|mvtcdf|mvtpdf|mvtrnd|NaiveBayes(?:\.fit)?|nancov|nanmax|nanmean|nanmedian|nanmin|nanstd|nansum|nanvar|nbincdf|nbinfit|nbininv|nbinpdf|nbinrnd|nbinstat|ncfcdf|ncfinv|ncfpdf|ncfrnd|ncfstat|nctcdf|nctinv|nctpdf|nctrnd|nctstat|ncx2cdf|ncx2inv|ncx2pdf|ncx2rnd|ncx2stat|NeighborSearcher|nlinfit|nlintool|nlmefit|nlmefitsa|nlparci|nlpredci|nnmf|nominal|NonLinearModel(?:\.fit)?|normcdf|normfit|norminv|normlike|normpdf|normplot|normrnd|normspec|normstat|ordinal|outlierMeasure|parallelcoords|paretotails|partialcorr|pcacov|pcares|pdf|pdist|pdist2|pearsrnd|perfcurve|perms|piecewisedistribution|plsregress|poisscdf|poissfit|poissinv|poisspdf|poissrnd|poisstat|polyconf|polytool|prctile|princomp|ProbDist|ProbDistKernel|ProbDistParametric|ProbDistUnivKernel|ProbDistUnivParam|probplot|procrustes|qqplot|qrandset|qrandstream|quantile|randg|random|randsample|randtool|range|rangesearch|ranksum|raylcdf|raylfit|raylinv|raylpdf|raylrnd|raylstat|rcoplot|refcurve|refline|regress|RegressionBaggedEnsemble|RegressionEnsemble|RegressionPartitionedEnsemble|RegressionPartitionedModel|RegressionTree(?:\.(?:fit|template))?|regstats|relieff|ridge|robustdemo|robustfit|rotatefactors|rowexch|rsmdemo|rstool|runstest|sampsizepwr|scatterhist|sequentialfs|signrank|signtest|silhouette|skewness|slicesample|sobolset|squareform|statget|statset|stepwise|stepwisefit|surfht|tabulate|tblread|tblwrite|tcdf|tdfread|tiedrank|tinv|tpdf|TreeBagger|treedisp|treefit|treeprune|treetest|treeval|trimmean|trnd|tstat|ttest|ttest2|unidcdf|unidinv|unidpdf|unidrnd|unidstat|unifcdf|unifinv|unifit|unifpdf|unifrnd|unifstat|vartest|vartest2|vartestn|wblcdf|wblfit|wblinv|wbllike|wblpdf|wblplot|wblrnd|wblstat|wishrnd|x2fx|xptread|zscore|ztest';
			var imageFunctions = 'adapthisteq|analyze75info|analyze75read|applycform|applylut|axes2pix|bestblk|blockproc|bwarea|bwareaopen|bwboundaries|bwconncomp|bwconvhull|bwdist|bwdistgeodesic|bweuler|bwhitmiss|bwlabel|bwlabeln|bwmorph|bwpack|bwperim|bwselect|bwtraceboundary|bwulterode|bwunpack|checkerboard|col2im|colfilt|conndef|convmtx2|corner|cornermetric|corr2|cp2tform|cpcorr|cpselect|cpstruct2pairs|dct2|dctmtx|deconvblind|deconvlucy|deconvreg|deconvwnr|decorrstretch|demosaic|dicomanon|dicomdict|dicominfo|dicomlookup|dicomread|dicomuid|dicomwrite|edge|edgetaper|entropy|entropyfilt|fan2para|fanbeam|findbounds|fliptform|freqz2|fsamp2|fspecial|ftrans2|fwind1|fwind2|getheight|getimage|getimagemodel|getline|getneighbors|getnhood|getpts|getrangefromclass|getrect|getsequence|gray2ind|graycomatrix|graycoprops|graydist|grayslice|graythresh|hdrread|hdrwrite|histeq|hough|houghlines|houghpeaks|iccfind|iccread|iccroot|iccwrite|idct2|ifanbeam|im2bw|im2col|im2double|im2int16|im2java2d|im2single|im2uint16|im2uint8|imabsdiff|imadd|imadjust|ImageAdapter|imageinfo|imagemodel|imapplymatrix|imattributes|imbothat|imclearborder|imclose|imcolormaptool|imcomplement|imcontour|imcontrast|imcrop|imdilate|imdisplayrange|imdistline|imdivide|imellipse|imerode|imextendedmax|imextendedmin|imfill|imfilter|imfindcircles|imfreehand|imfuse|imgca|imgcf|imgetfile|imhandles|imhist|imhmax|imhmin|imimposemin|imlincomb|imline|immagbox|immovie|immultiply|imnoise|imopen|imoverview|imoverviewpanel|impixel|impixelinfo|impixelinfoval|impixelregion|impixelregionpanel|implay|impoint|impoly|impositionrect|improfile|imputfile|impyramid|imreconstruct|imrect|imregconfig|imregionalmax|imregionalmin|imregister|imresize|imroi|imrotate|imsave|imscrollpanel|imshow|imshowpair|imsubtract|imtool|imtophat|imtransform|imview|ind2gray|ind2rgb|interfileinfo|interfileread|intlut|ippl|iptaddcallback|iptcheckconn|iptcheckhandle|iptcheckinput|iptcheckmap|iptchecknargin|iptcheckstrs|iptdemos|iptgetapi|iptGetPointerBehavior|iptgetpref|ipticondir|iptnum2ordinal|iptPointerManager|iptprefs|iptremovecallback|iptSetPointerBehavior|iptsetpref|iptwindowalign|iradon|isbw|isflat|isgray|isicc|isind|isnitf|isrgb|isrset|lab2double|lab2uint16|lab2uint8|label2rgb|labelmatrix|makecform|makeConstrainToRectFcn|makehdr|makelut|makeresampler|maketform|mat2gray|mean2|medfilt2|montage|nitfinfo|nitfread|nlfilter|normxcorr2|ntsc2rgb|openrset|ordfilt2|otf2psf|padarray|para2fan|phantom|poly2mask|psf2otf|qtdecomp|qtgetblk|qtsetblk|radon|rangefilt|reflect|regionprops|registration\.metric\.(?:MattesMutualInformation|MeanSquares)|registration\.optimizer\.(?:OnePlusOneEvolutionary|RegularStepGradientDescent)|rgb2gray|rgb2ntsc|rgb2ycbcr|roicolor|roifill|roifilt2|roipoly|rsetwrite|std2|stdfilt|strel|stretchlim|subimage|tformarray|tformfwd|tforminv|tonemap|translate|truesize|uintlut|viscircles|warp|watershed|whitepoint|wiener2|xyz2double|xyz2uint16|ycbcr2rgb';
			var optimFunctions = 'bintprog|color|fgoalattain|fminbnd|fmincon|fminimax|fminsearch|fminunc|fseminf|fsolve|fzero|fzmult|gangstr|ktrlink|linprog|lsqcurvefit|lsqlin|lsqnonlin|lsqnonneg|optimget|optimset|optimtool|quadprog';
			
			// identifiers: variable/function name, or a chain of variable names joined by dots (obj.method, struct.field1.field2, etc..)
			// valid variable names (start with letter, and contains letters, digits, and underscores).
			// we match "xx.yy" as a whole so that if "xx" is plain and "yy" is not, we dont get a false positive for "yy"
			//var reIdent = '(?:[a-zA-Z][a-zA-Z0-9_]*)';
			//var reIdentChain = '(?:' + reIdent + '(?:\.' + reIdent + ')*' + ')';
			
			// patterns that always start with a known character. Must have a shortcut string.
			var shortcutStylePatterns = [
				// whitespaces: space, tab, carriage return, line feed, line tab, form-feed, non-break space
				[PR.PR_PLAIN, /^[ \t\r\n\v\f\xA0]+/, null, " \t\r\n\u000b\u000c\u00a0"],
			
				// block comments
				//TODO: chokes on nested block comments
				//TODO: false positives when the lines with %{ and %} contain non-spaces
				//[PR.PR_COMMENT, /^%(?:[^\{].*|\{(?:%|%*[^\}%])*(?:\}+%?)?)/, null],
				[PR.PR_COMMENT, /^%\{[^%]*%+(?:[^\}%][^%]*%+)*\}/, null],
			
				// single-line comments
				[PR.PR_COMMENT, /^%[^\r\n]*/, null, "%"],
			
				// system commands
				[PR_SYSCMD, /^![^\r\n]*/, null, "!"]
			];
			
			// patterns that will be tried in order if the shortcut ones fail. May have shortcuts.
			var fallthroughStylePatterns = [
				// line continuation
				[PR_LINE_CONTINUATION, /^\.\.\.\s*[\r\n]/, null],
			
				// error message
				[PR_ERROR, /^\?\?\? [^\r\n]*/, null],
			
				// warning message
				[PR_WARNING, /^Warning: [^\r\n]*/, null],
			
				// command prompt/output
				//[PR_CODE_OUTPUT, /^>>\s+[^\r\n]*[\r\n]{1,2}[^=]*=[^\r\n]*[\r\n]{1,2}[^\r\n]*/, null],		// full command output (both loose/compact format): `>> EXP\nVAR =\n VAL`
				[PR_CODE_OUTPUT, /^>>\s+/, null],			// only the command prompt `>> `
				[PR_CODE_OUTPUT, /^octave:\d+>\s+/, null],	// Octave command prompt `octave:1> `
			
				// identifier (chain) or closing-parenthesis/brace/bracket, and IS followed by transpose operator
				// this way we dont misdetect the transpose operator ' as the start of a string
				["lang-matlab-operators", /^((?:[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*|\)|\]|\}|\.)')/, null],
			
				// identifier (chain), and NOT followed by transpose operator
				// this must come AFTER the "is followed by transpose" step (otherwise it chops the last char of identifier)
				["lang-matlab-identifiers", /^([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*)(?!')/, null],
			
				// single-quoted strings: allow for escaping with '', no multilines
				//[PR.PR_STRING, /(?:(?<=(?:\(|\[|\{|\s|=|;|,|:))|^)'(?:[^']|'')*'(?=(?:\)|\]|\}|\s|=|;|,|:|~|<|>|&|-|\+|\*|\.|\^|\|))/, null],	// string vs. transpose (check before/after context using negative/positive lookbehind/lookahead)
				[PR.PR_STRING, /^'(?:[^']|'')*'/, null],	// "'"
			
				// floating point numbers: 1, 1.0, 1i, -1.1E-1
				[PR.PR_LITERAL, /^[+\-]?\.?\d+(?:\.\d*)?(?:[Ee][+\-]?\d+)?[ij]?/, null],
			
				// parentheses, braces, brackets
				[PR.PR_TAG, /^(?:\{|\}|\(|\)|\[|\])/, null],	// "{}()[]"
			
				// other operators
				[PR.PR_PUNCTUATION, /^(?:<|>|=|~|@|&|;|,|:|!|\-|\+|\*|\^|\.|\||\\|\/)/, null],
			];
			
			var identifiersPatterns = [
				// list of keywords (`iskeyword`)
				[PR.PR_KEYWORD, /^\b(?:break|case|catch|classdef|continue|else|elseif|end|for|function|global|if|otherwise|parfor|persistent|return|spmd|switch|try|while)\b/, null],
			
				// some specials variables/constants
				[PR_CONSTANT, /^\b(?:true|false|inf|Inf|nan|NaN|eps|pi|ans|nargin|nargout|varargin|varargout)\b/, null],
			
				// some data types
				[PR.PR_TYPE, /^\b(?:cell|struct|char|double|single|logical|u?int(?:8|16|32|64)|sparse)\b/, null],
			
				// commonly used builtin functions from core MATLAB and a few popular toolboxes
				[PR_FUNCTION, new RegExp('^\\b(?:' + coreFunctions + ')\\b'), null],
				[PR_FUNCTION_TOOLBOX, new RegExp('^\\b(?:' + statsFunctions + ')\\b'), null],
				[PR_FUNCTION_TOOLBOX, new RegExp('^\\b(?:' + imageFunctions + ')\\b'), null],
				[PR_FUNCTION_TOOLBOX, new RegExp('^\\b(?:' + optimFunctions + ')\\b'), null],
			
				// plain identifier (user-defined variable/function name)
				[PR_IDENTIFIER, /^[a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*/, null],
			];
			
			var operatorsPatterns = [
				// forward to identifiers to match
				["lang-matlab-identifiers", /^([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*)/, null],
			
				// parentheses, braces, brackets
				[PR.PR_TAG, /^(?:\{|\}|\(|\)|\[|\])/, null],	// "{}()[]"
			
				// other operators
				[PR.PR_PUNCTUATION, /^(?:<|>|=|~|@|&|;|,|:|!|\-|\+|\*|\^|\.|\||\\|\/)/, null],
			
				// transpose operators
				[PR_TRANSPOSE, /^'/, null],
			];
			
			PR.registerLangHandler(
				PR.createSimpleLexer([], identifiersPatterns),
				["matlab-identifiers"]
			);
			PR.registerLangHandler(
				PR.createSimpleLexer([], operatorsPatterns),
				["matlab-operators"]
			);
			PR.registerLangHandler(
				PR.createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns),
				["matlab"]
			);
		}
	});
})();
