# Jensi Bodrya — Portfolio

[![CI](https://github.com/Jensi-Bodrya/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Jensi-Bodrya/portfolio/actions/workflows/ci.yml)

Personal portfolio site for **Jensi Bodrya**, Full Stack Software Engineer.

Live: https://jensi-bodrya.surge.sh
Dev: https://jensi-bodrya-dev.surge.sh

## Stack

Static single-page site — plain HTML, CSS, and vanilla JavaScript. No build step.

## Tests

30 unit tests run against the real DOM using `jsdom`, covering document
structure, navigation wiring, link safety, project data, stat counters,
accessibility, and page-weight budgets.

```bash
npm ci
npm test
```

## CI/CD

Every pull request to `main` runs five required checks:

| Check | Tool | What it enforces |
|---|---|---|
| Unit Tests | node:test + jsdom | 30 assertions on DOM, links, a11y |
| HTML Validation | html5validator | Valid HTML5 markup |
| Broken Link Check | lychee | No dead internal or external links |
| Secret Scanning | trufflehog | No committed credentials |
| Code Quality | shell checks | Required markup, page-size budget |

Merging to `main` requires **all five checks green** plus **one approving
review**. On merge, the site is automatically deployed to the dev environment
on Surge.

## Local preview

```bash
npm run serve
```
