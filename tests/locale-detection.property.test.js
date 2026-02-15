/**
 * Property-Based Test: Locale detection always returns a supported language
 *
 * Feature: portfolio-redesign, Property 1: Locale detection always returns a supported language
 *
 * **Validates: Requirements 6.1, 6.2**
 *
 * For any string value of navigator.language, detectLocale() SHALL return
 * one of 'en', 'es', or 'pt'. Strings starting with 'es' map to 'es',
 * strings starting with 'pt' map to 'pt', and all other strings
 * (including empty, undefined, or exotic locale codes) map to 'en'.
 */
const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const MAIN_JS = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
const SUPPORTED_LOCALES = ['en', 'es', 'pt'];

/**
 * Create a minimal jsdom environment and load main.js to get LocaleEngine.
 */
function createEnv() {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });
    const { window } = dom;

    // Mock matchMedia (required by ThemeEngine.init on DOMContentLoaded)
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
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failed++;
        console.log(`  ✗ ${name}`);
        console.log(`    ${err.message}`);
    }
}

console.log('\nLocale Detection Property-Based Tests\n');

// Get a reference to detectLocale from a jsdom environment
const window = createEnv();
const detectLocale = window.LocaleEngine.detectLocale;

// --- Property 1: For any arbitrary string, detectLocale returns a supported locale ---

test('Property 1: detectLocale always returns en, es, or pt for arbitrary strings', function () {
    fc.assert(
        fc.property(fc.string(), function (input) {
            const result = detectLocale(input);
            assert.ok(
                SUPPORTED_LOCALES.includes(result),
                `detectLocale("${input}") returned "${result}", expected one of ${SUPPORTED_LOCALES}`
            );
        }),
        { numRuns: 1000 }
    );
});

// --- Property 1 with strings containing special characters ---

test('Property 1: detectLocale always returns supported locale for strings with special chars', function () {
    fc.assert(
        fc.property(
            fc.array(
                fc.constantFrom(
                    'a', 'z', 'E', 'S', 'P', 'T', '0', '9',
                    ' ', '-', '_', '.', '@', '#', '!', '?',
                    'é', 'ñ', 'ü', 'ç', 'ø', 'å',
                    '中', '日', '한', '🌍', '💻',
                    '\0', '\t', '\n', '\r', ''
                ),
                { minLength: 0, maxLength: 20 }
            ).map(function (arr) { return arr.join(''); }),
            function (input) {
                const result = detectLocale(input);
                assert.ok(
                    SUPPORTED_LOCALES.includes(result),
                    `detectLocale(special) returned "${result}", expected one of ${SUPPORTED_LOCALES}`
                );
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 1 with strings built from wide char range (high codepoints) ---

test('Property 1: detectLocale always returns supported locale for high-codepoint strings', function () {
    fc.assert(
        fc.property(
            fc.array(fc.integer({ min: 0, max: 0xFFFF }), { minLength: 0, maxLength: 20 })
                .map(function (codes) { return String.fromCharCode.apply(null, codes); }),
            function (input) {
                const result = detectLocale(input);
                assert.ok(
                    SUPPORTED_LOCALES.includes(result),
                    `detectLocale(highCodepoint) returned "${result}", expected one of ${SUPPORTED_LOCALES}`
                );
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 1 with non-string inputs (undefined, null, numbers, objects) ---

test('Property 1: detectLocale always returns supported locale for non-string inputs', function () {
    fc.assert(
        fc.property(
            fc.oneof(
                fc.constant(undefined),
                fc.constant(null),
                fc.integer(),
                fc.double(),
                fc.boolean(),
                fc.constant({}),
                fc.constant([]),
                fc.constant(0),
                fc.constant(NaN)
            ),
            function (input) {
                const result = detectLocale(input);
                assert.ok(
                    SUPPORTED_LOCALES.includes(result),
                    `detectLocale(${JSON.stringify(input)}) returned "${result}", expected one of ${SUPPORTED_LOCALES}`
                );
            }
        ),
        { numRuns: 200 }
    );
});

// --- Property 1 with BCP-47 style locale tags ---

test('Property 1: detectLocale always returns supported locale for BCP-47 style tags', function () {
    const langCodes = ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh', 'ko', 'ar', 'ru', 'hi', 'it', 'nl'];
    const regions = ['', '-US', '-MX', '-BR', '-PT', '-419', '-ES', '-GB', '-CA', '-AU'];

    fc.assert(
        fc.property(
            fc.constantFrom(...langCodes),
            fc.constantFrom(...regions),
            function (lang, region) {
                const input = lang + region;
                const result = detectLocale(input);
                assert.ok(
                    SUPPORTED_LOCALES.includes(result),
                    `detectLocale("${input}") returned "${result}", expected one of ${SUPPORTED_LOCALES}`
                );
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 1 correctness: strings starting with 'es' map to 'es' ---

test('Property 1 correctness: strings starting with "es" always map to "es"', function () {
    fc.assert(
        fc.property(fc.string(), function (suffix) {
            const input = 'es' + suffix;
            const result = detectLocale(input);
            assert.strictEqual(result, 'es',
                `detectLocale("${input}") returned "${result}", expected "es"`
            );
        }),
        { numRuns: 500 }
    );
});

// --- Property 1 correctness: strings starting with 'pt' map to 'pt' ---

test('Property 1 correctness: strings starting with "pt" always map to "pt"', function () {
    fc.assert(
        fc.property(fc.string(), function (suffix) {
            const input = 'pt' + suffix;
            const result = detectLocale(input);
            assert.strictEqual(result, 'pt',
                `detectLocale("${input}") returned "${result}", expected "pt"`
            );
        }),
        { numRuns: 500 }
    );
});

// --- Property 1 correctness: strings NOT starting with 'es' or 'pt' map to 'en' ---

test('Property 1 correctness: strings not starting with "es" or "pt" map to "en"', function () {
    fc.assert(
        fc.property(
            fc.string().filter(function (s) {
                var lower = s.toLowerCase();
                return lower.indexOf('es') !== 0 && lower.indexOf('pt') !== 0;
            }),
            function (input) {
                const result = detectLocale(input);
                assert.strictEqual(result, 'en',
                    `detectLocale("${input}") returned "${result}", expected "en"`
                );
            }
        ),
        { numRuns: 500 }
    );
});

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
