# Tech Stack

## Frontend
- HTML5 (semantic markup)
- CSS3 with CSS custom properties (variables) for theming
- Vanilla JavaScript (no frameworks or bundlers)
- Font Awesome 6.0.0 via CDN for icons

## Hosting & Deployment
- GitHub Pages (static site)
- Automatic deployment via `.github/workflows/deploy-pages.yml` on push to `main`
- No build step — the repo root is deployed as-is

## Automation
- GitHub Actions for:
  - Page deployment (`deploy-pages.yml`)
  - Access request processing (`access-request.yml`) — parses issues, adds collaborators
- GitHub Issue Templates (YAML-based) for structured access requests

## Styling Conventions
- CSS variables defined in `:root` for theming (light and dark mode)
- Styles are currently inline in each HTML file via `<style>` tags (a `styles.css` exists but is not linked)
- Dark mode uses `.dark-mode` class on `<body>`, toggled via JS
- Responsive breakpoints: 768px (tablet), 480px (mobile)

## JavaScript Conventions
- All JS is inline in HTML files (no external JS files)
- Translation data stored as JS objects within each page
- localStorage used for theme and language persistence
- GitHub API called client-side for username validation in access request form

## Common Commands
No build/test/compile commands — this is a static site with no build tooling. To preview locally, use any static file server:
```bash
# Python
python3 -m http.server 8000

# Node (if npx available)
npx serve .
```
