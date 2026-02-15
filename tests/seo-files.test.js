/**
 * SEO files unit tests
 *
 * Validates sitemap.xml and robots.txt content.
 * Validates: Requirements 8.4, 8.5
 */
const fs = require('fs');
const path = require('path');
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

const ROOT = path.join(__dirname, '..');
const BASE_URL = 'https://gamaware.github.io/cloud-devops-labs-index/';
const EXPECTED_PAGES = [
    '',                          // index.html (root)
    'learning-resources.html',
    'access-request.html',
    '404.html'
];

// --- sitemap.xml tests ---

console.log('\nSitemap.xml Tests\n');

const sitemapPath = path.join(ROOT, 'sitemap.xml');

test('Req 8.4 — sitemap.xml file exists', function () {
    assert.ok(fs.existsSync(sitemapPath), 'sitemap.xml not found in project root');
});

const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

test('Req 8.4 — sitemap.xml is valid XML (has XML declaration and urlset)', function () {
    assert.ok(sitemapContent.includes('<?xml'), 'Missing XML declaration');
    assert.ok(sitemapContent.includes('<urlset'), 'Missing <urlset> root element');
    assert.ok(sitemapContent.includes('</urlset>'), 'Missing closing </urlset>');
});

test('Req 8.4 — sitemap.xml uses the sitemaps.org schema namespace', function () {
    assert.ok(
        sitemapContent.includes('http://www.sitemaps.org/schemas/sitemap/0.9'),
        'Missing sitemaps.org namespace'
    );
});

test('Req 8.4 — sitemap.xml contains URL for index (root page)', function () {
    assert.ok(
        sitemapContent.includes(BASE_URL),
        `Missing URL for index page: ${BASE_URL}`
    );
});

test('Req 8.4 — sitemap.xml contains URL for learning-resources.html', function () {
    assert.ok(
        sitemapContent.includes(BASE_URL + 'learning-resources.html'),
        'Missing URL for learning-resources.html'
    );
});

test('Req 8.4 — sitemap.xml contains URL for access-request.html', function () {
    assert.ok(
        sitemapContent.includes(BASE_URL + 'access-request.html'),
        'Missing URL for access-request.html'
    );
});

test('Req 8.4 — sitemap.xml contains URL for 404.html', function () {
    assert.ok(
        sitemapContent.includes(BASE_URL + '404.html'),
        'Missing URL for 404.html'
    );
});

test('Req 8.4 — each URL entry has <loc>, <lastmod>, <changefreq>, <priority>', function () {
    // Extract all <url> blocks
    const urlBlocks = sitemapContent.match(/<url>[\s\S]*?<\/url>/g);
    assert.ok(urlBlocks && urlBlocks.length >= 4, `Expected at least 4 <url> entries, found ${urlBlocks ? urlBlocks.length : 0}`);

    urlBlocks.forEach(function (block, i) {
        assert.ok(block.includes('<loc>'), `URL entry ${i + 1} missing <loc>`);
        assert.ok(block.includes('<lastmod>'), `URL entry ${i + 1} missing <lastmod>`);
        assert.ok(block.includes('<changefreq>'), `URL entry ${i + 1} missing <changefreq>`);
        assert.ok(block.includes('<priority>'), `URL entry ${i + 1} missing <priority>`);
    });
});

test('Req 8.4 — all <loc> URLs use the correct base URL', function () {
    const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);
    assert.ok(locMatches && locMatches.length >= 4, 'Expected at least 4 <loc> entries');

    locMatches.forEach(function (loc) {
        const url = loc.replace(/<\/?loc>/g, '');
        assert.ok(
            url.startsWith(BASE_URL),
            `URL "${url}" does not start with base URL "${BASE_URL}"`
        );
    });
});

// --- robots.txt tests ---

console.log('\nRobots.txt Tests\n');

const robotsPath = path.join(ROOT, 'robots.txt');

test('Req 8.5 — robots.txt file exists', function () {
    assert.ok(fs.existsSync(robotsPath), 'robots.txt not found in project root');
});

const robotsContent = fs.readFileSync(robotsPath, 'utf8');

test('Req 8.5 — robots.txt contains User-agent: *', function () {
    assert.ok(
        robotsContent.includes('User-agent: *'),
        'Missing "User-agent: *" directive'
    );
});

test('Req 8.5 — robots.txt contains Allow: /', function () {
    assert.ok(
        robotsContent.includes('Allow: /'),
        'Missing "Allow: /" directive'
    );
});

test('Req 8.5 — robots.txt contains Sitemap directive referencing sitemap.xml', function () {
    const sitemapUrl = BASE_URL + 'sitemap.xml';
    assert.ok(
        robotsContent.includes('Sitemap: ' + sitemapUrl),
        `Missing "Sitemap: ${sitemapUrl}" directive`
    );
});

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
