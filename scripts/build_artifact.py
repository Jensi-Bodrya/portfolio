#!/usr/bin/env python3
"""Create a deployable build artifact for the portfolio site.

Copies the static site into ./build and stamps it with the branch and commit
that produced it, so any deployed environment can be traced back to a source
revision.

Usage:
    python3 scripts/build_artifact.py [--out build]

Environment:
    BRANCH  branch name to record (defaults to CI env or "local")
    SHA     commit sha to record (defaults to CI env or "unknown")
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PAYLOAD = ["index.html"]


def detect_branch() -> str:
    for key in ("BRANCH", "GITHUB_HEAD_REF", "GITHUB_REF_NAME"):
        value = os.environ.get(key)
        if value:
            return value
    try:
        return subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, check=True, cwd=REPO_ROOT,
        ).stdout.strip()
    except Exception:
        return "local"


def detect_sha() -> str:
    value = os.environ.get("SHA") or os.environ.get("GITHUB_SHA")
    if value:
        return value
    try:
        return subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True, text=True, check=True, cwd=REPO_ROOT,
        ).stdout.strip()
    except Exception:
        return "unknown"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default="build", help="output directory")
    args = parser.parse_args()

    out_dir = (REPO_ROOT / args.out).resolve()
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    copied = []
    for name in PAYLOAD:
        src = REPO_ROOT / name
        if not src.exists():
            print(f"ERROR: required file missing: {name}", file=sys.stderr)
            return 1
        shutil.copy2(src, out_dir / name)
        copied.append(name)

    meta = {
        "branch": detect_branch(),
        "sha": detect_sha(),
        "build_time": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "files": copied,
    }
    (out_dir / "build-meta.json").write_text(json.dumps(meta, indent=2) + "\n")

    print(f"build artifact ready in {out_dir}")
    for key, value in meta.items():
        print(f"  {key}: {value}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
