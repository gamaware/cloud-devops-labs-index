/**
 * Navigation unit tests
 *
 * Uses jsdom for DOM simulation.
 * Validates Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
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

/**
 * Create a fresh jsdom environment with navbar HTML and load main.js.
 */
function createEnv(options = {}) {
    const { scrollY = 0, navLinks = [] } = options;

    const linksHtml = navLinks.map(function (l) {
        return `<a href="${l.href}">${l.text}</a>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head></head>
<body>
    <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="navbar__container">
            <a href="index.html" class="navbar__brand">Alex Garcia</a>
            <button class="navbar__toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Toggle navigation">
                <span class="navbar__toggle-icon"></span>
            </button>
            <div class="navbar__menu" id="nav-menu" role="menubar">
                ${linksHtml}
            </div>
        </div>
    </nav>
    <main id="main-content">
        <section id="about">About</section>
        <section id="labs">Labs</section>
    </main>
</body>
</html>`;

    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });

    const { window } = dom;

    // Mock scrollY
    Object.defineProperty(window, 'scrollY', {
        value: scrollY,
        writable: true
    });

    // Mock matchMedia for ThemeEngine
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

    // Mock localStorage
    const store = {};
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: function (key) { return store[key] || null; },
            setItem: function (key, val) { store[key] = String(val); },
            removeItem: function (key) { delete store[key]; },
            _store: store
        },
        writable: true
    });

    // Mock scrollIntoView on elements
    window.HTMLElement.prototype.scrollIntoView = function () {};

    // Load main.js
    const mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
    window.eval(mainJs);

    return { window, dom };
}

console.log('\nNavigation Unit Tests\n');

// --- Requirement 10.1: Sticky nav with scrolled class ---

test('Req 10.1 — adds navbar--scrolled class when scrollY > 0', function () {
    const { window } = createEnv({ scrollY: 100 });
    window.Navigation.init();
    window.Navigation.handleScroll();
    const navbar = window.document.querySelector('.navbar');
    assert.ok(navbar.classList.contains('navbar--scrolled'));
});

test('Req 10.1 — removes navbar--scrolled class when scrollY is 0', function () {
    const { window } = createEnv({ scrollY: 0 });
    window.Navigation.init();
    // First add the class
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    window.Navigation.handleScroll();
    assert.ok(window.document.querySelector('.navbar').classList.contains('navbar--scrolled'));

    // Then scroll back to top
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.Navigation.handleScroll();
    assert.ok(!window.document.querySelector('.navbar').classList.contains('navbar--scrolled'));
});

test('Req 10.1 — init applies scrolled class if page is already scrolled', function () {
    const { window } = createEnv({ scrollY: 50 });
    window.Navigation.init();
    const navbar = window.document.querySelector('.navbar');
    assert.ok(navbar.classList.contains('navbar--scrolled'));
});

// --- Requirement 10.3: Mobile hamburger toggle ---

test('Req 10.3 — toggleMobileMenu opens menu and sets aria-expanded to true', function () {
    const { window } = createEnv();
    window.Navigation.init();
    window.Navigation.toggleMobileMenu();

    const toggle = window.document.querySelector('.navbar__toggle');
    const menu = window.document.getElementById('nav-menu');

    assert.strictEqual(toggle.getAttribute('aria-expanded'), 'true');
    assert.ok(menu.classList.contains('is-open'));
    assert.strictEqual(menu.getAttribute('aria-hidden'), 'false');
});

test('Req 10.3 — toggleMobileMenu closes menu on second call', function () {
    const { window } = createEnv();
    window.Navigation.init();
    window.Navigation.toggleMobileMenu(); // open
    window.Navigation.toggleMobileMenu(); // close

    const toggle = window.document.querySelector('.navbar__toggle');
    const menu = window.document.getElementById('nav-menu');

    assert.strictEqual(toggle.getAttribute('aria-expanded'), 'false');
    assert.ok(!menu.classList.contains('is-open'));
    assert.strictEqual(menu.getAttribute('aria-hidden'), 'true');
});

test('Req 10.3 — init sets aria-hidden to true on menu', function () {
    const { window } = createEnv();
    window.Navigation.init();
    const menu = window.document.getElementById('nav-menu');
    assert.strictEqual(menu.getAttribute('aria-hidden'), 'true');
});

// --- closeMobileMenu ---

test('closeMobileMenu closes an open menu', function () {
    const { window } = createEnv();
    window.Navigation.init();
    window.Navigation.toggleMobileMenu(); // open
    assert.ok(window.Navigation._isMenuOpen());

    window.Navigation.closeMobileMenu();
    assert.ok(!window.Navigation._isMenuOpen());

    const menu = window.document.getElementById('nav-menu');
    assert.ok(!menu.classList.contains('is-open'));
    assert.strictEqual(menu.getAttribute('aria-hidden'), 'true');
});

