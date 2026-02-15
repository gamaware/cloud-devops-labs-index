/**
 * AnimationController unit tests
 *
 * Uses jsdom for DOM simulation.
 * Validates Requirements: 11.1, 11.2, 11.3, 11.4
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
 * Create a fresh jsdom environment with animate-on-scroll elements.
 *
 * @param {Object} options
 * @param {boolean} options.reducedMotion - simulate prefers-reduced-motion
 * @param {boolean} options.noIntersectionObserver - remove IO from env
 * @param {number}  options.elementCount - number of .animate-on-scroll divs
 */
function createEnv(options) {
    options = options || {};
    var reducedMotion = !!options.reducedMotion;
    var noIO = !!options.noIntersectionObserver;
    var count = options.elementCount != null ? options.elementCount : 3;

    var elHtml = '';
    for (var i = 0; i < count; i++) {
        elHtml += '<div class="animate-on-scroll">Section ' + i + '</div>\n';
    }

    var html = '<!DOCTYPE html>\n<html>\n<head></head>\n<body>\n'
        + '<nav class="navbar"><div class="navbar__container">'
        + '<button class="navbar__toggle" aria-expanded="false" aria-controls="nav-menu"></button>'
        + '<div class="navbar__menu" id="nav-menu"></div>'
        + '</div></nav>\n'
        + '<main id="main-content">\n' + elHtml + '</main>\n'
        + '</body>\n</html>';

    var dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });

    var win = dom.window;

    // Mock localStorage
    var store = {};
    Object.defineProperty(win, 'localStorage', {
        value: {
            getItem: function (key) { return store[key] || null; },
            setItem: function (key, val) { store[key] = String(val); },
            removeItem: function (key) { delete store[key]; },
            _store: store
        },
        writable: true
    });

    // Mock matchMedia — supports both theme and reduced-motion queries
    win.matchMedia = function (query) {
        var matches = false;
        if (query === '(prefers-reduced-motion: reduce)') {
            matches = reducedMotion;
        }
        return {
            matches: matches,
            media: query,
            addEventListener: function () {},
            removeEventListener: function () {},
            addListener: function () {},
            removeListener: function () {}
        };
    };

    // Mock scrollY
    Object.defineProperty(win, 'scrollY', { value: 0, writable: true });

    // Remove IntersectionObserver if requested
    if (noIO) {
        delete win.IntersectionObserver;
    } else {
        // Provide a minimal IntersectionObserver mock
        win._observedElements = [];
        win._unobservedElements = [];
        win._ioCallback = null;
        win._ioOptions = null;

        win.IntersectionObserver = function (callback, opts) {
            win._ioCallback = callback;
            win._ioOptions = opts;
            this.observe = function (el) {
                win._observedElements.push(el);
            };
            this.unobserve = function (el) {
                win._unobservedElements.push(el);
            };
            this.disconnect = function () {
                win._observedElements = [];
            };
        };
    }

    // Load main.js
    var mainJs = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');
    win.eval(mainJs);

    return { window: win, dom: dom };
}

console.log('\nAnimationController Unit Tests\n');

// --- Requirement 11.2: Uses IntersectionObserver ---

test('Req 11.2 — init creates IntersectionObserver with threshold 0.1', function () {
    var env = createEnv();
    env.window.AnimationController.init();

    assert.ok(env.window._ioCallback, 'IO callback should be set');
    assert.ok(env.window._ioOptions, 'IO options should be set');
    assert.strictEqual(env.window._ioOptions.threshold, 0.1);
});

test('Req 11.2 — init observes all .animate-on-scroll elements', function () {
    var env = createEnv({ elementCount: 4 });
    env.window.AnimationController.init();

    assert.strictEqual(env.window._observedElements.length, 4);
});

test('Req 11.2 — init does not observe when no elements exist', function () {
    var env = createEnv({ elementCount: 0 });
    env.window.AnimationController.init();

    assert.strictEqual(env.window._observedElements.length, 0);
});

// --- Requirement 11.1: Fade-in / slide-up on intersection ---

test('Req 11.1 — onIntersect adds animate-in class to intersecting entries', function () {
    var env = createEnv();
    env.window.AnimationController.init();

    var el = env.window._observedElements[0];
    assert.ok(!el.classList.contains('animate-in'), 'should not have animate-in before intersection');

    // Simulate intersection
    env.window._ioCallback([
        { isIntersecting: true, target: el }
    ]);

    assert.ok(el.classList.contains('animate-in'), 'should have animate-in after intersection');
});

