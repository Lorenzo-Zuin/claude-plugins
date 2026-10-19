#!/usr/bin/env bash
# What a GitHub Action ref really points to, read from git (no API token needed).
# Usage: bash action-refs.sh <owner/repo> [ref...]
# Example: bash action-refs.sh pnpm/action-setup v4 v6 v6.1.0
# Prints the latest tags, then for each ref: the commit, the tags on that commit, its date and
# `runs.using` from action.yml. A moving major tag (v6) that lags behind the latest release
# installs the older release: pin the release's commit SHA instead.
set -euo pipefail

if [ "$#" -lt 1 ]; then
  sed -n '2,7p' "$0"
  exit 2
fi
repo="$1"
shift

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
GIT_LFS_SKIP_SMUDGE=1 git clone -q --filter=blob:none --no-checkout "https://github.com/${repo}" "$work/repo"
cd "$work/repo"

echo "latest tags:"
git tag -l | sort -V | tail -8 | sed 's/^/  /'
echo

for ref in "$@"; do
  commit="$(git rev-parse --verify -q "${ref}^{commit}" || true)"
  if [ -z "$commit" ]; then
    echo "${ref}: not found"
    continue
  fi
  tags="$(git tag --points-at "$commit" | sort -V | tr '\n' ' ')"
  date="$(git log -1 --format=%cs "$commit")"
  using="$(git show "${commit}:action.yml" 2>/dev/null | sed -n 's/^ *using: *//p' | tr -d '"' | head -1)"
  [ -n "$using" ] || using="$(git show "${commit}:action.yaml" 2>/dev/null | sed -n 's/^ *using: *//p' | tr -d '"' | head -1)"
  echo "${ref}: ${commit} (${date}) tags: ${tags:-none} runs.using: ${using:-unknown}"
done
