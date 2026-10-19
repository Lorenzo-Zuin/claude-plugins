# Plan templates (fallback, when `Templates:` has no `plan.md`)

Write headings in the project's language unless its template says otherwise. The premise heading must be one the `Premise check:` command finds (in the reference flow, a heading that starts with `Premise`, levels 1-4).

## Lane L: `plan.md` in the work item folder

```markdown
# Technical plan: <title> (#<issue>)

## Premise
| Today the code… | file:line | Excerpt (at most 3 lines) |
|---|---|---|

## Design
Data, row-level rules, functions, contracts in full, translation keys, notifications, usage records, plan checks.

## Development data
| Screen state | Data user | Rows to add or change |
|---|---|---|

## Readers of new values
| New value | Who reads it (file:line) | Where it shows |
|---|---|---|

## Twin predicates
| Function | Twin | Equivalence test |
|---|---|---|

## Compatibility and release
Installed apps against the new server. Release fragment.

## Test plan
| Acceptance criterion | Evidence |
|---|---|

## Critical points
The five likeliest ways to get it wrong that no test covers yet, each with its test or acceptance criterion.

## Tasks
| # | Folders | Depends on | Acceptance criteria | Who |
|---|---|---|---|---|
```

## Lane M: `## Plan` of the worklog

The same parts, short; a part that does not apply is one line with the reason. Compatibility is mandatory when there is a migration. The premise table needs its own heading inside `## Plan`, one level down (`### Premise`), so the premise check finds it.

```markdown
## Plan
### Premise
| Today the code… | file:line | Excerpt |
|---|---|---|

**Design.** …
**Development data.** …
**Readers of new values.** none: no new value · or a short table
**Twin predicates.** none · or the pair and its test
**Compatibility and release.** …
**Test plan.** S1 → <test>; S2 → <test> …
**Critical points.** 1 … (→ S4) · 2 … (→ test <name>)
**Tasks.** 1 <folders> (S1, S2) · 2 <folders>, after 1 (S3)
```

## What makes each part good

- **Design**: contracts in full (signatures, columns, JSON shapes), not "add a function for X". Name what stays unchanged when a reader could fear it changes.
- **Development data**: per screen state, not per table. "Month screen, many: U1 has 12 expenses this month" beats "add expenses".
- **Readers**: found by search, with `file:line`; "none found" with the search you ran.
- **Compatibility**: say what an app built before this change does against the server after it, and the order of deploy.
- **Test plan**: every acceptance criterion appears once; a test name or file that will exist after P4.
- **Critical points**: concrete ("the month boundary at 23:30 local time puts a row in the next month"), each tied to a test or criterion.
- **Tasks**: by folder, one owner each, dependencies explicit, small enough to verify alone.
