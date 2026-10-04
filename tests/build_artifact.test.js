/**
 * Unit tests for scripts/build_artifact.py
 * Run: npm test
 */
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const SCRIPT = join(REPO_ROOT, "scripts", "build_artifact.py");

let outDir;

before(() => {
  outDir = mkdtempSync(join(tmpdir(), "build-artifact-"));
});

after(() => {
  rmSync(outDir, { recursive: true, force: true });
});

function runBuild(extraEnv = {}) {
  return execFileSync("python3", [SCRIPT, "--out", outDir], {
    cwd: REPO_ROOT,
    env: { ...process.env, ...extraEnv },
    encoding: "utf8",
  });
}

describe("build artifact", () => {
  test("script exists and is executable by python3", () => {
    assert.ok(existsSync(SCRIPT), "scripts/build_artifact.py missing");
  });

  test("produces a deployable index.html", () => {
    runBuild({ BRANCH: "feat/test-branch", SHA: "abc123def456" });
    assert.ok(existsSync(join(outDir, "index.html")), "index.html not copied");
  });

  test("records the branch it was built from", () => {
    runBuild({ BRANCH: "feat/test-branch", SHA: "abc123def456" });
    const meta = JSON.parse(readFileSync(join(outDir, "build-meta.json"), "utf8"));
    assert.equal(meta.branch, "feat/test-branch");
  });

  test("records the source commit sha", () => {
    runBuild({ BRANCH: "main", SHA: "deadbeefcafe" });
    const meta = JSON.parse(readFileSync(join(outDir, "build-meta.json"), "utf8"));
    assert.equal(meta.sha, "deadbeefcafe");
  });

  test("stamps an ISO-8601 UTC build time", () => {
    runBuild({ BRANCH: "main", SHA: "x" });
    const meta = JSON.parse(readFileSync(join(outDir, "build-meta.json"), "utf8"));
    assert.match(meta.build_time, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  test("copied index.html is byte-identical to the source", () => {
    runBuild({ BRANCH: "main", SHA: "x" });
    const src = readFileSync(join(REPO_ROOT, "index.html"));
    const out = readFileSync(join(outDir, "index.html"));
    assert.equal(src.length, out.length, "copied file size differs from source");
    assert.ok(src.equals(out), "copied file is not byte-identical");
  });

  test("rebuilds cleanly over an existing output directory", () => {
    runBuild({ BRANCH: "first", SHA: "1" });
    runBuild({ BRANCH: "second", SHA: "2" });
    const meta = JSON.parse(readFileSync(join(outDir, "build-meta.json"), "utf8"));
    assert.equal(meta.branch, "second");
  });
});
