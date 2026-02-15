# Project Structure

```
cloud-devops-labs-index/
├── index.html                  # Main website (portfolio + lab index)
├── access-request.html         # Repository access request form page
├── styles.css                  # Shared CSS (exists but not currently linked from HTML)
├── index.json                  # Conversation history / metadata (not part of the site)
├── learning-resources.html     # Learning resources page
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── access-request.yml  # Structured issue template for access requests
│   └── workflows/
│       ├── deploy-pages.yml    # GitHub Pages deployment (on push to main)
│       └── access-request.yml  # Access request processing automation
├── docs/
│   ├── README.md               # Project documentation
│   ├── website-architecture.md # Architecture and technical details
│   └── diagrams/               # Python diagrams (using `diagrams` package)
│       ├── *.py                # Diagram source files
│       └── generated-diagrams/ # Generated PNG diagram outputs
└── .kiro/
    └── steering/               # AI assistant steering rules
```

## Key Patterns
- Each HTML page is self-contained: styles and scripts are inline, not in external files
- Both `index.html` and `access-request.html` duplicate the CSS variable definitions and theme/language logic
- The `docs/` folder is documentation-only and not served as part of the website
- Diagrams are generated from Python scripts using the `diagrams` package and committed as PNGs
- `index.json` is a conversation log artifact, not application data