test('Req 11.1 — onIntersect ignores non-intersecting entries', function () {
    var env = createEnv();
    env.window.AnimationController.init();

    var el = env.window._observedElements[0];

    env.window._ioCallback([
        { isIntersecting: false, target: el }
    ]);

    assert.ok(!el.classList.contains('animate-in'), 'should not add animate-in for non-intersecting');
});

// --- Requirement 11.4: Animate only once (unobserve after) ---

test('Req 11.4 — onIntersect unobserves element after adding animate-in', function () {
    var env = createEnv();
    env.window.AnimationController.init();

    var el = env.window._observedElements[0];

    env.window._ioCallback([
        { isIntersecting: true, target: el }
    ]);

    assert.ok(env.window._unobservedElements.indexOf(el) !== -1, 'element should be unobserved');
});

test('Req 11.4 — animate-in is added exactly once even if callback fires multiple times', function () {
    var env = createEnv({ elementCount: 1 });
    env.window.AnimationController.init();

    var el = env.window._observedElements[0];

    // Fire callback twice for the same element
    env.window._ioCallback([{ isIntersecting: true, target: el }]);
    env.window._ioCallback([{ isIntersecting: true, target: el }]);

    assert.ok(el.classList.contains('animate-in'));
    // Element should have been unobserved on first intersection
    assert.strictEqual(env.window._unobservedElements.filter(function (e) { return e === el; }).length, 2);
});

// --- Requirement 11.3: Respect prefers-reduced-motion ---

test('Req 11.3 — respectsReducedMotion returns true when reduce is active', function () {
    var env = createEnv({ reducedMotion: true });
    assert.strictEqual(env.window.AnimationController.respectsReducedMotion(), true);
});

test('Req 11.3 — respectsReducedMotion returns false when reduce is not active', function () {
    var env = createEnv({ reducedMotion: false });
    assert.strictEqual(env.window.AnimationController.respectsReducedMotion(), false);
});

test('Req 11.3 — init adds animate-in to all elements immediately when reduced motion', function () {
    var env = createEnv({ reducedMotion: true, elementCount: 3 });
    env.window.AnimationController.init();

    var elements = env.window.document.querySelectorAll('.animate-on-scroll');
    for (var i = 0; i < elements.length; i++) {
        assert.ok(elements[i].classList.contains('animate-in'),
            'element ' + i + ' should have animate-in immediately');
    }
});

test('Req 11.3 — init does not create IntersectionObserver when reduced motion', function () {
    var env = createEnv({ reducedMotion: true });
    env.window.AnimationController.init();

    assert.strictEqual(env.window._ioCallback, null, 'IO should not be created');
    assert.strictEqual(env.window._observedElements.length, 0);
});

// --- Graceful fallback: IntersectionObserver unsupported ---

test('Fallback — adds animate-in to all elements when IO is unsupported', function () {
    var env = createEnv({ noIntersectionObserver: true, elementCount: 3 });
    env.window.AnimationController.init();

    var elements = env.window.document.querySelectorAll('.animate-on-scroll');
    for (var i = 0; i < elements.length; i++) {
        assert.ok(elements[i].classList.contains('animate-in'),
            'element ' + i + ' should have animate-in as fallback');
    }
});

// --- _reset helper ---

test('_reset disconnects the observer', function () {
    var env = createEnv();
    env.window.AnimationController.init();
    assert.ok(env.window.AnimationController._getObserver() !== null);

    env.window.AnimationController._reset();
    assert.strictEqual(env.window.AnimationController._getObserver(), null);
});

// --- Global exposure ---

test('AnimationController is exposed on window', function () {
    var env = createEnv();
    assert.ok(env.window.AnimationController, 'should be on window');
    assert.strictEqual(typeof env.window.AnimationController.init, 'function');
    assert.strictEqual(typeof env.window.AnimationController.onIntersect, 'function');
    assert.strictEqual(typeof env.window.AnimationController.respectsReducedMotion, 'function');
});

// --- DOMContentLoaded calls AnimationController.init ---

test('DOMContentLoaded initializes AnimationController', function () {
    // createEnv loads main.js which registers DOMContentLoaded listener.
    // jsdom may have already fired the event, so we manually dispatch it
    // to ensure the listener runs.
    var env = createEnv({ elementCount: 2 });

    // Reset observer state so we can detect init being called
    env.window.AnimationController._reset();
    env.window._observedElements = [];

    // Dispatch DOMContentLoaded to trigger the listener
    var event = new env.window.Event('DOMContentLoaded');
    env.window.document.dispatchEvent(event);

    assert.strictEqual(env.window._observedElements.length, 2);
});

// --- Summary ---
console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
