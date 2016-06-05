var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var expect = require('chai').expect;

describe('lang-matlab', function () {
    // window containing loaded DOM document (shared across tests)
    var window;
    var base = __dirname;
    var dump = false;

    function path_resolve(fname) {
        // return full local path, e.g file:///C:/path/to/script.js
        return 'file://' +
            encodeURI(path.join(base, fname).replace(/\\/g, '/'));
    }

    function parse(text) {
        // syntax highlight MATLAB source code, and place HTML inside a PRE
        var pre = window.document.createElement('pre');
        pre.className = 'prettyprint lang-matlab prettyprinted';
        pre.innerHTML = window.PR.prettyPrintOne(text, 'matlab', false);
        if (dump) {
            // insert into page
            window.document.body.appendChild(pre);
        }
        return pre;
    }

    before('setup DOM', function (done) {
        // HTML page, JS scripts, and CSS stylesheets to load
        var markup = '<!DOCTYPE html><html><head></head>' +
            '<body></body></html>';
        var scripts = [
            //path_resolve('../demo/js/jquery.min.js'),
            path_resolve('../demo/js/prettify.js'),
            path_resolve('../dist/js/full/lang-matlab.min.js')
        ];
        var styles = [
            path_resolve('../demo/css/prettify.css'),
            path_resolve('../dist/css/matlab.min.css')
        ];

        // parse HTML with injected CSS/JS (async)
        jsdom.env(markup, scripts, function (err, win) {
            if (err) {
                done(err);
            } else {
                // store window object
                window = win;

                // inject external css into page
                styles.forEach(function (cssURL) {
                    var link = window.document.createElement('link');
                    link.rel = 'stylesheet';
                    link.type = 'text/css';
                    link.href = cssURL;
                    window.document.getElementsByTagName('head')[0]
                        .appendChild(link);
                });

                // notify end of asynchronous "before" hook
                done();
            }
        });
    });

    after('teardown DOM', function () {
        if (window) {
            if (dump) {
                // dump page to disk
                fs.writeFileSync(path.join(base, 'dump.html'),
                    jsdom.serializeDocument(window.document));
            }
            window.close();
        }
    });

    it('should be loaded', function () {
        //expect(window.$).to.exist;
        expect(window.PR).to.exist.and.to.be.an('object');
        expect(window.PR).to.respondTo('prettyPrint');
        expect(window.PR).to.respondTo('prettyPrintOne');
    });

    describe('simple constructs', function () {
        it('should highlight comment', function () {
            var pre = parse('% some comment\nplot(x)');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('com');
            expect(spans[0].textContent).to.match(/^%/);
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('com');
            });
        });

        it('should highlight block comment', function () {
            var pre = parse('%{\nsome\ncomments\n%}\nplot(x)');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('com');
            expect(spans[0].textContent).to.match(/^%\{[\s\S]*%\}/);
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('com');
            });
        });

        it('should highlight string', function () {
            var pre = parse("'some ''quoted'' string'");
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(1);
            expect(spans[0].className).to.have.string('str');
            expect(spans[0].textContent).to.match(/^'/)
                .and.to.match(/'$/);
        });

        it('should highlight number literal', function () {
            var pre = parse('-3.14');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(1);
            expect(spans[0].className).to.have.string('lit');
        });

        it('should highlight shell escape', function () {
            var pre = parse('!touch file');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(1);
            expect(spans[0].className).to.have.string('scmd');
            expect(spans[0].textContent).to.match(/^!/);
        });

        it('should highlight line continuation', function () {
            var pre = parse('[...\n1 2]');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(3);
            expect(spans[1].className).to.have.string('lcnt');
            expect(spans[1].textContent).to.match(/^\.\.\./);
            expect(spans[0].className).not.to.have.string('lcnt');
            Array.prototype.slice.call(spans, 2).forEach(function (span) {
                expect(span.className).not.to.have.string('lcnt');
            });
        });

        it('should highlight transpose operator', function () {
            var pre = parse("x'");
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(2);
            expect(spans[1].className).to.have.string('tps');
            expect(spans[1].textContent).to.equal("'");
            expect(spans[0].className).not.to.have.string('tps');
        });

        it('should highlight command prompt', function () {
            var pre = parse('>> disp(1)');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('prmpt');
            expect(spans[0].textContent.trim()).to.equal('>>');
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('prmpt');
            });
        });

        it('should highlight error message', function () {
            var pre = parse('??? Error in some_function');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(1);
            expect(spans[0].className).to.have.string('err');
            expect(spans[0].textContent).to.match(/^\?\?\?/);
        });

        it('should highlight warning message', function () {
            var pre = parse('Warning: some message');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(1);
            expect(spans[0].className).to.have.string('wrn');
            expect(spans[0].textContent).to.match(/^Warning/);
        });

        it('should highlight parentheses', function () {
            var pre = parse('([{}])');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(1);
            expect(spans[0].className).to.have.string('prn');
        });

        it('should highlight punctutation', function () {
            var pre = parse('@sin;');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(3);
            expect(spans[0].className).to.have.string('pun');
            expect(spans[1].className).not.to.have.string('pun');
            expect(spans[2].className).to.have.string('pun');
        });

        it('should highlight keywords', function () {
            var pre = parse('if 0');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('kwd');
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('kwd');
            });
        });

        it('should highlight special variables', function () {
            var pre = parse('varargin');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.lengthOf(1);
            expect(spans[0].className).to.have.string('var');
        });

        it('should highlight user-defined identifiers', function () {
            var pre = parse('prettify_matlab()');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('idnt');
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('idnt');
            });
        });

        it('should highlight core function', function () {
            var pre = parse('plot()');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('fun');
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('fun');
            });
        });

        it('should highlight toolbox function', function () {
            var pre = parse('kmeans()');
            var spans = pre.getElementsByTagName('span');
            expect(spans).to.have.length.of.at.least(2);
            expect(spans[0].className).to.have.string('fun');
            Array.prototype.slice.call(spans, 1).forEach(function (span) {
                expect(span.className).not.to.have.string('fun');
            });
        });
    });
});
