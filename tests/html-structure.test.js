/**
 * HTML Structure unit tests
 *
 * Parses each HTML file with jsdom and verifies structural requirements:
 * semantic elements, security attributes, accessibility, SEO metadata,
 * shared asset references, and SRI hashes.
 *
 * Validates: Properties 7, 8 and Requirements 3.1, 3.3, 3.6, 7.1, 7.2, 7.4, 8.1, 8.2
 */
const fs = require('fs');
const path = require('path');
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

const HTML_FILES = ['index.html', 'learning-resources.html', 'access-request.html', '404.html'];

/**
 * Load and parse an HTML file, returning the jsdom document.
 */
function loadHTML(filename) {
    const filePath = path.join(__dirname, '..', filename);
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    return dom.window.document;
}

console.log('\nHTML Structure Unit Tests\n');

for (const file of HTML_FILES) {
    const doc = loadHTML(file);

    console.log(`\n  --- ${file} ---`);

    // 1. Semantic elements (Req 3.1)
    test(`${file}: has <nav> element`, function () {
        assert.ok(doc.querySelector('nav'), 'Missing <nav> element');
    });

    test(`${file}: has <main> element`, function () {
        assert.ok(doc.querySelector('main'), 'Missing <main> element');
    });

    test(`${file}: has <footer> element`, function () {
        assert.ok(doc.querySelector('footer'), 'Missing <footer> element');
    });

    // 2. Skip link (Req 3.6)
    test(`${file}: first element in body is a skip-link`, function () {
        const firstChild = doc.body.firstElementChild;
        assert.ok(firstChild, 'Body has no child elements');
        assert.strictEqual(firstChild.tagName, 'A', 'First element is not an <a>');
        assert.ok(
            firstChild.classList.contains('skip-link'),
            'First element does not have class "skip-link"'
        );
    });

    // 3. External links security (Req 7.2, Property 7)
    test(`${file}: all target="_blank" links have rel="noopener noreferrer"`, function () {
        const externalLinks = doc.querySelectorAll('a[target="_blank"]');
        for (const link of externalLinks) {
            const rel = (link.getAttribute('rel') || '').toLowerCase();
            assert.ok(
                rel.includes('noopener'),
                `Link to "${link.href}" missing "noopener" in rel`
            );
            assert.ok(
                rel.includes('noreferrer'),
                `Link to "${link.href}" missing "noreferrer" in rel`
            );
        }
    });

    // 4. Images have alt attributes (Req 3.3, Property 8)
    test(`${file}: all <img> elements have non-empty alt attributes`, function () {
        const images = doc.querySelectorAll('img');
        for (const img of images) {
            const alt = img.getAttribute('alt');
            assert.ok(alt !== null, `Image "${img.src}" missing alt attribute`);
            assert.ok(alt.length > 0, `Image "${img.src}" has empty alt attribute`);
        }
    });

    // 5. OG meta tags (Req 8.1)
    test(`${file}: has og:title meta tag`, function () {
        assert.ok(doc.querySelector('meta[property="og:title"]'), 'Missing og:title');
    });

    test(`${file}: has og:description meta tag`, function () {
        assert.ok(doc.querySelector('meta[property="og:description"]'), 'Missing og:description');
    });

    test(`${file}: has og:url meta tag`, function () {
        assert.ok(doc.querySelector('meta[property="og:url"]'), 'Missing og:url');
    });

    test(`${file}: has og:type meta tag`, function () {
        assert.ok(doc.querySelector('meta[property="og:type"]'), 'Missing og:type');
    });

    // 6. Canonical URL (Req 8.2)
    test(`${file}: has canonical URL link`, function () {
        assert.ok(doc.querySelector('link[rel="canonical"]'), 'Missing <link rel="canonical">');
    });

    // 7. CSP meta tag (Req 7.1)
    test(`${file}: has Content-Security-Policy meta tag`, function () {
        assert.ok(
            doc.querySelector('meta[http-equiv="Content-Security-Policy"]'),
            'Missing CSP meta tag'
        );
    });

    // 8. SRI hashes on Font Awesome (Req 7.4)
    test(`${file}: Font Awesome link has integrity and crossorigin attributes`, function () {
        const faLink = doc.querySelector('link[href*="font-awesome"]');
        assert.ok(faLink, 'Font Awesome <link> not found');
        assert.ok(faLink.getAttribute('integrity'), 'Font Awesome link missing integrity attribute');
        assert.ok(faLink.getAttribute('crossorigin'), 'Font Awesome link missing crossorigin attribute');
    });

    // 9. Shared assets (Req 4.1, 4.2, 13.1, 13.2)
    test(`${file}: links to shared styles.css`, function () {
        const cssLink = doc.querySelector('link[rel="stylesheet"][href="styles.css"]');
        assert.ok(cssLink, 'Missing <link rel="stylesheet" href="styles.css">');
    });

    test(`${file}: includes main.js script`, function () {
        const script = doc.querySelector('script[src="main.js"]');
        assert.ok(script, 'Missing <script src="main.js">');
    });
}

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
