/**
 * main.js — Shared JavaScript module for Cloud DevOps Labs Index
 *
 * Contains: ThemeEngine, LocaleEngine, Navigation, AnimationController, AccessRequestForm
 * Loaded via <script src="main.js" defer></script> on all pages.
 */

/* ============================================================
 * ThemeEngine
 * Detects OS color scheme, persists manual choice to localStorage,
 * and applies theme via data-theme attribute on <html>.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 * ============================================================ */
const ThemeEngine = (function () {
    const STORAGE_KEY = 'theme';
    const ATTR = 'data-theme';
    const DARK = 'dark';
    const LIGHT = 'light';

    let _manualOverride = false;
    let _mediaQuery = null;

    /**
     * Read a value from localStorage. Returns null if storage is
     * unavailable (private browsing, quota exceeded, etc.).
     */
    function _storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (_e) {
            return null;
        }
    }

    /**
     * Write a value to localStorage. Silently fails if storage is
     * unavailable.
     */
    function _storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (_e) {
            // localStorage unavailable — fall back to in-memory only
        }
    }

    /**
     * Remove a key from localStorage. Silently fails if storage is
     * unavailable.
     */
    function _storageRemove(key) {
        try {
            localStorage.removeItem(key);
        } catch (_e) {
            // localStorage unavailable
        }
    }

    /**
     * Detect OS preference. Returns 'dark' or 'light'.
     * Defaults to 'light' if matchMedia is unsupported.
     */
    function _detectOSPreference() {
        if (typeof window.matchMedia === 'function') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
        }
        return LIGHT;
    }

    /**
     * Apply the given theme to the document.
     * Sets the data-theme attribute on <html>.
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute(ATTR, theme);
    }

    /**
     * Return the current active theme ('light' or 'dark').
     */
    function getTheme() {
        return document.documentElement.getAttribute(ATTR) || LIGHT;
    }

    /**
     * Handle OS color scheme change events.
     * Only updates theme if the user hasn't manually overridden.
     */
    function onOSChange(event) {
        if (!_manualOverride) {
            var theme = event.matches ? DARK : LIGHT;
            applyTheme(theme);
        }
    }

    /**
     * Toggle between light and dark themes.
     * Persists the manual choice to localStorage and sets the
     * manual override flag so OS changes are ignored.
     */
    function toggle() {
        var current = getTheme();
        var next = current === DARK ? LIGHT : DARK;
        applyTheme(next);
        _storageSet(STORAGE_KEY, next);
        _manualOverride = true;
    }

    /**
     * Initialize the ThemeEngine.
     * 1. Check localStorage for a stored theme
     * 2. If found, apply it (manual override is active)
     * 3. If not found, detect OS preference and apply
     * 4. Listen for OS color scheme changes
     */
    function init() {
        var stored = _storageGet(STORAGE_KEY);

        if (stored === DARK || stored === LIGHT) {
            applyTheme(stored);
            _manualOverride = true;
        } else {
            applyTheme(_detectOSPreference());
            _manualOverride = false;
        }

        // Listen for OS color scheme changes
        if (typeof window.matchMedia === 'function') {
            _mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            // Use addEventListener where supported, fall back to addListener
            if (_mediaQuery.addEventListener) {
                _mediaQuery.addEventListener('change', onOSChange);
            } else if (_mediaQuery.addListener) {
                _mediaQuery.addListener(onOSChange);
            }
        }
    }

    // Expose internal helpers for testing
    function _getManualOverride() {
        return _manualOverride;
    }

    function _reset() {
        _manualOverride = false;
        _storageRemove(STORAGE_KEY);
        document.documentElement.removeAttribute(ATTR);
    }

    return {
        init: init,
        toggle: toggle,
        applyTheme: applyTheme,
        onOSChange: onOSChange,
        getTheme: getTheme,
        // Test helpers (prefixed with underscore)
        _getManualOverride: _getManualOverride,
        _reset: _reset,
        _STORAGE_KEY: STORAGE_KEY
    };
})();

// Expose ThemeEngine globally so it can be called from HTML
window.ThemeEngine = ThemeEngine;

