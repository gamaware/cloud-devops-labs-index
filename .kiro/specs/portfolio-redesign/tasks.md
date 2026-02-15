# Implementation Plan: Portfolio Redesign

## Overview

Incrementally rebuild the portfolio site by first establishing the shared design system and architecture (styles.css + main.js), then refactoring each HTML page to use shared assets, adding new features (404 page, SEO files, animations, security), and finally wiring everything together with tests.

## Tasks

- [x] 1. Create the shared design system in styles.css
  - [x] 1.1 Define CSS custom properties (color palette, typography scale, spacing tokens, border radii, shadows, transitions) for light theme in `:root` and dark theme in `[data-theme="dark"]`
    - Include all tokens from the design document: colors, font sizes, spacing, radii, shadows, transitions, layout variables
    - _Requirements: 1.1, 1.3_
  - [x] 1.2 Implement base reset, typography, and shared component styles (navbar, cards, buttons, forms, footer, timeline, skill tags, certification badges)
    - Mobile-first approach with breakpoints at 480px, 768px, and 1024px
    - Sticky navbar styles with `.navbar--scrolled` modifier
    - Hamburger menu styles for mobile
    - Skip-link styles (visually hidden until focused)
    - Focus indicator styles for all interactive elements
    - Scroll animation classes (`.animate-on-scroll` and `.animate-in`)
    - `prefers-reduced-motion` media query to disable animations
    - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 3.2, 3.6, 11.1, 11.3_

- [x] 2. Create the shared JavaScript module (main.js)
  - [x] 2.1 Implement ThemeEngine: init(), toggle(), applyTheme(), onOSChange(), getTheme()
    - Detect OS preference via `matchMedia('(prefers-color-scheme: dark)')`
    - Set `data-theme` attribute on `<html>` element
    - Persist manual choice to localStorage, listen for OS changes
    - Handle localStorage unavailability gracefully
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [x] 2.2 Implement LocaleEngine: init(), detectLocale(), setLocale(), translate(), getLocale()
    - Detect browser locale via `navigator.language`, map to en/es/pt
    - Default to 'en' for unsupported locales
    - Translate all elements with `data-i18n` attribute using page-specific `PAGE_TRANSLATIONS`
    - Persist to localStorage
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 2.3 Implement Navigation: init(), toggleMobileMenu(), closeMobileMenu(), trapFocus(), handleScroll()
    - Sticky nav with scrolled class on scroll
    - Mobile hamburger toggle with aria-expanded
    - Focus trap within open mobile menu
    - Smooth scroll to anchor targets
    - Close menu on Escape key and on link click
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  - [x] 2.4 Implement AnimationController: init(), onIntersect(), respectsReducedMotion()
    - Use IntersectionObserver with threshold 0.1
    - Add `animate-in` class on intersection, unobserve after
    - Skip entirely if prefers-reduced-motion is enabled
    - Graceful fallback if IntersectionObserver is unsupported
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  - [x] 2.5 Implement AccessRequestForm: init(), validateField(), validateGitHubUsername(), sanitizeInput(), handleSubmit(), showFieldError()
    - Sanitize inputs by stripping HTML tags
    - Validate email format and GitHub username format client-side
    - Async GitHub API username validation on blur
    - Set aria-invalid on invalid fields with inline error messages
    - Disable submit button and show loading during submission
    - Retain form data on failure
    - _Requirements: 7.3, 7.5, 12.1, 12.2, 12.3, 12.4, 12.5, 3.7_

- [x] 3. Checkpoint - Verify shared assets
  - Ensure styles.css and main.js are complete and self-consistent. Ask the user if questions arise.

- [x] 4. Refactor index.html to use shared assets
  - [x] 4.1 Restructure index.html with semantic HTML5, shared CSS/JS references, and new navbar
    - Remove all inline `<style>` and `<script>` blocks (except page-specific PAGE_TRANSLATIONS)
    - Add `<link rel="stylesheet" href="styles.css">` and `<script src="main.js" defer></script>`
    - Add skip-link, semantic landmarks (nav, main, section, header, footer)
    - Add `data-i18n` attributes to all translatable elements
    - Add `animate-on-scroll` class to sections and cards
    - Add `rel="noopener noreferrer"` to all external `target="_blank"` links
    - Add `loading="lazy"` to certification badge images
    - Add `alt` attributes to all images
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 4.1, 4.2, 4.3, 4.4, 7.2, 13.1, 13.2_
  - [x] 4.2 Add SEO metadata to index.html
    - Add Open Graph meta tags (og:title, og:description, og:image, og:url, og:type)
    - Add canonical URL meta tag
    - Add JSON-LD structured data for Person schema
    - Add CSP meta tag
    - Add preconnect hints for CDN origins
    - Add SRI hashes on external CSS/JS resources (Font Awesome)
    - _Requirements: 7.1, 7.4, 8.1, 8.2, 8.3, 4.5_

