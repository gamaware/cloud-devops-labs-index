/**
 * Property-Based Test: Form validation rejects invalid input and sets accessibility state
 *
 * Feature: portfolio-redesign, Property 9: Form validation rejects invalid input and sets accessibility state
 *
 * **Validates: Requirements 3.7, 12.1**
 *
 * For any form state where at least one required field is empty or invalid
 * (e.g., malformed email, empty name), calling the form validation function
 * SHALL return false, prevent submission, and set aria-invalid="true" on each
 * invalid field.
 */
const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const MAIN_JS = fs.readFileSync(path.join(__dirname, '..', 'main.js'), 'utf8');

/**
 * Build the minimal form HTML that AccessRequestForm expects.
 * Field ids, names, and error containers match access-request.html.
 */
var FORM_HTML = [
    '<!DOCTYPE html><html><head></head><body>',
    '<form id="access-form">',
    '  <div class="form-group">',
    '    <input id="name" name="name" type="text" required aria-describedby="name-error">',
    '    <span id="name-error" class="form-error" role="alert"></span>',
    '  </div>',
    '  <div class="form-group">',
    '    <input id="email" name="email" type="email" required aria-describedby="email-error">',
    '    <span id="email-error" class="form-error" role="alert"></span>',
    '  </div>',
    '  <div class="form-group">',
    '    <input id="github" name="github" type="text" required aria-describedby="github-error">',
    '    <span id="github-error" class="form-error" role="alert"></span>',
    '  </div>',
    '  <div class="form-group">',
    '    <select id="repo" name="repo" required aria-describedby="repo-error">',
    '      <option value="">Select</option>',
    '      <option value="cloud-devops-labs-100">100</option>',
    '      <option value="cloud-devops-labs-200">200</option>',
    '    </select>',
    '    <span id="repo-error" class="form-error" role="alert"></span>',
    '  </div>',
    '  <div class="form-group">',
    '    <select id="reason" name="reason" required aria-describedby="reason-error">',
    '      <option value="">Select</option>',
    '      <option value="Student">Student</option>',
    '      <option value="Professional">Professional</option>',
    '    </select>',
    '    <span id="reason-error" class="form-error" role="alert"></span>',
    '  </div>',
    '  <button type="submit" id="submit-btn">Submit</button>',
    '</form>',
    '</body></html>'
].join('\n');

/**
 * Create a fresh jsdom environment with the form HTML and load main.js.
 */
function createEnv() {
    var dom = new JSDOM(FORM_HTML, {
        url: 'http://localhost',
        runScripts: 'dangerously',
        pretendToBeVisual: true
    });
    var win = dom.window;

    // Stub matchMedia
    win.matchMedia = function (query) {
        return {
            matches: false,
            media: query,
            addEventListener: function () {},
            removeEventListener: function () {},
            addListener: function () {},
            removeListener: function () {}
        };
    };

    win.eval(MAIN_JS);
    return win;
}

var passed = 0;
var failed = 0;

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

console.log('\nForm Validation Property-Based Tests (Property 9)\n');

// --- Property 9: Empty required fields set aria-invalid="true" ---

test('Property 9: validateField() sets aria-invalid="true" on any empty required field', function () {
    // Generator: pick a random required field id
    var fieldIdGen = fc.constantFrom('name', 'email', 'github', 'repo', 'reason');

    fc.assert(
        fc.property(
            fieldIdGen,
            function (fieldId) {
                var win = createEnv();
                var doc = win.document;
                var field = doc.getElementById(fieldId);

                // Ensure the field value is empty
                if (field.tagName === 'SELECT') {
                    field.value = '';
                } else {
                    field.value = '';
                }

                var result = win.AccessRequestForm.validateField(field);

                assert.strictEqual(result, false,
                    'validateField() should return false for empty required field "' + fieldId + '"');
                assert.strictEqual(field.getAttribute('aria-invalid'), 'true',
                    'aria-invalid should be "true" on empty required field "' + fieldId + '"');
            }
        ),
        { numRuns: 100 }
    );
});

