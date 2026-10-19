#!/usr/bin/env python3
"""Does a newer version really fix an advisory?

Usage: python3 -I advisory-check.py <GHSA-or-CVE-id> <npm-package> [candidate-version]

Prints the advisory's ranges as OSV records them, its publication date and, for a candidate
version, its release date and a verdict hint. A range that ends with `last_affected` (`<= X`)
names no fix: a later version is outside the range but may carry the same defect.
Standard library only; reads https://api.osv.dev and https://registry.npmjs.org.
"""

import json
import sys
import urllib.parse
import urllib.request


def get_json(url: str) -> dict:
    with urllib.request.urlopen(url, timeout=30) as response:  # noqa: S310 (fixed hosts)
        return json.load(response)


def version_key(version: str) -> tuple:
    core = version.split("-", 1)[0]
    parts = []
    for piece in core.split("."):
        parts.append(int(piece) if piece.isdigit() else 0)
    return tuple(parts) + ((0,) if "-" in version else (1,))


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__.strip())
        return 2
    advisory_id, package = sys.argv[1], sys.argv[2]
    candidate = sys.argv[3] if len(sys.argv) > 3 else None

    vuln = get_json(f"https://api.osv.dev/v1/vulns/{urllib.parse.quote(advisory_id)}")
    print(f"advisory   {vuln.get('id')} aliases={vuln.get('aliases', [])}")
    print(f"summary    {vuln.get('summary', '')}")
    print(f"published  {vuln.get('published')}  modified {vuln.get('modified')}")

    fixed: list[str] = []
    last_affected: list[str] = []
    for affected in vuln.get("affected", []):
        if affected.get("package", {}).get("name") != package:
            continue
        for rng in affected.get("ranges", []):
            events = rng.get("events", [])
            print(f"range      {rng.get('type')}: {events}")
            for event in events:
                if "fixed" in event:
                    fixed.append(event["fixed"])
                if "last_affected" in event:
                    last_affected.append(event["last_affected"])
    if not fixed and not last_affected:
        print(f"no range for package {package!r} in this advisory")
        return 1

    if candidate is None:
        print("fixed in   " + (", ".join(fixed) if fixed else "none named"))
        return 0

    registry = get_json(f"https://registry.npmjs.org/{urllib.parse.quote(package, safe='@')}")
    released = registry.get("time", {}).get(candidate)
    print(f"candidate  {candidate} released {released}; latest={registry.get('dist-tags', {}).get('latest')}")

    if any(version_key(candidate) >= version_key(f) for f in fixed):
        print("verdict    FIXED: the candidate is at or above a `fixed` event")
        return 0
    if last_affected and all(version_key(candidate) > version_key(v) for v in last_affected):
        print(
            "verdict    NOT PROVEN: the range ends with `last_affected`, so being outside it "
            "proves nothing. Look for release notes or a commit naming the advisory, or diff "
            "the referenced code (npm-diff.sh)."
        )
        if released and vuln.get("published") and released > vuln["published"]:
            print("note       the candidate came out after the advisory: check whether it was the fix")
        return 0
    print("verdict    AFFECTED: the candidate is inside the vulnerable range")
    return 0


if __name__ == "__main__":
    sys.exit(main())
