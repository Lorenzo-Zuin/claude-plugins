# Brief

## Template

If `## Orchestration` names a brief template, fill that one instead: its premise table has the same format. Otherwise:

```markdown
# Task <n>: <goal in one sentence>

- Work item: <id, if the project has one> · Acceptance criteria covered: <ids>
- Allowed paths: … · Forbidden paths: …

## Premise
| Today the code… | file:line | Excerpt |
|---|---|---|
| keeps the plan limits in one object | `src/plans.ts:42` | `export const LIMITS = {`<br>`free: 3,` |

- Contracts: (in full, when another agent produces them)
- Settled decisions: (not to reopen; yours as `decision: what, why, cost if wrong`)
- Verification: for each acceptance criterion, the test to write or run, the command, the expected output
- Shared resources: which ones it may use, which not
- When to stop: …; minimum acceptable result if it stops early
- First step: confirm or refute every premise, before editing a file.
- Report: in `<work folder>/task-<n>.md`, status on the first line; reply with status, commits and one line on tests.
```

For a defect add `file:line`, the scenario and the expected fix as premises and acceptance criteria. Write only what the agent cannot find in CLAUDE.md.

## Premise table

A premise is what the brief takes for true about today's code: where a value is read, a signature, a current behaviour. One row each. The format is fixed, because a project script may check it (`Premise check` in `## Orchestration`):

- The heading is `Premise`, exactly that word, singular, level 1 to 4 (`## Premise`). The table starts under it; the first line after the table that does not start with `|`, or the next heading, ends it.
- Three columns: claim, location, excerpt. The header row and the `|---|` row are ignored.
- Location: `path:line` or `path:start-end`, path from the repository root, optionally in backticks. A row whose location is not in this form is skipped silently, so the claim goes unchecked: check every location.
- Excerpt: one to three consecutive lines copied from the file you just read, joined with `<br>`, each line optionally in backticks (double backticks if the code has one). Each excerpt line must be contained in its code line, spaces aside; the first one within five lines of the line given. A `|` inside a cell is written `\|`.
- Copy excerpts from a fresh read, never from memory or from an `explore` report without opening the file.
- Do not list closed lists by hand in the premises when the project's tests already compare them with the code: name the test instead.

## Files and sending

- Work folder: the one `## Orchestration` names (fill its placeholders as that line says). Without it, the session scratchpad. Without either, the brief goes only in the prompt and the report comes back in the reply.
- Write the brief to `<work folder>/task-<n>-brief.md` and the report path in it (`<work folder>/task-<n>.md`, unless the project template names another).
- If `## Orchestration` names a premise check, run it on the brief file. A false or old premise is fixed in the brief before sending, not passed on.
- Send the brief's full text as the prompt, not just its path: a project hook on the delegation reads the prompt, and the agent saves a read.

## Decisions

A minor ambiguity (reversible, inside the scope, no product, data or cost consequence) you decide yourself and write as `decision: what, why, cost if wrong`: in the brief under settled decisions, and where `## Orchestration` says decisions go (otherwise in the final summary). Ask the user only for product choices, irreversible steps, data, money and security.
