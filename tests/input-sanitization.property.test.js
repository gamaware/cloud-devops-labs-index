/**
 * Property-Based Test: Input sanitization strips all HTML
 *
 * Feature: portfolio-redesign, Property 5: Input sanitization strips all HTML
 *
 * **Validates: Requirements 7.3**
 *
 * For any string input (including strings containing <script>, <img onerror>,
 * HTML tags, and special characters), the sanitizeInput() function SHALL return
 * a string that contains no HTML tags. Formally: sanitizeInput(input) should
 * never match the regex /<[^>]*>/.
 */
const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const MAIN_JS = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

/**
 * Create a fresh jsdom environment, load main.js, and return the window object.
 */
function createEnv() {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });
    const { window } = dom;

    // Mock matchMedia (required by ThemeEngine)
    window.matchMedia = function (query) {
        return {
            matches: false,
            media: query,
            addEventListener: function () {},
            removeEventListener: function () {},
            addListener: function () {},
            removeListener: function () {}
        };
    };

    window.eval(MAIN_JS);
    return window;
}

const HTML_TAG_REGEX = /<[^>]*>/;

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log('  \u2713 ' + name);
    } catch (err) {
        failed++;
        console.log('  \u2717 ' + name);
        console.log('    ' + err.message);
    }
}

console.log('\nInput Sanitization Property-Based Tests\n');

// --- Property 5: Arbitrary strings produce no HTML tags after sanitization ---

test('Property 5: sanitizeInput() output contains no HTML tags for arbitrary strings', function () {
    var win = createEnv();
    fc.assert(
        fc.property(
            fc.string(),
            function (input) {
                var result = win.AccessRequestForm.sanitizeInput(input);
                assert.strictEqual(HTML_TAG_REGEX.test(result), false,
                    'sanitizeInput("' + input.substring(0, 80) + '...") produced output with HTML tags: "' + result.substring(0, 80) + '"');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 5: Strings with injected HTML tags are fully stripped ---

test('Property 5: sanitizeInput() strips injected HTML tags from random content', function () {
    var win = createEnv();

    // Generator: random string with HTML tags injected at random positions
    var htmlTags = [
        '<script>alert("xss")</script>',
        '<img onerror="alert(1)" src="x">',
        '<div>',
        '</div>',
        '<a href="http://evil.com">click</a>',
        '<iframe src="evil.html"></iframe>',
        '<style>body{display:none}</style>',
        '<svg onload="alert(1)">',
        '<input type="hidden" value="hack">',
        '<br>',
        '<br/>',
        '<p class="test">',
        '</p>',
        '<span>',
        '</span>'
    ];

    var stringWithHtmlTags = fc.tuple(fc.string(), fc.constantFrom.apply(fc, htmlTags), fc.string())
        .map(function (parts) { return parts[0] + parts[1] + parts[2]; });

    fc.assert(
        fc.property(
            stringWithHtmlTags,
            function (input) {
                var result = win.AccessRequestForm.sanitizeInput(input);
                assert.strictEqual(HTML_TAG_REGEX.test(result), false,
                    'sanitizeInput() left HTML tags in output for input containing injected tags');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 5: Nested and malformed tags are stripped ---

test('Property 5: sanitizeInput() strips nested and malformed HTML tags', function () {
    var win = createEnv();

    var nestedTagGen = fc.tuple(fc.string(), fc.string(), fc.string())
        .map(function (parts) {
            return parts[0] + '<div><span>' + parts[1] + '</span></div>' + parts[2];
        });

    var malformedTagGen = fc.tuple(fc.string(), fc.string())
        .map(function (parts) {
            return parts[0] + '<div class="unclosed' + parts[1];
        });

    fc.assert(
        fc.property(
            fc.oneof(nestedTagGen, malformedTagGen),
            function (input) {
                var result = win.AccessRequestForm.sanitizeInput(input);
                assert.strictEqual(HTML_TAG_REGEX.test(result), false,
                    'sanitizeInput() left tags in output for nested/malformed input');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 5: Sanitization is idempotent ---

test('Property 5: sanitizeInput() is idempotent (sanitizing twice gives same result)', function () {
    var win = createEnv();
    fc.assert(
        fc.property(
            fc.string(),
            function (input) {
                var once = win.AccessRequestForm.sanitizeInput(input);
                var twice = win.AccessRequestForm.sanitizeInput(once);
                assert.strictEqual(once, twice,
                    'sanitizeInput is not idempotent: first pass="' + once.substring(0, 60) + '", second pass="' + twice.substring(0, 60) + '"');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Summary ---
console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
