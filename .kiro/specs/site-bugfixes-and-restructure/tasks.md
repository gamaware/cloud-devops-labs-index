# Implementation Plan: Site Bugfixes and Restructure

## Overview

Fix bugs on index.html first (theme toggle icon, language switcher, resume button, certification badge, broken links), then restructure learning-resources.html from medium-based to creator-based layout with tab switching and tag filtering. All changes target `styles.css`, `main.js`, `index.html`, `learning-resources.html`, `access-request.html`, and `404.html`.

## Tasks

- [ ] 1. Fix theme toggle icon sync
  - [ ] 1.1 Add `_updateIcon()` helper to ThemeEngine in `main.js`
    - Add a private `_updateIcon(theme)` function that finds `.navbar__theme-toggle i` and swaps between `fa-moon` (light) and `fa-sun` (dark)
    - Call `_updateIcon` at the end of `toggle()` and at the end of `init()`
    - Update all HTML pages (index.html, learning-resources.html, access-request.html, 404.html) if needed to ensure the icon `<i>` element is present
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 1.2 Write property test for theme toggle icon sync
    - **Property 1: Theme toggle icon reflects current theme**
    - **Validates: Requirements 1.3**

- [ ] 2. Fix language switcher functionality
  - [ ] 2.1 Add `_updateActiveButton()` to LocaleEngine in `main.js`
    - Add a private `_updateActiveButton(locale)` function that sets `.active` class on the matching `.navbar__lang-btn` and removes it from others
    - Call `_updateActiveButton` at the end of `setLocale()` and at the end of `init()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ]* 2.2 Write property tests for locale engine
    - **Property 2: Translation applies to all data-i18n elements**
    - **Property 3: Locale persistence round-trip**
    - **Property 4: Active language button matches current locale**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 3. Fix View Resume button permanent highlight
  - [ ] 3.1 Add `:visited` style for `.btn--primary` in `styles.css`
    - Add `.btn--primary:visited` rule that resets background-color and color to match the default state
    - Ensure `:focus` (non-visible) does not persist highlight — only `:focus-visible` should show the ring
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Fix certification badge display and audit links
  - [ ] 4.1 Verify and update Terraform badge Credly image URL in `index.html`
    - Check if the current URL `https://images.credly.com/size/340x340/images/99289602-861e-4929-8277-773e63a2fa6f/image.png` resolves correctly
    - If broken, find the current valid Credly badge URL for HashiCorp Terraform Associate (003) and update
    - Ensure all badge `<img>` elements have meaningful `alt` text
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ] 4.2 Audit and fix all links on index.html and learning-resources.html
    - Scan all external links (Credly badges, GitHub repos, Discord, Medium, ITESO, alexgarcia.info, all learning resource URLs)
    - Update or remove any links that return 404 or redirect to dead pages
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ]* 4.3 Write property test for badge alt text
    - **Property 5: All certification badge images have meaningful alt text**
    - **Validates: Requirements 4.2**

- [ ] 5. Checkpoint — Verify all index.html bug fixes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Add tab system and tag filter modules to main.js
  - [ ] 6.1 Implement `TabSystem` module in `main.js`
    - Add the `TabSystem` IIFE module with `init()` and `activateTab(tabId)` functions
    - Tab click handler reads `data-tab` attribute, toggles `.active` class on buttons and `.tab-content` panels
    - Call `TabSystem.init()` in the `DOMContentLoaded` handler
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ] 6.2 Implement `TagFilter` module in `main.js`
    - Add the `TagFilter` IIFE module with `init()`, `getActiveTag()`, and `reset()` functions
    - Click handler on `.tag-filters` container reads `data-tag`, toggles active state, filters `.creator-card` elements by `data-tags` attribute within the active `.tab-content`
    - Clicking an active tag deselects it and shows all cards
    - Call `TagFilter.init()` in the `DOMContentLoaded` handler
    - Integrate with `TabSystem` so that switching tabs resets the active tag filter
    - _Requirements: 7.2, 7.3, 7.4, 8.4_
  - [ ]* 6.3 Write property tests for tab system
    - **Property 11: Tab switching shows correct content**
    - **Validates: Requirements 8.1, 8.3**
  - [ ]* 6.4 Write property tests for tag filtering
    - **Property 9: Tag filtering shows only matching cards**
    - **Property 10: Tag filter toggle restores all cards**
    - **Property 12: Tab state preserved during tag filtering**
    - **Validates: Requirements 7.2, 7.3, 8.4**

- [ ] 7. Add CSS for tabs, creator cards, platform cards, and tag filters to styles.css
  - [ ] 7.1 Add tab system styles to `styles.css`
    - Style `.resources-tabs` container, `.tab-btn` buttons (default, hover, active states)
    - Style `.tab-content` panels (hidden by default, visible when `.active`)
    - Ensure responsive behavior at 768px and 480px breakpoints
    - _Requirements: 8.1, 8.3, 10.1, 10.3_
  - [ ] 7.2 Add creator card styles to `styles.css`
    - Style `.creator-card` with name, platform icons row, and topic tags
    - Style `.creator-card__platforms` with inline icon links (globe, YouTube, LinkedIn)
    - Style `.resources-grid` for the card grid layout
    - Ensure dark/light theme support via CSS variables
    - _Requirements: 6.2, 10.1, 10.2_
  - [ ] 7.3 Add platform card styles to `styles.css`
    - Style `.platform-card` with a visually distinct appearance from `.creator-card` (e.g., horizontal layout, prominent icon, different border/background treatment)
    - Ensure consistency with the design system (same CSS variables, spacing, typography)
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 7.4 Add tag filter styles to `styles.css`
    - Style `.tag-filters` container and `.tag-filter-btn` buttons (default, hover, active states)
    - Reuse `.skill-tag` styling patterns for consistency
    - _Requirements: 7.1, 7.2_

- [ ] 8. Restructure learning-resources.html content
  - [ ] 8.1 Rewrite Cloud Computing tab with creator-based cards
    - Deduplicate creators (e.g., TechWorld with Nana, Rishab Kumar, Adrian Cantrill appear in Websites, YouTube, and LinkedIn — consolidate into one card each)
    - Each creator card has inline platform icons (globe, YouTube, LinkedIn) and topic tags
    - Add `data-tags` attributes to each card for filtering
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1_
  - [ ] 8.2 Rewrite DevOps tab with creator-based cards
    - Same deduplication and card structure as Cloud tab
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1_
  - [ ] 8.3 Rewrite Spanish Content tab with creator-based cards
    - Same deduplication and card structure
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1_
  - [ ] 8.4 Rewrite Independent Resources tab with platform cards
    - Use `.platform-card` class instead of `.creator-card`
    - Each platform gets a distinct card with icon, name, description, and link
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 8.5 Add tag filter bar to learning-resources.html
    - Add a `.tag-filters` container with buttons for each topic tag (AWS, Kubernetes, Docker, Terraform, CI/CD, System Design, Linux, Azure, GCP)
    - Place between the tab buttons and the tab content
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 8.6 Write property tests for creator card structure
    - **Property 6: No duplicate creators within a category tab**
    - **Property 7: Creator card completeness**
    - **Property 8: Platform links open in new tab**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 7.1**

- [ ] 9. Final checkpoint — Verify all changes
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Bug fixes (tasks 1-4) should be completed before the restructure (tasks 6-8)
- Property tests validate universal correctness properties using `fast-check`
- Unit tests validate specific examples and edge cases