// --- Property 9: Invalid email sets aria-invalid="true" ---

test('Property 9: validateField() sets aria-invalid="true" for invalid email values', function () {
    // Generator: strings that are NOT valid emails (no @, multiple @, no domain dot, etc.)
    var invalidEmailGen = fc.oneof(
        // Strings without @
        fc.string({ minLength: 1, maxLength: 30 }).filter(function (s) { return s.indexOf('@') === -1; }),
        // Strings with multiple @
        fc.tuple(fc.string({ minLength: 1, maxLength: 10 }), fc.string({ minLength: 1, maxLength: 10 }), fc.string({ minLength: 1, maxLength: 10 }))
            .map(function (parts) {
                return parts[0].replace(/@/g, 'a') + '@' + parts[1].replace(/@/g, 'b') + '@' + parts[2].replace(/@/g, 'c');
            }),
        // local@domain (no dot in domain)
        fc.tuple(
            fc.stringMatching(/^[a-z0-9]{1,10}$/),
            fc.stringMatching(/^[a-z0-9]{1,10}$/)
        ).map(function (parts) { return parts[0] + '@' + parts[1]; })
    );

    fc.assert(
        fc.property(
            invalidEmailGen,
            function (emailValue) {
                var win = createEnv();
                var doc = win.document;
                var field = doc.getElementById('email');
                field.value = emailValue;

                var result = win.AccessRequestForm.validateField(field);

                assert.strictEqual(result, false,
                    'validateField() should return false for invalid email "' + emailValue.substring(0, 60) + '"');
                assert.strictEqual(field.getAttribute('aria-invalid'), 'true',
                    'aria-invalid should be "true" for invalid email "' + emailValue.substring(0, 60) + '"');
            }
        ),
        { numRuns: 300 }
    );
});

// --- Property 9: Valid field values do NOT set aria-invalid ---

test('Property 9: validateField() does NOT set aria-invalid="true" for valid field values', function () {
    // Generator: a record with valid values for each field
    var validNameGen = fc.stringMatching(/^[A-Za-z ]{1,20}$/)
        .filter(function (s) { return s.trim().length > 0; });
    var validGithubGen = fc.stringMatching(/^[a-z0-9]{1,15}$/);

    // Test name field with valid value
    fc.assert(
        fc.property(
            validNameGen,
            function (nameValue) {
                var win = createEnv();
                var field = win.document.getElementById('name');
                field.value = nameValue;
                var result = win.AccessRequestForm.validateField(field);
                assert.strictEqual(result, true,
                    'validateField() should return true for valid name "' + nameValue + '"');
                assert.notStrictEqual(field.getAttribute('aria-invalid'), 'true',
                    'aria-invalid should NOT be "true" for valid name "' + nameValue + '"');
            }
        ),
        { numRuns: 100 }
    );

    // Test email field with valid value
    fc.assert(
        fc.property(
            fc.emailAddress(),
            function (emailValue) {
                var win = createEnv();
                var field = win.document.getElementById('email');
                field.value = emailValue;
                var result = win.AccessRequestForm.validateField(field);
                assert.strictEqual(result, true,
                    'validateField() should return true for valid email "' + emailValue + '"');
                assert.notStrictEqual(field.getAttribute('aria-invalid'), 'true',
                    'aria-invalid should NOT be "true" for valid email "' + emailValue + '"');
            }
        ),
        { numRuns: 100 }
    );

    // Test github field with valid value
    fc.assert(
        fc.property(
            validGithubGen,
            function (githubValue) {
                var win = createEnv();
                var field = win.document.getElementById('github');
                field.value = githubValue;
                var result = win.AccessRequestForm.validateField(field);
                assert.strictEqual(result, true,
                    'validateField() should return true for valid github "' + githubValue + '"');
                assert.notStrictEqual(field.getAttribute('aria-invalid'), 'true',
                    'aria-invalid should NOT be "true" for valid github "' + githubValue + '"');
            }
        ),
        { numRuns: 100 }
    );

    // Test select fields with valid value
    fc.assert(
        fc.property(
            fc.constantFrom('repo', 'reason'),
            function (fieldId) {
                var win = createEnv();
                var field = win.document.getElementById(fieldId);
                // Set to a non-empty option value
                var options = field.querySelectorAll('option');
                for (var i = 0; i < options.length; i++) {
                    if (options[i].value !== '') {
                        field.value = options[i].value;
                        break;
                    }
                }
                var result = win.AccessRequestForm.validateField(field);
                assert.strictEqual(result, true,
                    'validateField() should return true for valid select "' + fieldId + '"');
                assert.notStrictEqual(field.getAttribute('aria-invalid'), 'true',
                    'aria-invalid should NOT be "true" for valid select "' + fieldId + '"');
            }
        ),
        { numRuns: 100 }
    );
});