/* ============================================================
 * LocaleEngine
 * Detects browser locale, maps to supported language (en/es/pt),
 * persists choice to localStorage, and translates page content
 * via data-i18n attributes.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 * ============================================================ */
const LocaleEngine = (function () {
    const STORAGE_KEY = 'locale';
    const SUPPORTED = ['en', 'es', 'pt'];
    const DEFAULT_LOCALE = 'en';

    var _currentLocale = DEFAULT_LOCALE;
    var _pageTranslations = null;

    /**
     * Read a value from localStorage. Returns null if storage is
     * unavailable (private browsing, quota exceeded, etc.).
     */
    function _storageGet(key) {
        try {
            return localStorage.getItem(key);
        } catch (_e) {
            return null;
        }
    }

    /**
     * Write a value to localStorage. Silently fails if storage is
     * unavailable.
     */
    function _storageSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (_e) {
            // localStorage unavailable — fall back to in-memory only
        }
    }

    /**
     * Detect browser locale from navigator.language and map to a
     * supported language code.
     *
     * Mapping rules:
     *   - Starts with 'es' → 'es'
     *   - Starts with 'pt' → 'pt'
     *   - Everything else (including undefined/empty) → 'en'
     *
     * This is a pure function suitable for property-based testing.
     */
    function detectLocale(navigatorLanguage) {
        if (!navigatorLanguage || typeof navigatorLanguage !== 'string') {
            return DEFAULT_LOCALE;
        }
        var lang = navigatorLanguage.toLowerCase();
        if (lang.indexOf('es') === 0) return 'es';
        if (lang.indexOf('pt') === 0) return 'pt';
        return DEFAULT_LOCALE;
    }

    /**
     * Apply translations to all elements with a data-i18n attribute.
     * If a translation key is missing, the element's existing text
     * is left unchanged.
     */
    function translate(locale) {
        if (!_pageTranslations) return;

        var translations = _pageTranslations[locale];
        if (!translations) return;

        var elements = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < elements.length; i++) {
            var key = elements[i].getAttribute('data-i18n');
            if (key && translations[key] !== undefined) {
                elements[i].textContent = translations[key];
            }
        }
    }

    /**
     * Set the active locale, persist to localStorage, and
     * re-translate the page.
     */
    function setLocale(locale) {
        if (SUPPORTED.indexOf(locale) === -1) {
            locale = DEFAULT_LOCALE;
        }
        _currentLocale = locale;
        _storageSet(STORAGE_KEY, locale);
        translate(locale);
    }

    /**
     * Return the current active locale.
     */
    function getLocale() {
        return _currentLocale;
    }

    /**
     * Initialize the LocaleEngine.
     * 1. Store the page-specific translations reference
     * 2. Check localStorage for a stored locale
     * 3. If found and supported, use it
     * 4. If not found, detect from navigator.language
     * 5. Persist and translate
     *
     * @param {Object} pageTranslations - The PAGE_TRANSLATIONS object
     *        defined inline in each HTML page.
     */
    function init(pageTranslations) {
        _pageTranslations = pageTranslations || null;

        var stored = _storageGet(STORAGE_KEY);

        if (stored && SUPPORTED.indexOf(stored) !== -1) {
            _currentLocale = stored;
        } else {
            var browserLang = (typeof navigator !== 'undefined' && navigator.language)
                ? navigator.language
                : '';
            _currentLocale = detectLocale(browserLang);
            _storageSet(STORAGE_KEY, _currentLocale);
        }

        translate(_currentLocale);
    }

    // Expose internal helpers for testing
    function _reset() {
        _currentLocale = DEFAULT_LOCALE;
        _pageTranslations = null;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_e) {
            // localStorage unavailable
        }
    }

    return {
        init: init,
        detectLocale: detectLocale,
        setLocale: setLocale,
        translate: translate,
        getLocale: getLocale,
        // Test helpers
        _reset: _reset,
        _STORAGE_KEY: STORAGE_KEY,
        _SUPPORTED: SUPPORTED,
        _DEFAULT_LOCALE: DEFAULT_LOCALE
    };
})();

