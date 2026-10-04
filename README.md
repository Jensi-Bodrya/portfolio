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

### Feature branch previews

Pushing to any branch other than `main` triggers **Preview & dev-2**, which:

1. Builds a traceable site artifact via `scripts/build_artifact.py` — the
   artifact carries the source branch, commit sha, and build timestamp in
   `build-meta.json`.
2. Deploys that artifact to a preview domain derived from the branch name
   (`feat/nav-spacing` becomes `jensi-bodrya-feat-nav-spacing.surge.sh`).
3. Verifies the deployment returns HTTP 200 and writes the URL to the run summary.

### dev-2 testing environment

`dev-2` is a scratch environment for checking a specific change in isolation.
Run the **Preview & dev-2** workflow manually and set `source_branch`:

- `source_branch: main` — deploy the current `main` build to dev-2.
- `source_branch: feat/some-branch` — deploy that feature branch's build to
  dev-2, so the exact changes in that branch can be reviewed live before merge.

The build artifact's `build-meta.json` is printed in the job log, so it is
always possible to confirm which branch and commit dev-2 is serving.

### Local preview

```bash
npm run serve
```

## Build artifact

```bash
python3 scripts/build_artifact.py --out build
```

Creates `build/` containing the deployable site plus `build-meta.json`:

```json
{
  "branch": "feat/example",
  "sha": "abc123...",
  "build_time": "2026-10-04T17:31:42Z",
  "files": ["index.html"]
}
```