- [x] 5. Refactor learning-resources.html to use shared assets
  - [x] 5.1 Restructure learning-resources.html with semantic HTML5, shared CSS/JS, and new navbar
    - Remove inline styles and scripts (keep PAGE_TRANSLATIONS inline)
    - Add shared asset references, skip-link, semantic landmarks, data-i18n attributes
    - Add animate-on-scroll classes, security attributes on external links
    - Add Open Graph, canonical URL, CSP meta tag, preconnect hints, SRI hashes
    - _Requirements: 3.1, 3.6, 4.1, 4.2, 7.1, 7.2, 7.4, 8.1, 8.2, 4.5, 13.1, 13.2_

- [x] 6. Refactor access-request.html to use shared assets
  - [x] 6.1 Restructure access-request.html with semantic HTML5, shared CSS/JS, and new navbar
    - Remove inline styles and scripts (keep PAGE_TRANSLATIONS inline)
    - Add shared asset references, skip-link, semantic landmarks, data-i18n attributes
    - Associate all form inputs with labels using `for` attribute
    - Add aria-describedby for error message containers
    - Add Open Graph, canonical URL, CSP meta tag, preconnect hints, SRI hashes
    - Add `rel="noopener noreferrer"` to external links
    - _Requirements: 3.1, 3.5, 3.6, 4.1, 4.2, 7.1, 7.2, 7.4, 8.1, 8.2, 4.5, 12.1, 13.1, 13.2_

- [x] 7. Create new pages and SEO files
  - [x] 7.1 Create 404.html with Design_System styling, theme/locale support, and navigation links
    - Include error message, home link, and links to main sections
    - Reference shared styles.css and main.js
    - Include PAGE_TRANSLATIONS for error page text
    - _Requirements: 9.1, 9.2, 9.3_
  - [x] 7.2 Create sitemap.xml listing all pages with last-modified dates
    - Include index.html, learning-resources.html, access-request.html, 404.html
    - _Requirements: 8.4_
  - [x] 7.3 Create robots.txt allowing all crawlers and referencing sitemap.xml
    - _Requirements: 8.5_

- [x] 8. Checkpoint - Full site integration verification
  - Ensure all pages load shared styles.css and main.js correctly. Verify theme toggle, locale detection, navigation, and animations work across all pages. Ask the user if questions arise.

- [x] 9. Set up testing infrastructure and write tests
  - [x] 9.1 Set up test infrastructure with fast-check and jsdom
    - Create `tests/` directory with a test runner script
    - Install fast-check as a dev dependency (or use a CDN/local copy for no-build approach)
    - Set up jsdom for DOM simulation in Node.js
    - _Requirements: Testing Strategy_
  - [x] 9.2 Write property test: Locale detection always returns supported language (Property 1)
    - Generate random locale strings, verify detectLocale() always returns 'en', 'es', or 'pt'
    - **Property 1: Locale detection always returns a supported language**
    - **Validates: Requirements 6.1, 6.2**
  - [x] 9.3 Write property test: Theme persistence round-trip (Property 2)
    - Toggle theme, persist, simulate reload via init(), verify same theme applied
    - **Property 2: Theme persistence round-trip**
    - **Validates: Requirements 5.2, 5.3**
  - [x] 9.4 Write property test: Locale persistence round-trip (Property 3)
    - Set locale, persist, simulate reload via init(), verify same locale active
    - **Property 3: Locale persistence round-trip**
    - **Validates: Requirements 6.4, 6.5**
  - [x] 9.5 Write property test: Input sanitization strips all HTML (Property 5)
    - Generate random strings with HTML tags, verify sanitizeInput() output contains no tags
    - **Property 5: Input sanitization strips all HTML**
    - **Validates: Requirements 7.3**
  - [x] 9.6 Write property test: Email validation correctness (Property 6)
    - Generate random strings, verify email validator returns true only for valid formats
    - **Property 6: Email validation correctness**
    - **Validates: Requirements 7.5**
  - [x] 9.7 Write property test: Form validation rejects invalid input and sets accessibility state (Property 9)
    - Generate form states with missing/invalid fields, verify validation returns false and sets aria-invalid
    - **Property 9: Form validation rejects invalid input and sets accessibility state**
    - **Validates: Requirements 3.7, 12.1**
  - [x] 9.8 Write unit tests for HTML structural checks
    - Parse each HTML file and verify: semantic elements present, external links have rel="noopener noreferrer", images have alt attributes, OG meta tags present, canonical URL present, CSP meta tag present, SRI hashes on external resources
    - **Validates: Properties 7, 8 and Requirements 3.1, 3.3, 3.6, 7.1, 7.2, 7.4, 8.1, 8.2**
  - [x] 9.9 Write unit tests for SEO files
    - Verify sitemap.xml lists all pages, robots.txt references sitemap
    - **Validates: Requirements 8.4, 8.5**

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples, structural checks, and edge cases
- The site has no build step — tests run via Node.js scripts independently of the deployed site