// Expose LocaleEngine globally so it can be called from HTML
window.LocaleEngine = LocaleEngine;

/* ============================================================
 * Navigation
 * Sticky navbar with scroll detection, mobile hamburger menu
 * with focus trapping, smooth scroll to anchors, and keyboard
 * support (Escape to close).
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 * ============================================================ */
const Navigation = (function () {
    var _navbar = null;
    var _toggle = null;
    var _menu = null;
    var _isOpen = false;
    var _boundEscHandler = null;

    /**
     * Add or remove the scrolled class on the navbar based on
     * scroll position. Adds `.navbar--scrolled` when scrollY > 0.
     *
     * Requirement 10.1: Navigation remains fixed at top when scrolling
     */
    function handleScroll() {
        if (!_navbar) return;
        if (window.scrollY > 0) {
            _navbar.classList.add('navbar--scrolled');
        } else {
            _navbar.classList.remove('navbar--scrolled');
        }
    }

    /**
     * Trap keyboard focus within a container element.
     * On Tab at the last focusable element, wraps to the first.
     * On Shift+Tab at the first focusable element, wraps to the last.
     *
     * Requirement 10.4: Trap keyboard focus within mobile menu
     *
     * @param {HTMLElement} container - The element to trap focus within
     * @param {KeyboardEvent} event - The keydown event
     */
    function trapFocus(container, event) {
        if (!container || !event || event.key !== 'Tab') return;

        var focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        var focusableElements = container.querySelectorAll(focusableSelectors);

        if (focusableElements.length === 0) return;

        var firstFocusable = focusableElements[0];
        var lastFocusable = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift+Tab: if on first element, wrap to last
            if (document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable.focus();
            }
        } else {
            // Tab: if on last element, wrap to first
            if (document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable.focus();
            }
        }
    }

    /**
     * Open or close the mobile menu overlay.
     * Toggles `.is-open` on the menu, updates `aria-expanded` on
     * the toggle button, and sets `aria-hidden` on the menu.
     *
     * Requirement 10.3: Hamburger icon toggles mobile menu overlay
     */
    function toggleMobileMenu() {
        if (!_toggle || !_menu) return;

        _isOpen = !_isOpen;

        _menu.classList.toggle('is-open', _isOpen);
        _toggle.setAttribute('aria-expanded', String(_isOpen));
        _menu.setAttribute('aria-hidden', String(!_isOpen));

        if (_isOpen) {
            // Focus the first focusable element in the menu
            var firstLink = _menu.querySelector('a[href], button:not([disabled])');
            if (firstLink) firstLink.focus();
        } else {
            // Return focus to the toggle button
            _toggle.focus();
        }
    }

    /**
     * Close the mobile menu and reset aria attributes.
     * Used when a nav link is clicked or Escape is pressed.
     */
    function closeMobileMenu() {
        if (!_isOpen) return;

        _isOpen = false;
        if (_menu) {
            _menu.classList.remove('is-open');
            _menu.setAttribute('aria-hidden', 'true');
        }
        if (_toggle) {
            _toggle.setAttribute('aria-expanded', 'false');
            _toggle.focus();
        }
    }

    /**
     * Handle keydown events for Escape key and focus trapping.
     */
    function _onKeyDown(event) {
        if (event.key === 'Escape' && _isOpen) {
            closeMobileMenu();
            return;
        }
        if (_isOpen && _menu) {
            trapFocus(_menu, event);
        }
    }

    /**
     * Handle smooth scrolling for same-page anchor links.
     *
     * Requirement 10.5: Smooth-scroll to target section on link click
     *
     * @param {Event} event - The click event on a nav link
     */
    function _handleNavLinkClick(event) {
        var link = event.currentTarget;
        var href = link.getAttribute('href');

        if (!href || href.charAt(0) !== '#') return;

        var target = document.querySelector(href);
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }

        // Close mobile menu after clicking a link
        if (_isOpen) {
            closeMobileMenu();
        }
    }

    /**
     * Initialize the Navigation module.
     * Sets up scroll listener, mobile menu toggle, keyboard handlers,
     * and smooth scroll on anchor links.
     */
    function init() {
        _navbar = document.querySelector('.navbar');
        _toggle = document.querySelector('.navbar__toggle');
        _menu = document.getElementById('nav-menu');

        // Set initial aria-hidden on menu
        if (_menu) {
            _menu.setAttribute('aria-hidden', 'true');
        }

        // Sticky nav scroll handler (Req 10.1)
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Apply immediately in case page is already scrolled
        handleScroll();

        // Mobile menu toggle (Req 10.3)
        if (_toggle) {
            _toggle.addEventListener('click', toggleMobileMenu);
        }

        // Keyboard support: Escape to close, focus trap (Req 10.4)
        _boundEscHandler = _onKeyDown;
        document.addEventListener('keydown', _boundEscHandler);

        // Smooth scroll for same-page anchor links (Req 10.5)
        var navLinks = document.querySelectorAll('.navbar__menu a[href^="#"]');
        for (var i = 0; i < navLinks.length; i++) {
            navLinks[i].addEventListener('click', _handleNavLinkClick);
        }
    }

    // Expose internal state for testing
    function _isMenuOpen() {
        return _isOpen;
    }

    function _reset() {
        _isOpen = false;
        _navbar = null;
        _toggle = null;
        _menu = null;
        if (_boundEscHandler) {
            document.removeEventListener('keydown', _boundEscHandler);
            _boundEscHandler = null;
        }
        window.removeEventListener('scroll', handleScroll);
    }

    return {
        init: init,
        toggleMobileMenu: toggleMobileMenu,
        closeMobileMenu: closeMobileMenu,
        trapFocus: trapFocus,
        handleScroll: handleScroll,
        // Test helpers
        _isMenuOpen: _isMenuOpen,
        _reset: _reset
    };
})();

