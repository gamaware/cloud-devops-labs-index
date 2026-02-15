/**
 * AccessRequestForm unit tests
 *
 * Uses jsdom for DOM simulation.
 * Validates Requirements: 7.3, 7.5, 12.1, 12.2, 12.3, 12.4, 12.5, 3.7
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

async function testAsync(name, fn) {
    try {
        await fn();
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
 * Create a fresh jsdom environment with the access request form.
 */
function createEnv() {
    const html = `<!DOCTYPE html><html><head></head><body>
        <p id="error-message" style="display:none;"></p>
        <form id="access-form">
            <div class="form-group">
                <label for="name">Full Name</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="github">GitHub Username</label>
                <input type="text" id="github" name="github" required>
            </div>
            <div class="form-group">
                <label for="repo">Repository</label>
                <select id="repo" name="repo" required>
                    <option value="">-- Select --</option>
                    <option value="cloud-devops-labs-100">Labs 100</option>
                </select>
            </div>
            <div class="form-group">
                <label for="reason">Reason</label>
                <select id="reason" name="reason" required>
                    <option value="">-- Select --</option>
                    <option value="Student - Spring 2025">Student</option>
                </select>
            </div>
            <button type="submit" id="submit-btn">Submit Request</button>
        </form>
        <div id="success-message" style="display:none;"></div>
    </body></html>`;

    const dom = new JSDOM(html, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });

    const { window } = dom;

    // Mock matchMedia
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

    // Load main.js
    window.eval(MAIN_JS);

    return { window, dom };
}

console.log('\nAccessRequestForm Unit Tests\n');

// --- Requirement 7.3: sanitizeInput strips HTML tags ---

test('Req 7.3 — sanitizeInput strips <script> tags', function () {
    const { window } = createEnv();
    const result = window.AccessRequestForm.sanitizeInput('<script>alert("xss")</script>Hello');
    assert.strictEqual(result, 'alert("xss")Hello');
});

test('Req 7.3 — sanitizeInput strips <img> tags', function () {
    const { window } = createEnv();
    const result = window.AccessRequestForm.sanitizeInput('<img onerror="alert(1)" src="x">test');
    assert.strictEqual(result, 'test');
});

test('Req 7.3 — sanitizeInput trims whitespace', function () {
    const { window } = createEnv();
    const result = window.AccessRequestForm.sanitizeInput('  hello world  ');
    assert.strictEqual(result, 'hello world');
});

test('Req 7.3 — sanitizeInput returns empty string for non-string input', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.sanitizeInput(null), '');
    assert.strictEqual(window.AccessRequestForm.sanitizeInput(undefined), '');
    assert.strictEqual(window.AccessRequestForm.sanitizeInput(123), '');
});

test('Req 7.3 — sanitizeInput preserves clean text', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.sanitizeInput('John Doe'), 'John Doe');
});

// --- Requirement 7.5: Email validation ---

test('Req 7.5 — isValidEmail accepts valid email', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidEmail('user@example.com'), true);
});

test('Req 7.5 — isValidEmail rejects email without @', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidEmail('userexample.com'), false);
});

test('Req 7.5 — isValidEmail rejects email with multiple @', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidEmail('user@@example.com'), false);
});

test('Req 7.5 — isValidEmail rejects email without domain dot', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidEmail('user@example'), false);
});

test('Req 7.5 — isValidEmail rejects empty string', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidEmail(''), false);
});

test('Req 7.5 — isValidEmail rejects non-string', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidEmail(null), false);
});

// --- Requirement 7.5: GitHub username validation ---

test('Req 7.5 — isValidGitHubUsername accepts valid username', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('gamaware'), true);
});

test('Req 7.5 — isValidGitHubUsername accepts username with hyphens', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('my-user-name'), true);
});

test('Req 7.5 — isValidGitHubUsername rejects leading hyphen', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('-username'), false);
});

test('Req 7.5 — isValidGitHubUsername rejects trailing hyphen', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('username-'), false);
});

test('Req 7.5 — isValidGitHubUsername rejects consecutive hyphens', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('user--name'), false);
});

test('Req 7.5 — isValidGitHubUsername rejects empty string', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername(''), false);
});

test('Req 7.5 — isValidGitHubUsername rejects username > 39 chars', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('a'.repeat(40)), false);
});

test('Req 7.5 — isValidGitHubUsername accepts single character', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('a'), true);
});

test('Req 7.5 — isValidGitHubUsername accepts 39 char username', function () {
    const { window } = createEnv();
    assert.strictEqual(window.AccessRequestForm.isValidGitHubUsername('a'.repeat(39)), true);
});

// --- Requirement 12.1 & 3.7: Field validation and aria-invalid ---

test('Req 12.1/3.7 — validateField returns false for empty required field and sets aria-invalid', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const nameField = window.document.getElementById('name');
    nameField.value = '';
    const result = window.AccessRequestForm.validateField(nameField);
    assert.strictEqual(result, false);
    assert.strictEqual(nameField.getAttribute('aria-invalid'), 'true');
});

test('Req 12.1/3.7 — validateField returns true for valid required field and clears aria-invalid', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const nameField = window.document.getElementById('name');
    nameField.value = 'John Doe';
    const result = window.AccessRequestForm.validateField(nameField);
    assert.strictEqual(result, true);
    assert.strictEqual(nameField.hasAttribute('aria-invalid'), false);
});

