/**
 * Property-Based Test: Locale persistence round-trip
 *
 * Feature: portfolio-redesign, Property 3: Locale persistence round-trip
 *
 * **Validates: Requirements 6.4, 6.5**
 *
 * For any supported locale ('en', 'es', 'pt'), calling
 * LocaleEngine.setLocale(locale) which stores to localStorage,
 * and then calling LocaleEngine.init() (simulating a new page load)
 * SHALL result in the same locale being active.
 */
const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const MAIN_JS = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

/**
 * Minimal PAGE_TRANSLATIONS object required by LocaleEngine.
 * Contains at least one key per supported locale so translate() works.
 */
const MINIMAL_TRANSLATIONS = {
    en: { 'test.greeting': 'Hello' },
    es: { 'test.greeting': 'Hola' },
    pt: { 'test.greeting': 'Olá' }
};

/**
 * Create a fresh jsdom environment with optional pre-seeded localStorage,
 * load main.js, and return the window object.
 */
function createEnv(localStorageData) {
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });
    const { window } = dom;

    // Mock matchMedia (required by ThemeEngine which loads alongside LocaleEngine)
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

    // Pre-seed localStorage if provided
    if (localStorageData) {
        for (var key in localStorageData) {
            if (localStorageData.hasOwnProperty(key)) {
                window.localStorage.setItem(key, localStorageData[key]);
            }
        }
    }

    // Load main.js into the environment
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

console.log('\nLocale Persistence Round-Trip Property-Based Tests\n');

// --- Property 3: Set locale then reload preserves locale ---

test('Property 3: setting a locale and reloading preserves the locale', function () {
    fc.assert(
        fc.property(
            fc.constantFrom('en', 'es', 'pt'),
            function (locale) {
                // Create first environment and initialize LocaleEngine
                var win1 = createEnv();
                win1.PAGE_TRANSLATIONS = MINIMAL_TRANSLATIONS;
                win1.LocaleEngine.init(MINIMAL_TRANSLATIONS);

                // Set the locale — this persists to localStorage
                win1.LocaleEngine.setLocale(locale);
                var localeBeforeReload = win1.LocaleEngine.getLocale();

                // Grab localStorage state
                var storedData = {};
                var storedValue = win1.localStorage.getItem(win1.LocaleEngine._STORAGE_KEY);
                if (storedValue !== null) {
                    storedData[win1.LocaleEngine._STORAGE_KEY] = storedValue;
                }

                // Create a fresh environment (simulating page reload) with same localStorage
                var win2 = createEnv(storedData);
                win2.PAGE_TRANSLATIONS = MINIMAL_TRANSLATIONS;
                win2.LocaleEngine.init(MINIMAL_TRANSLATIONS);
                var localeAfterReload = win2.LocaleEngine.getLocale();

                assert.strictEqual(localeAfterReload, localeBeforeReload,
                    'Locale after reload ("' + localeAfterReload + '") should match locale before reload ("' + localeBeforeReload + '")');
                assert.strictEqual(localeAfterReload, locale,
                    'Locale after reload ("' + localeAfterReload + '") should match the set locale ("' + locale + '")');
            }
        ),
        { numRuns: 200 }
    );
});

// --- Property 3: Random sequence of locale changes then reload preserves final locale ---

test('Property 3: random sequence of locale changes then reload preserves final locale', function () {
    fc.assert(
        fc.property(
            fc.array(fc.constantFrom('en', 'es', 'pt'), { minLength: 1, maxLength: 20 }),
            function (localeSequence) {
                // Create environment and init
                var win1 = createEnv();
                win1.PAGE_TRANSLATIONS = MINIMAL_TRANSLATIONS;
                win1.LocaleEngine.init(MINIMAL_TRANSLATIONS);

                // Apply each locale in sequence
                for (var i = 0; i < localeSequence.length; i++) {
                    win1.LocaleEngine.setLocale(localeSequence[i]);
                }

                var finalLocale = win1.LocaleEngine.getLocale();
                var expectedLocale = localeSequence[localeSequence.length - 1];

                assert.strictEqual(finalLocale, expectedLocale,
                    'Final locale ("' + finalLocale + '") should match last set locale ("' + expectedLocale + '")');

                // Grab localStorage state
                var storedData = {};
                var storedValue = win1.localStorage.getItem(win1.LocaleEngine._STORAGE_KEY);
                if (storedValue !== null) {
                    storedData[win1.LocaleEngine._STORAGE_KEY] = storedValue;
                }

                // Simulate reload with fresh environment
                var win2 = createEnv(storedData);
                win2.PAGE_TRANSLATIONS = MINIMAL_TRANSLATIONS;
                win2.LocaleEngine.init(MINIMAL_TRANSLATIONS);
                var localeAfterReload = win2.LocaleEngine.getLocale();

                assert.strictEqual(localeAfterReload, finalLocale,
                    'Locale after reload ("' + localeAfterReload + '") should match final locale ("' + finalLocale + '")');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 3: Set locale from explicit starting locale persists correctly ---

test('Property 3: set locale from explicit starting locale persists correctly', function () {
    fc.assert(
        fc.property(
            fc.constantFrom('en', 'es', 'pt'),
            fc.constantFrom('en', 'es', 'pt'),
            function (startLocale, targetLocale) {
                // Create environment, init, then set a known starting locale
                var win1 = createEnv();
                win1.PAGE_TRANSLATIONS = MINIMAL_TRANSLATIONS;
                win1.LocaleEngine.init(MINIMAL_TRANSLATIONS);
                win1.LocaleEngine.setLocale(startLocale);

                // Now change to the target locale
                win1.LocaleEngine.setLocale(targetLocale);
                var localeBeforeReload = win1.LocaleEngine.getLocale();

                assert.strictEqual(localeBeforeReload, targetLocale,
                    'Locale after setLocale ("' + localeBeforeReload + '") should be "' + targetLocale + '"');

                // Simulate reload
                var storedData = {};
                storedData[win1.LocaleEngine._STORAGE_KEY] = win1.localStorage.getItem(win1.LocaleEngine._STORAGE_KEY);

                var win2 = createEnv(storedData);
                win2.PAGE_TRANSLATIONS = MINIMAL_TRANSLATIONS;
                win2.LocaleEngine.init(MINIMAL_TRANSLATIONS);
                var localeAfterReload = win2.LocaleEngine.getLocale();

                assert.strictEqual(localeAfterReload, targetLocale,
                    'Locale after reload ("' + localeAfterReload + '") should match target locale ("' + targetLocale + '")');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Summary ---
console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
