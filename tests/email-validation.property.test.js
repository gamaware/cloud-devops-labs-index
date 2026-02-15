/**
 * Property-Based Test: Email validation correctness
 *
 * Feature: portfolio-redesign, Property 6: Email validation correctness
 *
 * **Validates: Requirements 7.5**
 *
 * For any string, the email validation function SHALL return true only if the
 * string matches a valid email format (contains exactly one @, has a non-empty
 * local part, and has a domain with at least one dot). For any string that is
 * empty, has no @, has multiple @ signs, or has no domain dot, the function
 * SHALL return false.
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

console.log('\nEmail Validation Property-Based Tests\n');

// --- Property 6: Strings without '@' always return false ---

test('Property 6: isValidEmail() returns false for any string without @', function () {
    var win = createEnv();

    // Generate strings that never contain '@'
    var noAtString = fc.string().filter(function (s) { return s.indexOf('@') === -1; });

    fc.assert(
        fc.property(
            noAtString,
            function (input) {
                var result = win.AccessRequestForm.isValidEmail(input);
                assert.strictEqual(result, false,
                    'isValidEmail("' + input.substring(0, 80) + '") returned true but string has no @');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 6: Valid email formats (user@domain.tld) return true ---

test('Property 6: isValidEmail() returns true for valid email formats', function () {
    var win = createEnv();

    fc.assert(
        fc.property(
            fc.emailAddress(),
            function (email) {
                var result = win.AccessRequestForm.isValidEmail(email);
                assert.strictEqual(result, true,
                    'isValidEmail("' + email + '") returned false for a valid email');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 6: isValidEmail() always returns a boolean (never throws) ---

test('Property 6: isValidEmail() always returns a boolean for any string', function () {
    var win = createEnv();

    fc.assert(
        fc.property(
            fc.string(),
            function (input) {
                var result = win.AccessRequestForm.isValidEmail(input);
                assert.strictEqual(typeof result, 'boolean',
                    'isValidEmail("' + input.substring(0, 80) + '") returned ' + typeof result + ' instead of boolean');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 6: Strings with multiple '@' signs return false ---

test('Property 6: isValidEmail() returns false for strings with multiple @ signs', function () {
    var win = createEnv();

    // Generator: strings guaranteed to have at least 2 '@' signs
    var multipleAtGen = fc.tuple(fc.string(), fc.string(), fc.string())
        .map(function (parts) {
            // Ensure local parts don't accidentally contain @ by filtering
            var a = parts[0].replace(/@/g, 'a');
            var b = parts[1].replace(/@/g, 'b');
            var c = parts[2].replace(/@/g, 'c');
            return a + '@' + b + '@' + c;
        });

    fc.assert(
        fc.property(
            multipleAtGen,
            function (input) {
                var result = win.AccessRequestForm.isValidEmail(input);
                assert.strictEqual(result, false,
                    'isValidEmail("' + input.substring(0, 80) + '") returned true but string has multiple @');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 6: Strings with no domain dot return false ---

test('Property 6: isValidEmail() returns false for strings with @ but no domain dot', function () {
    var win = createEnv();

    // Generator: local@domain (no dot in domain part)
    var safeChar = fc.integer({ min: 97, max: 122 }).map(function (n) { return String.fromCharCode(n); });
    var noDotGen = fc.tuple(
        fc.array(safeChar, { minLength: 1, maxLength: 10 }).map(function (a) { return a.join(''); }),
        fc.array(safeChar, { minLength: 1, maxLength: 10 }).map(function (a) { return a.join(''); })
    ).map(function (parts) {
        return parts[0] + '@' + parts[1];
    });

    fc.assert(
        fc.property(
            noDotGen,
            function (input) {
                var result = win.AccessRequestForm.isValidEmail(input);
                assert.strictEqual(result, false,
                    'isValidEmail("' + input.substring(0, 80) + '") returned true but domain has no dot');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 6: Empty string returns false ---

test('Property 6: isValidEmail() returns false for empty string', function () {
    var win = createEnv();
    var result = win.AccessRequestForm.isValidEmail('');
    assert.strictEqual(result, false, 'isValidEmail("") should return false');
});

// --- Property 6: Non-string inputs return false ---

test('Property 6: isValidEmail() returns false for non-string inputs', function () {
    var win = createEnv();

    fc.assert(
        fc.property(
            fc.oneof(
                fc.integer(),
                fc.constant(null),
                fc.constant(undefined),
                fc.boolean(),
                fc.constant([]),
                fc.constant({})
            ),
            function (input) {
                var result = win.AccessRequestForm.isValidEmail(input);
                assert.strictEqual(result, false,
                    'isValidEmail(' + JSON.stringify(input) + ') should return false for non-string');
            }
        ),
        { numRuns: 100 }
    );
});

// --- Summary ---
console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
