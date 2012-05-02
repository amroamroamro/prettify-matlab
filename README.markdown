MATLAB syntax highlighting for google code prettify
===================================================

This gives you MATLAB syntax highlighting. Intended to be used on Stack
Overflow and other SE sites.

USAGE
-----

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

