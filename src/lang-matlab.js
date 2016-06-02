/**
 * @file Registers a language handler for MATLAB.
 * @author {{{ pkg.author.name }}}
 * @see {{{ pkg.homepage }}}
 * @version {{{ pkg.version }}}
 * @copyright (c) 2013 by {{{ pkg.author.name }}} ({{{ pkg.author.email }}})
 * @license {{{ pkg.license }}}
 */
(function () {
    {{! HACK: indentation is not respected by mustache renderer }}
    {{# indentLines1 }}{{> src/_main.js }}{{/ indentLines1 }}
})();
