# Verifying the claims of an audit report

One recipe per kind of claim. Save every answer under `audit/fonti/` before reading it, and print only the lines you need. Downloads (tarballs, clones, pages) go into a new empty folder each; run Python with `-I`.

## Package versions (npm, JSR, PyPI…)

- npm: `curl -sS https://registry.npmjs.org/<name> -o fonti/npm-<name>.json`, then read `dist-tags`, `time[<version>]`, `deprecated`. JSR: `https://jsr.io/@<scope>/<name>/meta.json`. PyPI: `https://pypi.org/pypi/<name>/json`.
- "Latest" means the `latest` dist-tag, not the highest number: a `next` or `next-12` tag is not latest.
- Respect the project's minimum release age (pnpm `minimumReleaseAge`, Renovate `minimumReleaseAge`): a version younger than that is not advised.
- A package manager pinned in `package.json` (`packageManager`) may also be recorded in the lockfile: bump it through the tool (`pnpm install`, `pnpm self-update`), check that only the expected lines of the lockfile changed, and that the frozen install passes.

## Security advisories and audit exceptions

`python3 -I scripts/advisory-check.py <GHSA-or-CVE> <package> [candidate-version]` prints the ranges, the events, the publication date and the candidate's release date.

- A range with a `fixed` event (or a `first_patched_version`) names the fix: a version at or above it is fixed.
- A range ending in `last_affected` (`<= X`) does **not** name a fix. X is often just the latest version on the day the advisory was written. A later version is outside the range and the audit stops complaining, but that proves nothing. Accept it as fixed only if the release notes or the fixing commit name the advisory, its CVE or the defect, or if the code the advisory references changed: `bash scripts/npm-diff.sh <package> <X> <candidate> [file]` and read the referenced function in both.
- An override or resolution that forces a version outside the range only silences the audit. Advise it only with a proof of the fix.
- Release notes that claim security fixes: name each fix by GHSA, CVE or fixing pull request. When the hosting API is closed to you, a partial clone answers: `git clone --filter=blob:none --no-checkout <repo>`, fetch the two tags, `git log A..B --grep='secur\|CVE\|GHSA\|traversal' -i`.

## GitHub Actions

`bash scripts/action-refs.sh <owner>/<repo> <ref>...` lists the latest tags, the commit of each ref, and `runs.using` in `action.yml` at each ref.

- A moving major tag (`v6`) may lag behind the latest release (`v6.1.0`). If it does, `@v6` installs the older one: pin the release's commit SHA, with the version in a comment.
- Read `runs.using` at the pinned ref and at the advised one. A runtime GitHub deprecated is "plan", not "already failing", unless GitHub says it fails.
- List the breaking changes between the version in use and the advised one from the release notes or the commit log; check them against the inputs the workflow uses.
- A workflow change is verified only when CI runs: say so.

## AI models, aliases and deprecations

- Read the vendor's model page and changelog. When a fetch tool truncates a long page (version tables, changelogs), download it with `curl -sSL` and extract the passage with Python.
- An alias (`-latest`) is a moving target: find what it resolves to today on the vendor page, and pin that version if the project records a price for it.
- Recorded fixtures prove what a provider returned; hand-written fixtures prove nothing about the provider. Check the fixtures' README or provenance before using a `model` field in a fixture as evidence.
- A price is a change only against the price the project records (registry file, invoices), not against an older list price.
- A retirement date from the project's own files is not a source: confirm it on the vendor's deprecation page.

## Tools on a developer's machine

- The project cannot see the owner's machine. Claims about installed versions come from an inventory generated there; never regenerate it in a container, because it would record the container's tools.
- Check the identity of a tool before comparing versions (`ant` can be Apache Ant or Anthropic's CLI). If the inventory does not say which project it is, the claim is UNVERIFIABLE and the generator needs an improvement.

## Dates and deadlines

- Compute every "in N days" from today's date. A deadline within about 60 days is due now; within six months is plan.
- Prefer the vendor's dated statement over a blog or a third-party tracker.

## What counts as proof

A proof is a saved file plus the exact passage or output line. "The report says so" is not a proof; neither is a search result snippet without the page.
