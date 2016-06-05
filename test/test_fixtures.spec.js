var fs = require('fs');
var path = require('path');
var jsdom = require('jsdom');
var expect = require('chai').expect;
var fixture = require('./fixtures/fixture.js');

describe('lang-matlab', function () {
    // window containing loaded DOM document (shared across tests)
    var window;
    var base = path.join(__dirname, 'fixtures');

    function path_resolve(fname) {
        // return full local path, e.g file:///C:/path/to/script.js
        return 'file://' +
            encodeURI(path.join(base, fname).replace(/\\/g, '/'));
    }

    function parse(text) {
        // syntax highlight MATLAB source code, and place HTML inside a PRE
        var pre = window.document.createElement('pre');
        pre.innerHTML = window.PR.prettyPrintOne(text, 'matlab', false);

        // return as an array of tokens
        var spans = pre.getElementsByTagName('span');
        return Array.prototype.map.call(spans, function (span) {
            return {
                // drop fallback classes (keep only the first one)
                klass: span.className.split(' ')[0],
                // trim whitespaces
                text: (/^(pln|lcnt)/.test(span.className) ?
                    span.innerHTML.trim() : span.innerHTML)
            };
        });
    }

    before('setup DOM', function (done) {
        // HTML page to load
        var markup = fs.readFileSync(
            path.join(base, 'fixture.html'), 'utf-8');
        var document = jsdom.jsdom(markup, {
            // allow fetching of JS and CSS, execution of JS
            features: {
                FetchExternalResources: ['script', 'link'],
                ProcessExternalResources: ['script']
            },
            // custom resource loader to fix relative paths of JS/CSS files
            resourceLoader: function (resource, callback) {
                resource.url.pathname = path_resolve(resource.url.pathname);
                return resource.defaultFetch(callback);
            }
        });

        // store window object
        window = document.defaultView;

        // wait for all resources to load (async)
        window.addEventListener('load', function () {
            // notify end of asynchronous "before" hook
            done();
        }, false);
    });

    after('teardown DOM', function () {
        if (window) {
            window.close();
        }
    });

    it('should be loaded', function () {
        expect(window.PR).to.exist.and.to.be.an('object');
        expect(window.PR).to.respondTo('prettyPrint');
        expect(window.PR).to.respondTo('prettyPrintOne');
    });

    /*
    it.skip('should debug dump', function () {
        var str = 'x = linspace(0,2*pi);\n' +
            'plot(x,sin(x));\n';
        var tokens = parse(str);
        console.log(tokens);
        console.log(JSON.stringify(tokens));
        tokens.forEach(function (token) {
            console.log(token.text + ' --> ' + token.klass);
        });
    });
    */

    describe('fixtures', function () {
        fixture.forEach(function (test) {
            it('should highlight ' + test.name, function () {
                // prettify and parse as list of tokens
                var tokens = parse(test.source);

                // compare actual against expected
                expect(tokens).to.deep.equal(test.tokens);
            });
        });
    });
});
