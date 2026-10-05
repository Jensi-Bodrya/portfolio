#!/usr/bin/env python3
"""Build a deterministic deployment artifact from the portfolio source."""
from __future__ import annotations
import argparse, json, os, shutil, subprocess
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {".git", "node_modules", "build", "dist", ".github", "tests", "scripts"}

def slugify(branch: str) -> str:
    import re
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", branch.strip().lower()).strip("-"))[:40].strip("-")

def get_sha() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="build")
    args = parser.parse_args()
    dest = Path(args.out).resolve()
    if dest.exists(): shutil.rmtree(dest)
    dest.mkdir(parents=True)
    copied = []
    for path in sorted(ROOT.rglob("*")):
        rel = path.relative_to(ROOT)
        if not path.is_file() or any(p in EXCLUDED for p in rel.parts) or path.resolve().is_relative_to(dest):
            continue
        target = dest / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        copied.append(rel.as_posix())
    branch = os.getenv("BRANCH", os.getenv("GITHUB_REF_NAME", "local"))
    sha = os.getenv("SHA", os.getenv("GITHUB_SHA", get_sha()))
    metadata = {"branch": branch, "sha": sha,
                "build_time": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "files": copied}
    (dest / "build-meta.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Built {len(copied)} files into {dest}; branch={branch} sha={sha}")

if __name__ == "__main__": main()
