# Requirements Document

## Introduction

This specification covers bug fixes on `index.html` and a structural overhaul of `learning-resources.html` for the Cloud DevOps Labs Index static site. The bugs include a broken theme toggle icon, non-functional language switcher buttons, a permanently highlighted "View Resume" button, a missing certification badge image, and potentially broken links. The restructure transforms the learning resources page from a medium-based layout (Websites / YouTube / LinkedIn) to a creator-based layout with deduplication, topic tag filtering, and a distinct card style for platform-type independent resources.

## Glossary

- **Site**: The Cloud DevOps Labs Index static website deployed on GitHub Pages
- **Theme_Toggle**: The navbar button that switches between light and dark themes
- **ThemeEngine**: The JavaScript module that manages theme state, persistence, and toggling
- **LocaleEngine**: The JavaScript module that manages language detection, persistence, and page translation
- **Language_Buttons**: The EN/ES/PT buttons in the navbar that trigger locale changes
- **Creator_Card**: A card component on the learning resources page representing a single content creator with inline platform icons
- **Platform_Card**: A visually distinct card component for independent learning platforms (e.g., Udemy, Coursera, AWS Skill Builder)
- **Topic_Tag**: A clickable label (e.g., AWS, Kubernetes, Docker) used to filter creator cards by subject area
- **Tab_System**: The category tab navigation (Cloud, DevOps, Spanish, Independent) on the learning resources page
- **Font_Awesome**: The icon library (v6.0.0) loaded via CDN used for icons across the site

## Requirements

### Requirement 1: Theme Toggle Icon

**User Story:** As a visitor, I want to see a visible sun/moon icon on the theme toggle button, so that I can identify and use the dark/light mode switch.

#### Acceptance Criteria

1. WHEN the Site loads in light mode, THE Theme_Toggle SHALL display a moon icon indicating dark mode is available
2. WHEN the Site loads in dark mode, THE Theme_Toggle SHALL display a sun icon indicating light mode is available
3. WHEN a visitor clicks the Theme_Toggle, THE ThemeEngine SHALL switch the theme and THE Theme_Toggle SHALL update the icon to reflect the new available mode
4. THE Theme_Toggle icon SHALL be visible and correctly rendered in both light and dark themes

### Requirement 2: Language Switcher Functionality

**User Story:** As a visitor, I want the language buttons (EN/ES/PT) to translate the page content when clicked, so that I can read the site in my preferred language.

#### Acceptance Criteria

1. WHEN a visitor clicks a Language_Button, THE LocaleEngine SHALL translate all elements with data-i18n attributes to the selected language
2. WHEN a visitor clicks a Language_Button, THE LocaleEngine SHALL persist the selected locale to localStorage
3. WHEN the Site loads with a previously stored locale, THE LocaleEngine SHALL apply that locale and translate the page automatically
4. WHEN a Language_Button is active, THE Site SHALL visually highlight the active language button to indicate the current selection
5. THE Language_Buttons SHALL function correctly on all pages (index.html, learning-resources.html, access-request.html)

### Requirement 3: View Resume Button Styling

**User Story:** As a visitor, I want the "View Resume" button to appear in its normal state by default, so that it only shows a highlight effect on actual hover, focus, or active interaction.

#### Acceptance Criteria

1. THE Site SHALL render the "View Resume" button in its default (non-highlighted) style when no user interaction is occurring
2. WHEN a visitor hovers over the "View Resume" button, THE Site SHALL apply the hover highlight style
3. WHEN the "View Resume" button receives keyboard focus, THE Site SHALL apply the focus indicator style
4. THE "View Resume" button default style SHALL be visually distinct from its hover and focus states

### Requirement 4: Certification Badge Display

**User Story:** As a visitor, I want to see all certification badges including the HashiCorp Terraform Associate badge, so that I can view the complete set of credentials.

#### Acceptance Criteria

