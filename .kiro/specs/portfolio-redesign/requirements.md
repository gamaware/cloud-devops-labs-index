# Requirements Document

## Introduction

This document defines the requirements for a complete professional redesign of the Cloud DevOps Labs Index portfolio website (gamaware.github.io/cloud-devops-labs-index). The site serves as a professional portfolio for Alex Garcia (DevOps Consultant, Cloud Architect, Professor at ITESO) and as the central hub for Cloud DevOps Labs (100–400 level). The redesign aims to project credibility, technical depth, and professionalism through a cohesive design system, while improving accessibility, performance, security, SEO, and user experience across all pages (index.html, learning-resources.html, access-request.html, 404.html).

## Glossary

- **Site**: The complete portfolio website hosted on GitHub Pages at gamaware.github.io/cloud-devops-labs-index
- **Design_System**: The unified set of CSS custom properties, typography scales, spacing tokens, color palettes, and reusable component styles that govern the visual appearance of the Site
- **Theme_Engine**: The JavaScript module responsible for detecting OS color scheme preference via `prefers-color-scheme`, applying the corresponding light or dark theme, and allowing manual override with localStorage persistence
- **Locale_Engine**: The JavaScript module responsible for detecting the user's browser locale via `navigator.language`, selecting the appropriate language (EN, ES, or PT), and rendering all translatable content accordingly
- **Navigation**: The sticky top navigation bar present on all pages, including site links, and a mobile hamburger menu
- **Lab_Card**: A UI component displaying a lab repository level (100–400), description, technology tags, and a link to the repository or access request form
- **Access_Request_Form**: The form on access-request.html that collects user information and creates a GitHub Issue for repository access
- **Animation_Controller**: The JavaScript module that manages scroll-triggered entrance animations using the Intersection Observer API
- **Page**: Any individual HTML document served by the Site (index.html, learning-resources.html, access-request.html, 404.html)

## Requirements

### Requirement 1: Cohesive Design System

**User Story:** As a site visitor, I want the website to have a consistent, professional visual identity across all pages, so that the site feels polished and credible.

#### Acceptance Criteria

1. THE Design_System SHALL define a color palette, typography scale, spacing tokens, border radii, and shadow values as CSS custom properties in a shared stylesheet
2. WHEN any Page is loaded, THE Design_System SHALL apply consistent visual styling for headers, body text, links, buttons, cards, and form elements
3. THE Design_System SHALL define separate sets of CSS custom property values for light theme and dark theme
4. WHEN the Site is viewed on different pages, THE Design_System SHALL produce a visually unified experience with no inconsistencies in color, typography, or spacing

### Requirement 2: Responsive Layout

**User Story:** As a site visitor on any device, I want the website to adapt to my screen size, so that content is readable and usable on desktop, tablet, and mobile.

#### Acceptance Criteria

1. THE Site SHALL use a mobile-first responsive layout with breakpoints at 480px, 768px, and 1024px
2. WHEN the viewport width is below 768px, THE Navigation SHALL collapse into a hamburger menu with an accessible toggle button
3. WHEN the viewport width is below 480px, THE Site SHALL stack all grid layouts into a single column and adjust font sizes for readability
4. THE Site SHALL render all content without horizontal scrolling at any viewport width between 320px and 2560px

### Requirement 3: Accessibility Compliance

**User Story:** As a site visitor using assistive technology, I want the website to follow accessibility standards, so that I can navigate and understand all content.

#### Acceptance Criteria

1. THE Site SHALL use semantic HTML5 elements (nav, main, section, article, header, footer) to structure all pages
2. THE Site SHALL ensure all interactive elements (links, buttons, form inputs) are keyboard-navigable with visible focus indicators
3. THE Site SHALL provide text alternatives (alt attributes) for all non-decorative images
4. THE Design_System SHALL maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text in both light and dark themes
5. THE Access_Request_Form SHALL associate all form inputs with labels using the `for` attribute and provide descriptive error messages
6. THE Site SHALL include ARIA landmarks (role attributes or semantic elements) and skip-navigation links on all pages
7. WHEN form validation fails, THE Access_Request_Form SHALL display inline error messages adjacent to the invalid field and set `aria-invalid` on the input

### Requirement 4: Performance Optimization

**User Story:** As a site visitor, I want the website to load quickly, so that I can access content without delay.

#### Acceptance Criteria

1. THE Site SHALL load all CSS from a single shared external stylesheet linked in the `<head>` of each Page, eliminating duplicated inline styles
2. THE Site SHALL load all JavaScript from a single shared external script file, eliminating duplicated inline scripts
3. THE Site SHALL use `loading="lazy"` on all images below the fold
4. THE Site SHALL minimize render-blocking resources by deferring non-critical JavaScript with the `defer` attribute
5. THE Site SHALL use preconnect hints for external CDN origins (cdnjs.cloudflare.com, images.credly.com)

### Requirement 5: Dark and Light Theme

**User Story:** As a site visitor, I want the website theme to match my operating system preference automatically, so that the experience feels native and comfortable.

#### Acceptance Criteria

1. WHEN a visitor loads the Site for the first time, THE Theme_Engine SHALL detect the OS color scheme preference using `prefers-color-scheme` and apply the matching theme
2. WHEN a visitor manually toggles the theme, THE Theme_Engine SHALL persist the choice in localStorage and apply the selected theme
3. WHEN a visitor who previously selected a manual theme returns, THE Theme_Engine SHALL apply the stored preference from localStorage
4. WHEN the OS color scheme changes while the Site is open and no manual override exists, THE Theme_Engine SHALL update the theme in real time
5. THE Theme_Engine SHALL apply the theme without a visible flash of unstyled or wrong-themed content on page load

