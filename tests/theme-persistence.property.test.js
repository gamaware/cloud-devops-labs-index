/**
 * Property-Based Test: Theme persistence round-trip
 *
 * Feature: portfolio-redesign, Property 2: Theme persistence round-trip
 *
 * **Validates: Requirements 5.2, 5.3**
 *
 * For any theme value ('light' or 'dark'), toggling the theme via
 * ThemeEngine.toggle(), which persists to localStorage, and then calling
 * ThemeEngine.init() (simulating a page reload) SHALL result in the same
 * theme being applied as was set by the toggle.
 */
const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const MAIN_JS = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

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

    // Pre-seed localStorage if provided
    if (localStorageData) {
        for (var key in localStorageData) {
            if (localStorageData.hasOwnProperty(key)) {
                window.localStorage.setItem(key, localStorageData[key]);
            }
        }
    }

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

console.log('\nTheme Persistence Round-Trip Property-Based Tests\n');

// --- Property 2: Single toggle then reload preserves theme ---

test('Property 2: toggling theme and reloading preserves the theme', function () {
    fc.assert(
        fc.property(
            fc.constantFrom('light', 'dark'),
            function (initialTheme) {
                // Create first environment and set initial theme
                var win1 = createEnv();
                win1.ThemeEngine.init();
                win1.ThemeEngine.applyTheme(initialTheme);

                // Toggle the theme — this persists to localStorage
                win1.ThemeEngine.toggle();
                var themeAfterToggle = win1.ThemeEngine.getTheme();

                // Grab localStorage state
                var storedData = {};
                storedData[win1.ThemeEngine._STORAGE_KEY] = win1.localStorage.getItem(win1.ThemeEngine._STORAGE_KEY);

                // Create a fresh environment (simulating page reload) with same localStorage
                var win2 = createEnv(storedData);
                win2.ThemeEngine.init();
                var themeAfterReload = win2.ThemeEngine.getTheme();

                assert.strictEqual(themeAfterReload, themeAfterToggle,
                    'Theme after reload ("' + themeAfterReload + '") should match theme after toggle ("' + themeAfterToggle + '")');
            }
        ),
        { numRuns: 200 }
    );
});

// --- Property 2: Random sequence of toggles then reload preserves final theme ---

test('Property 2: random sequence of toggles then reload preserves final theme', function () {
    fc.assert(
        fc.property(
            fc.integer({ min: 0, max: 20 }),
            function (numToggles) {
                // Create environment and init
                var win1 = createEnv();
                win1.ThemeEngine.init();

                // Perform N toggles
                for (var i = 0; i < numToggles; i++) {
                    win1.ThemeEngine.toggle();
                }

                var themeBeforeReload = win1.ThemeEngine.getTheme();

                // Grab localStorage state
                var storedData = {};
                var storedValue = win1.localStorage.getItem(win1.ThemeEngine._STORAGE_KEY);
                if (storedValue !== null) {
                    storedData[win1.ThemeEngine._STORAGE_KEY] = storedValue;
                }

                // Simulate reload with fresh environment
                var win2 = createEnv(storedData);
                win2.ThemeEngine.init();
                var themeAfterReload = win2.ThemeEngine.getTheme();

                // If at least one toggle happened, localStorage has a value and init restores it
                if (numToggles > 0) {
                    assert.strictEqual(themeAfterReload, themeBeforeReload,
                        'After ' + numToggles + ' toggles, theme after reload ("' + themeAfterReload + '") should match ("' + themeBeforeReload + '")');
                }
                // If zero toggles, no manual override — both should match OS default (light, since matchMedia returns false)
                else {
                    assert.strictEqual(themeAfterReload, themeBeforeReload,
                        'With 0 toggles, theme should be OS default on both loads');
                }
            }
        ),
        { numRuns: 500 }
    );
});

// --- Property 2: Explicit set via toggle from known starting theme ---

test('Property 2: toggle from explicit starting theme persists correctly', function () {
    fc.assert(
        fc.property(
            fc.constantFrom('light', 'dark'),
            fc.integer({ min: 1, max: 15 }),
            function (startTheme, numToggles) {
                // Create environment, init, then force a known starting theme
                var win1 = createEnv();
                win1.ThemeEngine.init();
                win1.ThemeEngine.applyTheme(startTheme);

                // Perform toggles
                for (var i = 0; i < numToggles; i++) {
                    win1.ThemeEngine.toggle();
                }

                var finalTheme = win1.ThemeEngine.getTheme();

                // The expected theme alternates: odd toggles flip, even toggles return
                var expectedTheme = (numToggles % 2 === 0) ? startTheme : (startTheme === 'light' ? 'dark' : 'light');
                assert.strictEqual(finalTheme, expectedTheme,
                    'After ' + numToggles + ' toggles from "' + startTheme + '", expected "' + expectedTheme + '" but got "' + finalTheme + '"');

                // Simulate reload
                var storedData = {};
                storedData[win1.ThemeEngine._STORAGE_KEY] = win1.localStorage.getItem(win1.ThemeEngine._STORAGE_KEY);

                var win2 = createEnv(storedData);
                win2.ThemeEngine.init();
                var themeAfterReload = win2.ThemeEngine.getTheme();

                assert.strictEqual(themeAfterReload, finalTheme,
                    'Theme after reload ("' + themeAfterReload + '") should match final theme ("' + finalTheme + '")');
            }
        ),
        { numRuns: 500 }
    );
});

// --- Summary ---
console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