// --- Property 9: aria-invalid is always "true" string or not present ---

test('Property 9: aria-invalid is always "true" or not present (never other values)', function () {
    var fieldIdGen = fc.constantFrom('name', 'email', 'github', 'repo', 'reason');
    var valueGen = fc.oneof(
        fc.constant(''),
        fc.string({ minLength: 0, maxLength: 30 }),
        fc.emailAddress()
    );

    fc.assert(
        fc.property(
            fieldIdGen,
            valueGen,
            function (fieldId, value) {
                var win = createEnv();
                var field = win.document.getElementById(fieldId);
                if (field.tagName === 'SELECT') {
                    // For selects, either empty or a valid option
                    field.value = (value === '') ? '' : field.querySelector('option:not([value=""])').value;
                } else {
                    field.value = value;
                }

                win.AccessRequestForm.validateField(field);

                var ariaInvalid = field.getAttribute('aria-invalid');
                assert.ok(
                    ariaInvalid === 'true' || ariaInvalid === null,
                    'aria-invalid should be "true" or null, got "' + ariaInvalid + '" for field "' + fieldId + '"'
                );
            }
        ),
        { numRuns: 300 }
    );
});

// --- Property 9: Error message container becomes visible for invalid fields ---

test('Property 9: Error message container becomes visible when field is invalid', function () {
    var fieldIdGen = fc.constantFrom('name', 'email', 'github', 'repo', 'reason');

    fc.assert(
        fc.property(
            fieldIdGen,
            function (fieldId) {
                var win = createEnv();
                var doc = win.document;
                var field = doc.getElementById(fieldId);

                // Set field to empty (invalid for required fields)
                if (field.tagName === 'SELECT') {
                    field.value = '';
                } else {
                    field.value = '';
                }

                win.AccessRequestForm.validateField(field);

                var errorEl = doc.getElementById(fieldId + '-error');
                assert.ok(errorEl, 'Error element should exist for field "' + fieldId + '"');
                assert.strictEqual(errorEl.style.display, 'block',
                    'Error element should be visible (display:block) for invalid field "' + fieldId + '"');
                assert.ok(errorEl.textContent.length > 0,
                    'Error element should have a non-empty message for invalid field "' + fieldId + '"');
            }
        ),
        { numRuns: 100 }
    );
});

// --- Property 9: Error message container is hidden for valid fields ---

test('Property 9: Error message container is hidden when field is valid', function () {
    var validNameGen = fc.stringMatching(/^[A-Za-z ]{1,20}$/)
        .filter(function (s) { return s.trim().length > 0; });

    fc.assert(
        fc.property(
            validNameGen,
            function (nameValue) {
                var win = createEnv();
                var doc = win.document;
                var field = doc.getElementById('name');
                field.value = nameValue;

                win.AccessRequestForm.validateField(field);

                var errorEl = doc.getElementById('name-error');
                assert.ok(errorEl, 'Error element should exist');
                assert.strictEqual(errorEl.style.display, 'none',
                    'Error element should be hidden (display:none) for valid field');
            }
        ),
        { numRuns: 100 }
    );
});

// --- Summary ---
console.log('\n' + passed + ' passed, ' + failed + ' failed\n');
process.exit(failed > 0 ? 1 : 0);