### Requirement 6: Automatic Localization

**User Story:** As a site visitor, I want the website to display content in my language automatically based on my browser locale, so that I can read the site without manually selecting a language.

#### Acceptance Criteria

1. WHEN a visitor loads the Site for the first time, THE Locale_Engine SHALL detect the browser locale using `navigator.language` and select the closest supported language (EN, ES, or PT)
2. WHEN the detected locale does not match any supported language, THE Locale_Engine SHALL default to English (EN)
3. THE Locale_Engine SHALL translate all visible text content on the Page, including navigation labels, headings, body text, button labels, form labels, and footer text
4. WHEN a visitor navigates between pages, THE Locale_Engine SHALL maintain the same language selection consistently
5. THE Locale_Engine SHALL store the resolved language in localStorage so that subsequent visits use the same language

### Requirement 7: Frontend Security

**User Story:** As the site owner, I want the website to follow frontend security best practices, so that visitors are protected from common web vulnerabilities.

#### Acceptance Criteria

1. THE Site SHALL include a Content Security Policy meta tag that restricts script and style sources to self and approved CDN origins
2. THE Site SHALL add `rel="noopener noreferrer"` to all external links that use `target="_blank"`
3. THE Access_Request_Form SHALL sanitize all user inputs before using them in DOM manipulation or URL construction
4. THE Site SHALL use Subresource Integrity (SRI) hashes on all externally loaded CSS and JavaScript resources
5. THE Access_Request_Form SHALL validate the email field format and GitHub username field format on the client side before submission

### Requirement 8: SEO and Metadata

**User Story:** As the site owner, I want the website to be discoverable by search engines and display rich previews when shared, so that the site reaches a wider audience.

#### Acceptance Criteria

1. THE Site SHALL include Open Graph meta tags (og:title, og:description, og:image, og:url, og:type) on every Page
2. THE Site SHALL include a canonical URL meta tag on every Page
3. THE Site SHALL include structured data (JSON-LD) for a Person schema on index.html with name, job title, employer, and social profile links
4. THE Site SHALL provide a sitemap.xml file listing all pages with last-modified dates
5. THE Site SHALL provide a robots.txt file that allows all crawlers and references the sitemap.xml

### Requirement 9: Custom 404 Page

**User Story:** As a site visitor who navigates to a non-existent URL, I want to see a helpful error page, so that I can find my way back to valid content.

#### Acceptance Criteria

1. WHEN a visitor navigates to a non-existent URL, THE Site SHALL display a custom 404.html page styled consistently with the Design_System
2. THE 404 Page SHALL include a clear error message, a link to the home page, and links to main site sections
3. THE 404 Page SHALL apply the current theme and locale settings from the Theme_Engine and Locale_Engine

### Requirement 10: Sticky Navigation and Mobile Menu

**User Story:** As a site visitor, I want a persistent navigation bar that stays visible as I scroll, so that I can quickly jump to different sections or pages.

#### Acceptance Criteria

1. THE Navigation SHALL remain fixed at the top of the viewport when the user scrolls down on any Page
2. THE Navigation SHALL include links to all main sections of index.html (About, Experience, Certifications, Labs) and to other pages (Learning Resources, Access Request)
3. WHEN the viewport width is below 768px, THE Navigation SHALL display a hamburger icon button that toggles a mobile menu overlay
4. WHEN the mobile menu is open, THE Navigation SHALL trap keyboard focus within the menu until the menu is closed
5. WHEN a navigation link is clicked on the same page, THE Site SHALL smooth-scroll to the target section

### Requirement 11: Scroll Animations

**User Story:** As a site visitor, I want subtle entrance animations as I scroll through the page, so that the experience feels polished and engaging.

#### Acceptance Criteria

1. WHEN a section or card element enters the viewport, THE Animation_Controller SHALL apply a fade-in and slide-up entrance animation
2. THE Animation_Controller SHALL use the Intersection Observer API to trigger animations only when elements become visible
3. WHEN the user has enabled `prefers-reduced-motion`, THE Animation_Controller SHALL disable all animations and display content immediately
4. THE Animation_Controller SHALL apply animations only once per element per page load

### Requirement 12: Access Request Form Improvements

**User Story:** As a visitor requesting lab access, I want a reliable and user-friendly form experience, so that I can submit my request with confidence.

#### Acceptance Criteria

1. THE Access_Request_Form SHALL validate all required fields (name, email, GitHub username, repository, reason) before allowing submission
2. WHEN the GitHub username field loses focus, THE Access_Request_Form SHALL validate the username against the GitHub API and display inline feedback
3. WHEN the form is submitted successfully, THE Access_Request_Form SHALL display a success confirmation message and hide the form
4. IF the form submission fails, THEN THE Access_Request_Form SHALL display a descriptive error message and retain all entered data
5. THE Access_Request_Form SHALL disable the submit button and show a loading indicator during submission

### Requirement 13: Shared Code Architecture

**User Story:** As a developer maintaining the site, I want all shared styles and scripts in external files, so that changes propagate across all pages without duplication.

#### Acceptance Criteria

1. THE Site SHALL use a single external CSS file (styles.css) linked from all pages, containing the Design_System and all shared component styles
2. THE Site SHALL use a single external JavaScript file (main.js) loaded from all pages, containing the Theme_Engine, Locale_Engine, Animation_Controller, and Navigation logic
3. WHEN a style or behavior change is made in the shared files, THE change SHALL apply to all pages without requiring edits to individual HTML files
4. THE Site SHALL keep page-specific content (HTML structure, translation data) within each HTML file while referencing shared assets
