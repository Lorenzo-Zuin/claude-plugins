#!/usr/bin/env bash
# Diff two published versions of an npm package, straight from the registry tarballs.
# Usage: bash npm-diff.sh <package> <old-version> <new-version> [path-inside-package]
# Example: bash npm-diff.sh http-cache-semantics 4.2.0 4.3.0 index.js
# The tarballs are untrusted data: they are only unpacked and compared, never executed.
set -euo pipefail

if [ "$#" -lt 3 ]; then
  sed -n '2,5p' "$0"
  exit 2
fi
package="$1"
old="$2"
new="$3"
path="${4:-}"
base="${package##*/}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
mkdir -p "$work/old" "$work/new"

curl -fsSL "https://registry.npmjs.org/${package}/-/${base}-${old}.tgz" -o "$work/old.tgz"
curl -fsSL "https://registry.npmjs.org/${package}/-/${base}-${new}.tgz" -o "$work/new.tgz"
tar -xzf "$work/old.tgz" -C "$work/old"
tar -xzf "$work/new.tgz" -C "$work/new"

echo "files changed between ${old} and ${new}:"
diff -rq "$work/old/package" "$work/new/package" | sed "s#$work/##g" || true
echo
if [ -n "$path" ]; then
  diff -u "$work/old/package/$path" "$work/new/package/$path" | sed "s#$work/##g" || true
fi
