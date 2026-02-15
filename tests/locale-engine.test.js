/**
 * LocaleEngine unit tests
 *
 * Uses jsdom for DOM simulation.
 * Validates Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
const { JSDOM } = require('jsdom');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

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

const MAIN_JS = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

/**
 * Create a fresh jsdom environment with LocaleEngine available.
 */
function createEnv(options = {}) {
    const {
        storedLocale = null,
        navigatorLanguage = 'en-US',
        localStorageAvailable = true,
        pageTranslations = null
    } = options;

    const html = `<!DOCTYPE html><html><head></head><body>
        <span data-i18n="nav.about">About</span>
        <span data-i18n="nav.labs">Labs</span>
        <span data-i18n="hero.tagline">Tagline</span>
    </body></html>`;

    const dom = new JSDOM(html, {
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

    // Mock navigator.language
    Object.defineProperty(window.navigator, 'language', {
        value: navigatorLanguage,
        writable: true,
        configurable: true
    });

    // Mock localStorage
    if (localStorageAvailable) {
        const store = {};
        if (storedLocale) store['locale'] = storedLocale;

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

    // Set page translations on window before loading main.js
    if (pageTranslations) {
        window.PAGE_TRANSLATIONS = pageTranslations;
    }

    // Load main.js
    window.eval(MAIN_JS);

    return { window, dom };
}

const SAMPLE_TRANSLATIONS = {
    en: { 'nav.about': 'About', 'nav.labs': 'Labs', 'hero.tagline': 'DevOps Consultant' },
    es: { 'nav.about': 'Acerca de', 'nav.labs': 'Laboratorios', 'hero.tagline': 'Consultor DevOps' },
    pt: { 'nav.about': 'Sobre', 'nav.labs': 'Laboratórios', 'hero.tagline': 'Consultor DevOps' }
};

console.log('\nLocaleEngine Unit Tests\n');

// --- Requirement 6.1: Detect browser locale on first visit ---

test('Req 6.1 — detects Spanish locale from navigator.language "es-MX"', function () {
    const { window } = createEnv({ navigatorLanguage: 'es-MX', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'es');
});

test('Req 6.1 — detects Portuguese locale from navigator.language "pt-BR"', function () {
    const { window } = createEnv({ navigatorLanguage: 'pt-BR', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'pt');
});

test('Req 6.1 — detects English locale from navigator.language "en-US"', function () {
    const { window } = createEnv({ navigatorLanguage: 'en-US', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'en');
});

// --- Requirement 6.2: Default to English for unsupported locales ---

test('Req 6.2 — defaults to English for unsupported locale "fr-FR"', function () {
    const { window } = createEnv({ navigatorLanguage: 'fr-FR', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'en');
});

test('Req 6.2 — defaults to English for unsupported locale "de"', function () {
    const { window } = createEnv({ navigatorLanguage: 'de', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'en');
});

test('Req 6.2 — defaults to English for empty navigator.language', function () {
    const { window } = createEnv({ navigatorLanguage: '', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'en');
});

// --- Requirement 6.3: Translate all visible text content ---

test('Req 6.3 — translates data-i18n elements to Spanish', function () {
    const { window } = createEnv({ navigatorLanguage: 'es', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    const el = window.document.querySelector('[data-i18n="nav.about"]');
    assert.strictEqual(el.textContent, 'Acerca de');
});

test('Req 6.3 — translates data-i18n elements to Portuguese', function () {
    const { window } = createEnv({ navigatorLanguage: 'pt', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    const el = window.document.querySelector('[data-i18n="nav.about"]');
    assert.strictEqual(el.textContent, 'Sobre');
});

test('Req 6.3 — leaves element text unchanged when translation key is missing', function () {
    const partialTranslations = {
        en: { 'nav.about': 'About' },
        es: { 'nav.about': 'Acerca de' },
        pt: { 'nav.about': 'Sobre' }
    };
    const { window } = createEnv({ navigatorLanguage: 'es', pageTranslations: partialTranslations });
    window.LocaleEngine.init(partialTranslations);
    // nav.labs has no translation in partialTranslations — should keep original text
    const el = window.document.querySelector('[data-i18n="nav.labs"]');
    assert.strictEqual(el.textContent, 'Labs');
});

// --- Requirement 6.4: Maintain language across page navigation ---

test('Req 6.4 — stored locale is used on subsequent init (simulating page navigation)', function () {
    const { window } = createEnv({ storedLocale: 'pt', navigatorLanguage: 'en-US', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'pt');
});

// --- Requirement 6.5: Store resolved language in localStorage ---

test('Req 6.5 — stores detected locale in localStorage', function () {
    const { window } = createEnv({ navigatorLanguage: 'es-AR', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.localStorage.getItem('locale'), 'es');
});

test('Req 6.5 — setLocale persists to localStorage', function () {
    const { window } = createEnv({ navigatorLanguage: 'en', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    window.LocaleEngine.setLocale('pt');
    assert.strictEqual(window.localStorage.getItem('locale'), 'pt');
    assert.strictEqual(window.LocaleEngine.getLocale(), 'pt');
});

// --- detectLocale pure function tests ---

test('detectLocale — "es" returns "es"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale('es'), 'es');
});

test('detectLocale — "es-419" returns "es"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale('es-419'), 'es');
});

test('detectLocale — "pt" returns "pt"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale('pt'), 'pt');
});

test('detectLocale — "pt-PT" returns "pt"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale('pt-PT'), 'pt');
});

test('detectLocale — "en" returns "en"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale('en'), 'en');
});

test('detectLocale — "ja" returns "en" (unsupported)', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale('ja'), 'en');
});

test('detectLocale — undefined returns "en"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale(undefined), 'en');
});

test('detectLocale — null returns "en"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale(null), 'en');
});

test('detectLocale — empty string returns "en"', function () {
    const { window } = createEnv();
    assert.strictEqual(window.LocaleEngine.detectLocale(''), 'en');
});

// --- Error handling: localStorage unavailable ---

test('Error handling — detects locale without localStorage', function () {
    const { window } = createEnv({ localStorageAvailable: false, navigatorLanguage: 'es', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'es');
});

test('Error handling — setLocale works without localStorage', function () {
    const { window } = createEnv({ localStorageAvailable: false, navigatorLanguage: 'en', pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    window.LocaleEngine.setLocale('pt');
    assert.strictEqual(window.LocaleEngine.getLocale(), 'pt');
});

// --- Error handling: no page translations ---

test('Error handling — init with no translations does not throw', function () {
    const { window } = createEnv({ navigatorLanguage: 'es' });
    window.LocaleEngine.init(null);
    assert.strictEqual(window.LocaleEngine.getLocale(), 'es');
});

// --- setLocale with invalid locale ---

test('setLocale — invalid locale defaults to "en"', function () {
    const { window } = createEnv({ pageTranslations: SAMPLE_TRANSLATIONS });
    window.LocaleEngine.init(SAMPLE_TRANSLATIONS);
    window.LocaleEngine.setLocale('zh');
    assert.strictEqual(window.LocaleEngine.getLocale(), 'en');
});

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
