# MATLAB syntax highlighting for Google Code Prettify

[![Build Status](https://travis-ci.org/amroamroamro/prettify-matlab.svg?branch=master)](https://travis-ci.org/amroamroamro/prettify-matlab)
[![Build Status](https://ci.appveyor.com/api/projects/status/8bur8fe9t84ahnyr/branch/master?svg=true)](https://ci.appveyor.com/project/amroamroamro/prettify-matlab/branch/master)
[![devDependency Status](https://david-dm.org/amroamroamro/prettify-matlab/dev-status.svg)](https://david-dm.org/amroamroamro/prettify-matlab#info=devDependencies)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> An implementation of MATLAB syntax highlighting for [google-code-prettify][1].

The following constructs are recognized:

- single line and block comments (`% comment` and `%{`,`%}`)
- quoted string (`'hello world'`)
- number literals (`1`, `-2.5`, `1i`, `2.9E-5`, etc...)
- shell escape (`!touch filename`)
- line continuation (`...`)
- transpose operator (`x'` and `x.'`)
- command prompt (`>> now`)
- error/warning messages (`??? Error in ...` and `Warning: ...`)
- parentheses, brackets, braces (`()`, `[]`, `{}`)
- other operators (`<>=~@&;,:!-+*^.|\/`)
- MATLAB language keywords (`if`, `else`, `end`, etc...)
- some special variables and constants (`inf`, `nan`, `varargin`, etc..)
- user-defined indentifiers (function and variable names not matched in
  previous steps)

The "full" version also adds highlighting for MATLAB functions:

- over 1300 builtin functions from core [MATLAB][2] (`cos`, `plot`, etc...)
- additional functions from popular toolboxes ([Statistics][3], [IPT][4],
  and [Optimization][5])

*(Since this increases the resulting script size, a separate "lite" version is
also available which excludes function names detection)*.

The project was inspired by the similar [Mathematica.SE][6] syntax
highlighter.


## Build

Requirements: [Node.js][18] and the [NPM][19] package manager.

To rebuild the project, run the following in the command line:

``` sh
$ cd prettify-matlab
$ npm install
$ npm run build
```

First this will install build dependencies, then generate the output
javascript and stylesheet files in the [`dist`](dist/) directory using the
source templates from the [`src`](src/) directory.

    dist/
    |
    |-- js/
    |    |-- full/
    |    |    |-- lang-matlab.js      # code-prettify extension (full version)
    |    |    |-- lang-matlab.js.min  # and minimized version
    |    |
    |    |-- lite/
    |         |-- lang-matlab.js      # code-prettify extension (lite version)
    |         |-- lang-matlab.js.min  # and minimized version
    |
    |-- css/
    |    |-- matlab.css               # optional skin for code-prettify
    |    |-- matlab.css.min           # and minimized version
    |
    |-- userscripts/
         |-- prettify-matlab.user.js                  # userscripts for
         |-- switch-lang.user.js                      #  Stack Overflow
         |-- prettify-mathworks-answers.user.js       # userscripts for
         |-- prettify-mathworks-fileexchange.user.js  #  various MathWorks
         |-- prettify-mathworks-examples.user.js      #  websites


## Usage (google-code-prettify extension)

| Version | Source                                                 |
| ------- |------------------------------------------------------- |
| Full    | [![Source][SourceButton]](dist/js/full/lang-matlab.js) |
| Lite    | [![Source][SourceButton]](dist/js/lite/lang-matlab.js) |

To apply the MALTAB syntax highlighting on code snippets in your own web
pages, first include the prettify scripts and stylesheets in your document (as
explained in the [code-prettify][1] project documentation). Next include the
[MATLAB language extension](dist/js/full/lang-matlab.js), and place your
source code inside a preformatted HTML tag as follows:

``` html
<html>
<head>
<title>MATLAB</title>
<link rel="stylesheet" type="text/css" href="prettify.css" />
<script src="prettify.js"></script>
<script src="lang-matlab.js"></script>
</head>

<body onload="prettyPrint();">
<pre class="prettyprint lang-matlab">
% example code
x = [1, 2, 3]';
fprintf('sum(x^2) = %f\n', sum(x.^2));
</pre>
</body>
</html>
```

When `PR.prettyPrint()` is called, marked sections will be pretty-printed, and
the default styles will be applied. You can customize them with your own, or
use the provided [stylesheet](dist/css/matlab.css) which has a color scheme
inspired by that of the MATLAB IDE (with some modifications).

See the [demo][8] page for a demonstration.

**UPDATE**: The MATLAB extension is now integrated upstream in
[google/code-prettify][9]. So you can use the [auto-loader][10] to directly
load both code-prettify along with the MATLAB extension via one URL:

``` html
<script src="https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?lang=matlab"></script>
```


## Userscripts

For instructions on installing userscripts for various browsers, see
[this page][11]. Also check out the wiki for [sample screenshots][12].

### Stack Overflow

Apply MATLAB syntax highlighting on [Stack Overflow][13] and other
Stack Exchange sites. The script is only activated on questions tagged as
[`matlab`][14].

[![Source][SourceButton]](dist/userscripts/prettify-matlab.user.js)
[![Install][InstallButton]](https://rawgit.com/amroamroamro/prettify-matlab/master/dist/userscripts/prettify-matlab.user.js)

In addition, a separate userscript is included to allow switching the language
used by the prettifier. It adds a small button to the top-right corner of each
code block, with an attached drop-down menu to allow language selection.

[![Source][SourceButton]](dist/userscripts/switch-lang.user.js)
[![Install][InstallButton]](https://rawgit.com/amroamroamro/prettify-matlab/master/dist/userscripts/switch-lang.user.js)

**UPDATE**: Stack Overflow recently integrated MATLAB syntax support, so you
should get proper syntax highlighting by default. This userscript is still
useful if you want to get full highlighting for function names as well as the
customized stylesheet which applies colors resembling the MATLAB editor.

### MathWorks MATLAB Answers

Apply MATLAB syntax highlighting on [MATLAB Answers][15].

[![Source][SourceButton]](dist/userscripts/prettify-mathworks-answers.user.js)
[![Install][InstallButton]](https://rawgit.com/amroamroamro/prettify-matlab/master/dist/userscripts/prettify-mathworks-answers.user.js)

### MathWorks File Exchange

Apply MATLAB syntax highlighting on [File Exchange][16].

[![Source][SourceButton]](dist/userscripts/prettify-mathworks-fileexchange.user.js)
[![Install][InstallButton]](https://rawgit.com/amroamroamro/prettify-matlab/master/dist/userscripts/prettify-mathworks-fileexchange.user.js)

### MathWorks MATLAB Examples

Apply MATLAB syntax highlighting on [MATLAB Examples][17].

[![Source][SourceButton]](dist/userscripts/prettify-mathworks-examples.user.js)
[![Install][InstallButton]](https://rawgit.com/amroamroamro/prettify-matlab/master/dist/userscripts/prettify-mathworks-examples.user.js)


## License

Project released under the [MIT License](LICENSE).


[1]: https://github.com/google/code-prettify
[2]: http://www.mathworks.com/products/matlab/
[3]: http://www.mathworks.com/products/statistics/
[4]: http://www.mathworks.com/products/image/
[5]: http://www.mathworks.com/products/optimization/
[6]: https://github.com/halirutan/Mathematica-Source-Highlighting
[8]: http://rawgit.com/amroamroamro/prettify-matlab/master/demo/index.html
[9]: https://github.com/google/code-prettify/blob/master/src/lang-matlab.js
[10]: https://github.com/google/code-prettify/blob/master/docs/getting_started.md#auto-loader
[11]: http://stackapps.com/tags/script/info
[12]: https://github.com/amroamroamro/prettify-matlab/wiki/Screenshots
[13]: http://stackoverflow.com/
[14]: http://stackoverflow.com/questions/tagged/matlab
[15]: http://www.mathworks.com/matlabcentral/answers/
[16]: http://www.mathworks.com/matlabcentral/fileexchange/
[17]: http://www.mathworks.com/examples/
[18]: http://nodejs.org/
[19]: https://www.npmjs.com/
[SourceButton]: https://cdn.rawgit.com/jerone/UserScripts/master/_resources/Source-button.png
[InstallButton]: https://cdn.rawgit.com/jerone/UserScripts/master/_resources/Install-button.png
