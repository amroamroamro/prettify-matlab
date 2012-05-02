MATLAB syntax highlighting for google code prettify
===================================================

This gives you MATLAB syntax highlighting. Intended to be used on Stack
Overflow and other SE sites.

USAGE
-----

 - run `rake SO:build`. This will create the output javascript files in `js`
   from templates sources in `src`.

 - For the Greasemonkey userscript, install the `prettify-matlab.user.js`.
   This shall apply the MATLAB syntax highlighting on Stack Overflow for
   questions with the `matlab` tag.

 - To use the Prettify extension on your own page, include [prettify.js][1]
   and `lang-matlab.js` in your HTML page, then put your source code
   inside an HTML tag like:

        <pre class="prettyprint lang-matlab">
            <code>
            	% example code
            	x = [1,2,3];
            	sum(x.^2)
            </code>
        </pre>

   You can use the coloring that comes by default, or customize the styles
   with your own. A CSS file `lang-matlab.css` is provided that match the
   color themes of the MATLAB IDE.


[1]: http://code.google.com/p/google-code-prettify/


LICENSE
-------

Copyright (c) 2012 by Amro <amroamroamro@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
