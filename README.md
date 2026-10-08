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
| Unit Tests | node:test + jsdom | DOM, links, a11y, and build-artifact assertions |
| HTML Validation | html5validator | Valid HTML5 markup |
| Broken Link Check | lychee | No dead internal or external links |
| Secret Scanning | trufflehog | No committed credentials |
| Code Quality | shell checks | Required markup, page-size budget |

Merging to `main` requires **all five checks green** plus **one approving
review**. Merging is done manually — auto-merge is disabled, so the merge
button only unlocks once every rule is satisfied.

### Environments

| Environment | Branch | URL | Trigger |
|---|---|---|---|
| Production | `main` | https://jensi-bodrya.surge.sh | manual publish |
| Dev | `main` | https://jensi-bodrya-dev.surge.sh | automatic on merge to `main` |
| Dev-2 | `main` **or** any feature branch | https://jensi-bodrya-dev2.surge.sh | manual (`workflow_dispatch`) |
| Feature preview | one per branch | https://jensi-bodrya-&lt;branch-slug&gt;.surge.sh | automatic on push to that branch |

### Feature branch builds and deployment

Each feature-branch push runs **Store build image**: it builds the site and publishes an immutable OCI image to `ghcr.io/jensi-bodrya/portfolio-images:<branch-slug>-<sha7>`. Source branch and commit SHA are attached as OCI metadata.

The separate [portfolio-deploy chart repo](https://github.com/Jensi-Bodrya/portfolio-deploy) is the source of truth for all environment image pins and deployment. Run its **Deploy environment** workflow, select `dev`, `dev-2`, or `prod`, and provide the exact OCI image ref. For `dev-2`, choose any image built from `main` or a feature branch. The workflow pulls that image from GHCR, deploys the site to the selected Surge domain, verifies HTTP 200, and records the image pin.

Preview deploys remain branch-specific; image creation and all environment deployments are driven through the chart repo / GHCR image flow.

### Local preview

```bash
npm run serve
```

## Build artifact

```bash
python3 scripts/build_artifact.py --out build
```

Creates `build/` containing the deployable site plus `build-meta.json`.

```json
{
  "branch": "feat/example",
  "sha": "abc123...",
  "build_time": "2026-10-04T17:31:42Z",
  "files": ["index.html"]
}
```