test('Req 3.7 — validateField shows inline error message for invalid field', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const nameField = window.document.getElementById('name');
    nameField.value = '';
    window.AccessRequestForm.validateField(nameField);
    const errorEl = nameField.parentNode.querySelector('.form-error');
    assert.ok(errorEl, 'Error element should exist');
    assert.strictEqual(errorEl.style.display, 'block');
    assert.ok(errorEl.textContent.length > 0, 'Error message should not be empty');
});

test('Req 3.7 — validateField clears error for valid field', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const nameField = window.document.getElementById('name');
    // First make it invalid
    nameField.value = '';
    window.AccessRequestForm.validateField(nameField);
    // Then make it valid
    nameField.value = 'John Doe';
    window.AccessRequestForm.validateField(nameField);
    const errorEl = nameField.parentNode.querySelector('.form-error');
    assert.strictEqual(errorEl.style.display, 'none');
});

test('Req 7.5/3.7 — validateField rejects invalid email and sets aria-invalid', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const emailField = window.document.getElementById('email');
    emailField.value = 'not-an-email';
    const result = window.AccessRequestForm.validateField(emailField);
    assert.strictEqual(result, false);
    assert.strictEqual(emailField.getAttribute('aria-invalid'), 'true');
});

test('Req 7.5 — validateField accepts valid email', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const emailField = window.document.getElementById('email');
    emailField.value = 'user@example.com';
    const result = window.AccessRequestForm.validateField(emailField);
    assert.strictEqual(result, true);
});

test('Req 7.5/3.7 — validateField rejects invalid GitHub username', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const githubField = window.document.getElementById('github');
    githubField.value = '-invalid';
    const result = window.AccessRequestForm.validateField(githubField);
    assert.strictEqual(result, false);
    assert.strictEqual(githubField.getAttribute('aria-invalid'), 'true');
});

test('Req 12.1 — validateField rejects empty select', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const repoField = window.document.getElementById('repo');
    repoField.value = '';
    const result = window.AccessRequestForm.validateField(repoField);
    assert.strictEqual(result, false);
});

// --- Requirement 12.5: Submit button disabled during submission ---

test('Req 12.5 — handleSubmit disables submit button during submission', async function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();

    // Fill in valid data
    window.document.getElementById('name').value = 'John Doe';
    window.document.getElementById('email').value = 'john@example.com';
    window.document.getElementById('github').value = 'johndoe';
    window.document.getElementById('repo').value = 'cloud-devops-labs-100';
    window.document.getElementById('reason').value = 'Student - Spring 2025';

    // Mock window.open to prevent actual navigation
    window.open = function () {};

    const submitBtn = window.document.getElementById('submit-btn');
    const event = new window.Event('submit', { cancelable: true });
    event.preventDefault = function () {};

    await window.AccessRequestForm.handleSubmit(event);

    // After successful submission, button should be disabled
    assert.strictEqual(submitBtn.disabled, true);
});

// --- Requirement 12.3: Success confirmation ---

test('Req 12.3 — handleSubmit shows success message on success', async function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();

    // Fill in valid data
    window.document.getElementById('name').value = 'John Doe';
    window.document.getElementById('email').value = 'john@example.com';
    window.document.getElementById('github').value = 'johndoe';
    window.document.getElementById('repo').value = 'cloud-devops-labs-100';
    window.document.getElementById('reason').value = 'Student - Spring 2025';

    // Mock window.open
    window.open = function () {};

    const event = new window.Event('submit', { cancelable: true });
    event.preventDefault = function () {};

    await window.AccessRequestForm.handleSubmit(event);

    const form = window.document.getElementById('access-form');
    const successMsg = window.document.getElementById('success-message');
    assert.strictEqual(form.style.display, 'none');
    assert.strictEqual(successMsg.style.display, 'block');
});

// --- showFieldError / clearFieldError ---

test('showFieldError sets aria-invalid and displays error element', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const field = window.document.getElementById('name');
    window.AccessRequestForm.showFieldError(field, 'Test error');
    assert.strictEqual(field.getAttribute('aria-invalid'), 'true');
    const errorEl = field.parentNode.querySelector('.form-error');
    assert.ok(errorEl);
    assert.strictEqual(errorEl.textContent, 'Test error');
    assert.strictEqual(errorEl.style.display, 'block');
});

test('clearFieldError removes aria-invalid and hides error element', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const field = window.document.getElementById('name');
    window.AccessRequestForm.showFieldError(field, 'Test error');
    window.AccessRequestForm.clearFieldError(field);
    assert.strictEqual(field.hasAttribute('aria-invalid'), false);
    const errorEl = field.parentNode.querySelector('.form-error');
    assert.strictEqual(errorEl.style.display, 'none');
});

// --- init() guard: no form on page ---

test('init() does not throw when form is absent', function () {
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });
    dom.window.matchMedia = function (q) {
        return { matches: false, media: q, addEventListener: function () {}, removeEventListener: function () {}, addListener: function () {}, removeListener: function () {} };
    };
    const store = {};
    Object.defineProperty(dom.window, 'localStorage', {
        value: { getItem: function (k) { return store[k] || null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } },
        writable: true
    });
    dom.window.eval(MAIN_JS);
    // Should not throw — init gracefully exits when form is absent
    dom.window.AccessRequestForm.init();
    assert.ok(true);
});

// --- aria-describedby linkage ---

test('Error element gets aria-describedby linkage to field', function () {
    const { window } = createEnv();
    window.AccessRequestForm.init();
    const field = window.document.getElementById('name');
    window.AccessRequestForm.showFieldError(field, 'Required');
    assert.strictEqual(field.getAttribute('aria-describedby'), 'name-error');
    const errorEl = window.document.getElementById('name-error');
    assert.ok(errorEl, 'Error element should have id matching aria-describedby');
});

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