// Expose Navigation globally
window.Navigation = Navigation;

/* ============================================================
 * AnimationController
 * Manages scroll-triggered entrance animations using the
 * Intersection Observer API. Respects prefers-reduced-motion.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4
 * ============================================================ */
const AnimationController = (function () {
    var _observer = null;

    /**
     * Check whether the user prefers reduced motion.
     * Returns true if prefers-reduced-motion: reduce is active.
     *
     * This is a pure function suitable for property-based testing.
     */
    function respectsReducedMotion() {
        if (typeof window.matchMedia === 'function') {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        return false;
    }

    /**
     * IntersectionObserver callback. For each entry that is
     * intersecting, add the 'animate-in' class and unobserve
     * the element so the animation fires only once.
     *
     * Requirement 11.1: Fade-in / slide-up on viewport entry
     * Requirement 11.4: Animate only once per element per page load
     *
     * @param {IntersectionObserverEntry[]} entries
     */
    function onIntersect(entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                entries[i].target.classList.add('animate-in');
                if (_observer) {
                    _observer.unobserve(entries[i].target);
                }
            }
        }
    }

    /**
     * Initialize the AnimationController.
     *
     * 1. If prefers-reduced-motion is enabled, skip observer and
     *    immediately show all elements (add 'animate-in' class).
     * 2. If IntersectionObserver is unsupported, fall back to
     *    immediately showing all elements.
     * 3. Otherwise, create an observer with threshold 0.1 and
     *    observe every `.animate-on-scroll` element.
     *
     * Requirement 11.2: Use IntersectionObserver API
     * Requirement 11.3: Respect prefers-reduced-motion
     */
    function init() {
        var elements = document.querySelectorAll('.animate-on-scroll');

        // Reduced motion — show everything immediately
        if (respectsReducedMotion()) {
            for (var i = 0; i < elements.length; i++) {
                elements[i].classList.add('animate-in');
            }
            return;
        }

        // Graceful fallback if IntersectionObserver is unsupported
        if (typeof IntersectionObserver === 'undefined') {
            for (var j = 0; j < elements.length; j++) {
                elements[j].classList.add('animate-in');
            }
            return;
        }

        // Create observer and observe each element
        _observer = new IntersectionObserver(onIntersect, {
            threshold: 0.1
        });

        for (var k = 0; k < elements.length; k++) {
            _observer.observe(elements[k]);
        }
    }

    // Expose internal helpers for testing
    function _reset() {
        if (_observer) {
            _observer.disconnect();
            _observer = null;
        }
    }

    function _getObserver() {
        return _observer;
    }

    return {
        init: init,
        onIntersect: onIntersect,
        respectsReducedMotion: respectsReducedMotion,
        // Test helpers
        _reset: _reset,
        _getObserver: _getObserver
    };
})();