1. THE Site SHALL display the HashiCorp Terraform Associate certification badge image correctly
2. IF a certification badge image fails to load, THEN THE Site SHALL display meaningful alt text for the badge
3. THE Site SHALL use valid, current Credly image URLs for all certification badges

### Requirement 5: Link Integrity

**User Story:** As a visitor, I want all links on the site to point to valid destinations, so that I do not encounter broken pages or 404 errors.

#### Acceptance Criteria

1. THE Site SHALL ensure all external links on index.html (Credly badges, GitHub repos, Discord, Medium, ITESO, alexgarcia.info) resolve to valid, non-404 destinations
2. THE Site SHALL ensure all external links on learning-resources.html resolve to valid, non-404 destinations
3. IF a link is found to be broken or returning a 404, THEN THE Site SHALL update or remove the link

### Requirement 6: Creator-Based Resource Layout

**User Story:** As a visitor, I want the learning resources page organized by creator rather than by medium, so that I can see all of a creator's platforms in one place without duplication.

#### Acceptance Criteria

1. WHEN a visitor views a category tab (Cloud, DevOps, Spanish), THE Site SHALL display one Creator_Card per unique creator within that category
2. THE Creator_Card SHALL display the creator name and inline platform icons (globe for website, YouTube icon, LinkedIn icon) linking to the respective platform URLs
3. THE Site SHALL not duplicate any creator across multiple cards within the same category tab
4. WHEN a visitor clicks a platform icon on a Creator_Card, THE Site SHALL open the corresponding URL in a new tab

### Requirement 7: Topic Tag Filtering

**User Story:** As a visitor, I want to filter creators by topic tags (AWS, Kubernetes, Docker, Terraform, CI/CD, System Design, Linux, Azure, GCP), so that I can find resources relevant to my learning goals.

#### Acceptance Criteria

1. THE Creator_Card SHALL display one or more Topic_Tags indicating the creator's subject areas
2. WHEN a visitor clicks a Topic_Tag filter, THE Site SHALL show only Creator_Cards that include the selected tag within the active category tab
3. WHEN a visitor clicks the active Topic_Tag filter again, THE Site SHALL remove the filter and show all Creator_Cards in the active tab
4. THE Topic_Tag filtering SHALL operate client-side without page reloads

### Requirement 8: Tab System Functionality

**User Story:** As a visitor, I want the category tabs (Cloud, DevOps, Spanish, Independent) to switch displayed content when clicked, so that I can browse resources by category.

#### Acceptance Criteria

1. WHEN a visitor clicks a tab button, THE Tab_System SHALL display the corresponding tab content and hide all other tab contents
2. WHEN the page loads, THE Tab_System SHALL display the first tab (Cloud Computing) as active by default
3. THE Tab_System SHALL visually indicate which tab is currently active
4. THE Tab_System SHALL preserve the active tab state when topic tag filters are applied

### Requirement 9: Independent Resources Distinct Styling

**User Story:** As a visitor, I want the Independent Resources section to look visually different from creator cards, so that I can distinguish platforms (Udemy, Coursera, AWS Skill Builder) from individual content creators.

#### Acceptance Criteria

1. WHEN a visitor views the Independent tab, THE Site SHALL render Platform_Cards with a visually distinct style from Creator_Cards
2. THE Platform_Card SHALL clearly communicate that the resource is a platform or organization rather than an individual creator
3. THE Platform_Card style SHALL be consistent with the overall Site design system (using the same CSS variables, spacing, and typography)

### Requirement 10: Design Consistency

**User Story:** As a visitor, I want the learning resources page to share the same design system as the rest of the site, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE learning-resources.html page SHALL use the shared styles.css design tokens (CSS variables for colors, spacing, typography, shadows, radii)
2. THE learning-resources.html page SHALL support dark and light themes via the ThemeEngine
3. THE learning-resources.html page SHALL support the responsive breakpoints (768px tablet, 480px mobile) defined in the design system
4. THE learning-resources.html page SHALL support i18n translation via the LocaleEngine and PAGE_TRANSLATIONS object
