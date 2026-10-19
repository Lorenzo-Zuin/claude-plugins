# Report format that `audit-fix` reads best

Any Markdown report works, but a generator (a managed agent, a scheduled job, a bot) that follows this format makes the triage exact instead of inferred. Give this file to whoever writes the generator's instructions.

## Sections

1. First line: the date of the inputs (for example the inventory's `generated_at`).
2. **Act now** (or the project's own name, e.g. «Da fare ora»): vulnerabilities that affect the project, deadlines within about 60 days, audit exceptions that can be removed **with a proof of the fix**.
3. **Plan** («Da pianificare»): majors, end of support within six months, deprecated runtimes, provider changes that need work later, drift.
4. **Ignore** («Si può ignorare»): one line each.
5. **Coverage**: the table of everything checked, folded in `<details>`, with the counts outside it.
6. **Machine-readable block**: last, folded in `<details>`.

## Items

Each item of the first two sections starts with a checkbox, a stable id and who acts:

```markdown
- [ ] **V-2026-10-12-03** · `repo` · **pnpm** (`package.json`, CI): 12.4.2 -> 12.11.2 …
```

- The id is the date of the week the item first appeared plus a number; a carried-over item keeps it.
- Who acts: `repo` (a change in the repository), `pc` (the developer's machine), `pannello` / `console` (a provider console or setting), `decisione` / `decision` (the owner must choose first).
- A ticked box in last week's report means done: the generator checks it and does not carry the item over.

## Machine-readable block

````markdown
<details><summary>Dati per gli strumenti</summary>

```json
[
  {
    "id": "V-2026-10-12-03",
    "section": "ora",
    "owner": "repo",
    "component": "npm:pnpm",
    "where": ["package.json", ".github/workflows/ci.yml"],
    "in_use": "12.4.2",
    "available": "12.11.2",
    "action": "Set packageManager to pnpm@12.11.2 and regenerate the lockfile",
    "files": ["package.json", "pnpm-lock.yaml"],
    "sources": ["https://github.com/pnpm/pnpm/releases/tag/v12.10.0"],
    "proof": "fonti/gh/pnpm-releases.json"
  }
]
```

</details>
````

`section` is `ora` / `now` or `pianificare` / `plan`. Nothing in the block that the prose does not say.

## Rules worth putting in the generator's instructions

- A version outside an advisory range that ends in `<=` is not a fix. Require a `fixed` event, release notes naming the advisory, or a diff of the referenced code before advising to drop an exception.
- Name each security fix by GHSA, CVE or fixing pull request, one link each.
- For a GitHub Action, resolve the moving major tag; if it lags behind the latest release, give the release's commit SHA.
- When a fetch tool truncates a page, download it with `curl` and extract the passage: truncation is not a reason for "not verified".
- Identify each tool by its project, not only by its command name.
- Evidence before urgency: a deprecation is "plan" with its date; "already failing" needs a source that says it fails.