// Expose AnimationController globally
window.AnimationController = AnimationController;

/* ============================================================
 * AccessRequestForm
 * Handles form validation, input sanitization, GitHub username
 * verification, and submission for the access request form on
 * access-request.html.
 *
 * Requirements: 7.3, 7.5, 12.1, 12.2, 12.3, 12.4, 12.5, 3.7
 * ============================================================ */
const AccessRequestForm = (function () {
    var _form = null;
    var _submitBtn = null;
    var _successMessage = null;
    var _submitBtnOriginalText = '';

    /**
     * Strip HTML tags and trim whitespace from a string.
     * Pure function — safe for property-based testing.
     *
     * Requirement 7.3: Sanitize all user inputs before DOM manipulation
     *
     * @param {string} value - Raw input string
     * @returns {string} Sanitized string with no HTML tags
     */
    function sanitizeInput(value) {
        if (typeof value !== 'string') return '';
        return value.replace(/<[^>]*>/g, '').trim();
    }

    /**
     * Validate an email address format.
     * Must have exactly one @, non-empty local part, and a domain
     * with at least one dot.
     * Pure function — safe for property-based testing.
     *
     * Requirement 7.5: Validate email format client-side
     *
     * @param {string} email - Email string to validate
     * @returns {boolean} True if valid email format
     */
    function isValidEmail(email) {
        if (typeof email !== 'string' || email.length === 0) return false;
        // Exactly one @, non-empty local part, domain with at least one dot
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) return false;
        // Ensure exactly one @
        var atCount = 0;
        for (var i = 0; i < email.length; i++) {
            if (email[i] === '@') atCount++;
        }
        return atCount === 1;
    }

    /**
     * Validate a GitHub username format.
     * Alphanumeric and hyphens, no leading/trailing hyphens,
     * no consecutive hyphens, max 39 characters.
     * Pure function — safe for property-based testing.
     *
     * Requirement 7.5: Validate GitHub username format client-side
     *
     * @param {string} username - GitHub username to validate
     * @returns {boolean} True if valid format
     */
    function isValidGitHubUsername(username) {
        if (typeof username !== 'string' || username.length === 0) return false;
        var re = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
        return re.test(username);
    }

    /**
     * Display an inline error message for a form field and set
     * aria-invalid="true" on the input.
     *
     * Requirement 3.7: Display inline error messages, set aria-invalid
     *
     * @param {HTMLElement} field - The input/select element
     * @param {string} message - Error message to display
     */
    function showFieldError(field, message) {
        if (!field) return;
        field.setAttribute('aria-invalid', 'true');
        var errorEl = _getOrCreateErrorElement(field);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * Clear the inline error message for a form field and remove
     * aria-invalid.
     *
     * @param {HTMLElement} field - The input/select element
     */
    function clearFieldError(field) {
        if (!field) return;
        field.removeAttribute('aria-invalid');
        var errorEl = _getOrCreateErrorElement(field);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    /**
     * Get or create the .form-error element adjacent to a field.
     * If it doesn't exist, creates one and inserts it after the field.
     *
     * @param {HTMLElement} field - The input/select element
     * @returns {HTMLElement|null} The error element
     */
    function _getOrCreateErrorElement(field) {
        if (!field || !field.parentNode) return null;
        var errorEl = field.parentNode.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'form-error';
            errorEl.setAttribute('role', 'alert');
            errorEl.style.display = 'none';
            field.parentNode.appendChild(errorEl);
            // Link field to error via aria-describedby
            var errorId = field.id + '-error';
            errorEl.id = errorId;
            field.setAttribute('aria-describedby', errorId);
        }
        return errorEl;
    }

    /**
     * Validate a single form field. Shows or clears the inline error.
     *
     * Requirement 12.1: Validate all required fields before submission
     * Requirement 7.5: Validate email and GitHub username format
     * Requirement 3.7: Set aria-invalid on invalid fields
     *
     * @param {HTMLElement} field - The input/select element
     * @returns {boolean} True if the field is valid
     */
    function validateField(field) {
        if (!field) return false;

        var value = field.value ? field.value.trim() : '';
        var fieldId = field.id || '';

        // Required check
        if (field.hasAttribute('required') && value === '') {
            showFieldError(field, 'This field is required.');
            return false;
        }

        // Email format validation
        if (fieldId === 'email' && value !== '') {
            if (!isValidEmail(value)) {
                showFieldError(field, 'Please enter a valid email address.');
                return false;
            }
        }

        // GitHub username format validation
        if (fieldId === 'github' && value !== '') {
            if (!isValidGitHubUsername(value)) {
                showFieldError(field, 'Please enter a valid GitHub username.');
                return false;
            }
        }

        // Select fields — must have a non-empty value
        if (field.tagName === 'SELECT' && field.hasAttribute('required') && value === '') {
            showFieldError(field, 'Please select an option.');
            return false;
        }

        clearFieldError(field);
        return true;
    }

    /**
     * Async: Validate a GitHub username against the GitHub API.
     * Shows inline feedback: green checkmark on success, "not found"
     * on 404, warning on network error (allows submission).
     *
     * Requirement 12.2: Validate GitHub username against API on blur
     *
     * @param {string} username - GitHub username to check
     * @returns {Promise<boolean>} True if user exists or on error
     */
    async function validateGitHubUsername(username) {
        var field = _form ? _form.querySelector('#github') : null;
        if (!field) return true;

        // Skip API call if format is invalid
        if (!isValidGitHubUsername(username)) {
            return false;
        }

        try {
            var response = await fetch('https://api.github.com/users/' + encodeURIComponent(username));
            if (response.status === 200) {
                clearFieldError(field);
                // Show green checkmark feedback
                var errorEl = _getOrCreateErrorElement(field);
                if (errorEl) {
                    errorEl.textContent = '✓ GitHub user verified';
                    errorEl.style.display = 'block';
                    errorEl.style.color = '#28a745';
                }
                return true;
            } else if (response.status === 404) {
                showFieldError(field, 'GitHub user not found.');
                return false;
            } else {
                // Other error — allow submission with warning
                clearFieldError(field);
                var warnEl = _getOrCreateErrorElement(field);
                if (warnEl) {
                    warnEl.textContent = '⚠ Could not verify username. You may still submit.';
                    warnEl.style.display = 'block';
                    warnEl.style.color = '#e68a00';
                }
                return true;
            }
        } catch (_e) {
            // Network error — allow submission with warning
            clearFieldError(field);
            var warnEl2 = _getOrCreateErrorElement(field);
            if (warnEl2) {
                warnEl2.textContent = '⚠ Could not verify username. You may still submit.';
                warnEl2.style.display = 'block';
                warnEl2.style.color = '#e68a00';
            }
            return true;
        }
    }

    /**
     * Handle form submission. Validates all fields, sanitizes inputs,
     * constructs a GitHub Issue URL, and redirects.
     *
     * Requirement 12.1: Validate all required fields
     * Requirement 12.3: Show success confirmation on success
     * Requirement 12.4: Show error and retain data on failure
     * Requirement 12.5: Disable submit button and show loading
     *
     * @param {Event} event - The submit event
     */
    async function handleSubmit(event) {
        event.preventDefault();
        if (!_form) return;

        // Validate all fields
        var fields = _form.querySelectorAll('input, select, textarea');
        var allValid = true;
        for (var i = 0; i < fields.length; i++) {
            if (!validateField(fields[i])) {
                allValid = false;
            }
        }

        if (!allValid) return;

        // Disable submit button and show loading (Req 12.5)
        if (_submitBtn) {
            _submitBtn.disabled = true;
            _submitBtn.textContent = 'Submitting...';
        }

        // Sanitize inputs
        var name = sanitizeInput(_form.querySelector('#name').value);
        var email = sanitizeInput(_form.querySelector('#email').value);
        var github = sanitizeInput(_form.querySelector('#github').value);
        var repo = sanitizeInput(_form.querySelector('#repo').value);
        var reason = sanitizeInput(_form.querySelector('#reason').value);

        try {
            // Construct GitHub Issue URL
            var title = encodeURIComponent('Access Request: ' + repo + ' - ' + github);
            var body = encodeURIComponent(
                '**Name:** ' + name + '\n' +
                '**Email:** ' + email + '\n' +
                '**GitHub Username:** ' + github + '\n' +
                '**Repository:** ' + repo + '\n' +
                '**Reason:** ' + reason
            );
            var issueUrl = 'https://github.com/gamaware/cloud-devops-labs-index/issues/new'
                + '?title=' + title
                + '&body=' + body
                + '&labels=access-request';

            // Show success confirmation (Req 12.3)
            _form.style.display = 'none';
            if (_successMessage) {
                _successMessage.style.display = 'block';
            }

            // Redirect to GitHub issue creation page
            window.open(issueUrl, '_blank', 'noopener,noreferrer');
        } catch (_e) {
            // Show error and retain form data (Req 12.4)
            _showFormError('There was an error submitting your request. Please try again.');

            // Re-enable submit button
            if (_submitBtn) {
                _submitBtn.disabled = false;
                _submitBtn.textContent = _submitBtnOriginalText;
            }
        }
    }

    /**
     * Display a general form-level error message.
     *
     * @param {string} message - Error message to display
     */
    function _showFormError(message) {
        var errorMsg = document.getElementById('error-message');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    /**
     * Initialize the AccessRequestForm module.
     * Only binds handlers if the form element exists on the page.
     *
     * Binds:
     * - blur validation on each field
     * - async GitHub username validation on blur
     * - form submit handler
     */
    function init() {
        _form = document.getElementById('access-form');
        if (!_form) return; // Form only exists on access-request.html

        _submitBtn = _form.querySelector('#submit-btn') || _form.querySelector('[type="submit"]');
        _successMessage = document.getElementById('success-message');
        _submitBtnOriginalText = _submitBtn ? _submitBtn.textContent : 'Submit Request';

        // Bind blur validation on each field
        var fields = _form.querySelectorAll('input, select, textarea');
        for (var i = 0; i < fields.length; i++) {
            (function (field) {
                field.addEventListener('blur', function () {
                    validateField(field);
                });
            })(fields[i]);
        }

        // Async GitHub username validation on blur (Req 12.2)
        var githubField = _form.querySelector('#github');
        if (githubField) {
            githubField.addEventListener('blur', function () {
                var value = githubField.value.trim();
                if (value && isValidGitHubUsername(value)) {
                    validateGitHubUsername(value);
                }
            });
        }

        // Form submit handler
        _form.addEventListener('submit', handleSubmit);
    }

    // Expose internal helpers for testing
    function _reset() {
        _form = null;
        _submitBtn = null;
        _successMessage = null;
        _submitBtnOriginalText = '';
    }

    return {
        init: init,
        validateField: validateField,
        validateGitHubUsername: validateGitHubUsername,
        sanitizeInput: sanitizeInput,
        handleSubmit: handleSubmit,
        showFieldError: showFieldError,
        clearFieldError: clearFieldError,
        // Pure validation functions exposed for testing
        isValidEmail: isValidEmail,
        isValidGitHubUsername: isValidGitHubUsername,
        // Test helpers
        _reset: _reset,
        _getOrCreateErrorElement: _getOrCreateErrorElement
    };
})();

// Expose AccessRequestForm globally
window.AccessRequestForm = AccessRequestForm;

/* ============================================================
 * DOMContentLoaded — Initialize all modules
 * ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    ThemeEngine.init();
    LocaleEngine.init(window.PAGE_TRANSLATIONS);
    Navigation.init();
    AnimationController.init();
    AccessRequestForm.init();
});