test('closeMobileMenu does nothing if menu is already closed', function () {
    const { window } = createEnv();
    window.Navigation.init();
    // Menu starts closed
    window.Navigation.closeMobileMenu();
    assert.ok(!window.Navigation._isMenuOpen());
});

// --- Escape key closes menu ---

test('Escape key closes open mobile menu', function () {
    const { window } = createEnv();
    window.Navigation.init();
    window.Navigation.toggleMobileMenu(); // open
    assert.ok(window.Navigation._isMenuOpen());

    // Simulate Escape keydown
    const event = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    window.document.dispatchEvent(event);

    assert.ok(!window.Navigation._isMenuOpen());
});

test('Escape key does nothing when menu is closed', function () {
    const { window } = createEnv();
    window.Navigation.init();
    assert.ok(!window.Navigation._isMenuOpen());

    const event = new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    window.document.dispatchEvent(event);

    assert.ok(!window.Navigation._isMenuOpen());
});

// --- Requirement 10.5: Smooth scroll on anchor link click ---

test('Req 10.5 — clicking anchor link calls scrollIntoView on target', function () {
    let scrollCalled = false;
    const { window } = createEnv({
        navLinks: [
            { href: '#about', text: 'About' },
            { href: '#labs', text: 'Labs' }
        ]
    });

    // Override scrollIntoView to track calls
    const aboutSection = window.document.getElementById('about');
    aboutSection.scrollIntoView = function (opts) {
        scrollCalled = true;
        assert.strictEqual(opts.behavior, 'smooth');
    };

    window.Navigation.init();

    const link = window.document.querySelector('a[href="#about"]');
    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    assert.ok(scrollCalled, 'scrollIntoView should have been called');
});

test('Req 10.5 — clicking anchor link closes mobile menu if open', function () {
    const { window } = createEnv({
        navLinks: [{ href: '#about', text: 'About' }]
    });
    window.Navigation.init();
    window.Navigation.toggleMobileMenu(); // open
    assert.ok(window.Navigation._isMenuOpen());

    const link = window.document.querySelector('a[href="#about"]');
    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    assert.ok(!window.Navigation._isMenuOpen());
});

// --- Requirement 10.4: Focus trap ---

test('Req 10.4 — trapFocus wraps Tab from last to first element', function () {
    const { window } = createEnv({
        navLinks: [
            { href: '#about', text: 'About' },
            { href: '#labs', text: 'Labs' }
        ]
    });
    window.Navigation.init();

    const menu = window.document.getElementById('nav-menu');
    const links = menu.querySelectorAll('a[href]');
    const lastLink = links[links.length - 1];

    // Focus the last link
    lastLink.focus();

    let defaultPrevented = false;
    const event = new window.KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: false,
        bubbles: true,
        cancelable: true
    });
    // Override preventDefault to track it
    event.preventDefault = function () { defaultPrevented = true; };

    window.Navigation.trapFocus(menu, event);

    assert.ok(defaultPrevented, 'preventDefault should be called to wrap focus');
});

test('Req 10.4 — trapFocus wraps Shift+Tab from first to last element', function () {
    const { window } = createEnv({
        navLinks: [
            { href: '#about', text: 'About' },
            { href: '#labs', text: 'Labs' }
        ]
    });
    window.Navigation.init();

    const menu = window.document.getElementById('nav-menu');
    const links = menu.querySelectorAll('a[href]');
    const firstLink = links[0];

    // Focus the first link
    firstLink.focus();

    let defaultPrevented = false;
    const event = new window.KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
    });
    event.preventDefault = function () { defaultPrevented = true; };

    window.Navigation.trapFocus(menu, event);

    assert.ok(defaultPrevented, 'preventDefault should be called to wrap focus');
});

test('Req 10.4 — trapFocus does nothing for non-Tab keys', function () {
    const { window } = createEnv({
        navLinks: [{ href: '#about', text: 'About' }]
    });
    window.Navigation.init();

    const menu = window.document.getElementById('nav-menu');
    let defaultPrevented = false;
    const event = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
    });
    event.preventDefault = function () { defaultPrevented = true; };

    window.Navigation.trapFocus(menu, event);

    assert.ok(!defaultPrevented, 'preventDefault should NOT be called for non-Tab keys');
});

test('Req 10.4 — trapFocus handles empty container gracefully', function () {
    const { window } = createEnv();
    window.Navigation.init();

    // Create an empty container
    const emptyDiv = window.document.createElement('div');
    const event = new window.KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
    });

    // Should not throw
    window.Navigation.trapFocus(emptyDiv, event);
    window.Navigation.trapFocus(null, event);
    window.Navigation.trapFocus(emptyDiv, null);
});

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
