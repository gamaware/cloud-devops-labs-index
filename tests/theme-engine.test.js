/**
 * ThemeEngine unit tests
 *
 * Uses jsdom for DOM simulation and fast-check for property-based tests.
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
const { JSDOM } = require('jsdom');
const assert = require('assert');

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

/**
 * Create a fresh jsdom environment and load main.js into it.
 * Returns the window object with ThemeEngine available.
 */
function createEnv(options = {}) {
    const {
        storedTheme = null,
        prefersDark = false,
        localStorageAvailable = true
    } = options;

    const html = '<!DOCTYPE html><html><head></head><body></body></html>';
    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });

    const { window } = dom;

    // Mock matchMedia
    const listeners = [];
    window.matchMedia = function (query) {
        return {
            matches: prefersDark,
            media: query,
            addEventListener: function (event, handler) {
                listeners.push(handler);
            },
            removeEventListener: function () {},
            addListener: function (handler) {
                listeners.push(handler);
            },
            removeListener: function () {}
        };
    };

    // Mock localStorage
    if (localStorageAvailable) {
        const store = {};
        if (storedTheme) store['theme'] = storedTheme;

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: function (key) { return store[key] || null; },
                setItem: function (key, val) { store[key] = String(val); },
                removeItem: function (key) { delete store[key]; },
                _store: store
            },
            writable: true
        });
    } else {
        Object.defineProperty(window, 'localStorage', {
            get: function () { throw new Error('localStorage unavailable'); }
        });
    }

    // Load main.js
    const fs = require('fs');
    const mainJs = fs.readFileSync(require('path').join(__dirname, '..', 'main.js'), 'utf8');
    window.eval(mainJs);

    return { window, dom, listeners };
}

console.log('\nThemeEngine Unit Tests\n');

// --- Requirement 5.1: Detect OS preference on first visit ---

test('Req 5.1 — applies dark theme when OS prefers dark and no stored theme', function () {
    const { window } = createEnv({ prefersDark: true });
    window.ThemeEngine.init();
    assert.strictEqual(window.document.documentElement.getAttribute('data-theme'), 'dark');
});

test('Req 5.1 — applies light theme when OS prefers light and no stored theme', function () {
    const { window } = createEnv({ prefersDark: false });
    window.ThemeEngine.init();
    assert.strictEqual(window.document.documentElement.getAttribute('data-theme'), 'light');
});

// --- Requirement 5.2: Manual toggle persists to localStorage ---

test('Req 5.2 — toggle switches from light to dark and persists', function () {
    const { window } = createEnv({ prefersDark: false });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');

    window.ThemeEngine.toggle();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
    assert.strictEqual(window.localStorage.getItem('theme'), 'dark');
});

test('Req 5.2 — toggle switches from dark to light and persists', function () {
    const { window } = createEnv({ prefersDark: true });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');

    window.ThemeEngine.toggle();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');
    assert.strictEqual(window.localStorage.getItem('theme'), 'light');
});

// --- Requirement 5.3: Return visitor gets stored preference ---

test('Req 5.3 — applies stored dark theme regardless of OS preference', function () {
    const { window } = createEnv({ storedTheme: 'dark', prefersDark: false });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
});

test('Req 5.3 — applies stored light theme regardless of OS preference', function () {
    const { window } = createEnv({ storedTheme: 'light', prefersDark: true });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');
});

// --- Requirement 5.4: OS change updates theme if no manual override ---

test('Req 5.4 — OS change updates theme when no manual override', function () {
    const { window, listeners } = createEnv({ prefersDark: false });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');

    // Simulate OS switching to dark
    listeners.forEach(function (fn) { fn({ matches: true }); });
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
});

test('Req 5.4 — OS change does NOT update theme when manual override exists', function () {
    const { window, listeners } = createEnv({ prefersDark: false });
    window.ThemeEngine.init();
    window.ThemeEngine.toggle(); // manual override to dark
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');

    // Simulate OS switching to dark — should stay dark (manual override)
    listeners.forEach(function (fn) { fn({ matches: false }); });
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
});

test('Req 5.4 — stored theme counts as manual override, OS change ignored', function () {
    const { window, listeners } = createEnv({ storedTheme: 'dark', prefersDark: false });
    window.ThemeEngine.init();

    // Simulate OS switching to light — should stay dark (stored = manual override)
    listeners.forEach(function (fn) { fn({ matches: false }); });
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
});

// --- Requirement 5.5: No flash of wrong theme ---

test('Req 5.5 — applyTheme sets data-theme attribute on <html> directly', function () {
    const { window } = createEnv();
    window.ThemeEngine.applyTheme('dark');
    assert.strictEqual(window.document.documentElement.getAttribute('data-theme'), 'dark');

    window.ThemeEngine.applyTheme('light');
    assert.strictEqual(window.document.documentElement.getAttribute('data-theme'), 'light');
});

// --- Error handling: localStorage unavailable ---

test('Error handling — falls back to OS preference when localStorage unavailable', function () {
    const { window } = createEnv({ localStorageAvailable: false, prefersDark: true });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
});

test('Error handling — toggle works without localStorage (in-memory only)', function () {
    const { window } = createEnv({ localStorageAvailable: false, prefersDark: false });
    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');

    // toggle should not throw even without localStorage
    window.ThemeEngine.toggle();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'dark');
});

// --- Error handling: matchMedia unsupported ---

test('Error handling — defaults to light when matchMedia is unsupported', function () {
    const html = '<!DOCTYPE html><html><head></head><body></body></html>';
    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });
    const { window } = dom;

    // Remove matchMedia
    window.matchMedia = undefined;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: function () { return null; },
            setItem: function () {},
            removeItem: function () {},
        },
        writable: true
    });

    const fs = require('fs');
    const mainJs = fs.readFileSync(require('path').join(__dirname, '..', 'main.js'), 'utf8');
    window.eval(mainJs);

    window.ThemeEngine.init();
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');
});

// --- getTheme returns correct value ---

test('getTheme returns "light" when no theme is set', function () {
    const { window } = createEnv();
    // Before init, no data-theme attribute
    assert.strictEqual(window.ThemeEngine.getTheme(), 'light');
});

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
